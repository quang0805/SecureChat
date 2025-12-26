// useChatStore.ts
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chatService";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";
import type { Message } from "@/types/chat";
import { cryptoUtils } from "@/lib/cryptoUtils";

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false,
            messageLoading: false,
            onlineUserIds: [],
            setActiveConversationId: (id) => {
                set({
                    activeConversationId: id
                })
            },
            reset: () => {
                set({
                    conversations: [],
                    messages: {},
                    activeConversationId: null,
                    loading: false
                })
            },
            fetchConversation: async () => {
                try {
                    set({ loading: true });
                    const result = await chatService.fetchConversations();
                    set({ conversations: result });
                    console.log(result);
                } catch (error) {
                    console.error(error);
                    toast.error("Không lấy được dữ liệu các cuộc hội thoại");
                } finally {
                    set({ loading: false });
                }
            },
            fetchMessages: async (conversation_id) => {
                if (get().messageLoading) return;
                if (get().messages[conversation_id] !== undefined) {
                    return;
                }


                try {
                    set({ messageLoading: true });
                    // if (get().messages[conversation_id] && get().messages[conversation_id].length > 0) {
                    //     return;
                    // }

                    if (conversation_id != null) {
                        const result = await chatService.fetchMessages(conversation_id);
                        // Giải mã toàn bộ danh sách tin nhắn trước khi lưu vào store
                        const decryptedMessages = await Promise.all(result.map(async (msg) => {
                            try {
                                // Logic giải mã tương tự như handleIncomingMessage
                                if (msg.encrypted_aes_key && msg.iv) {
                                    const currentUser = useAuthStore.getState().user;
                                    const privKeyStr = localStorage.getItem(`priv_key_${currentUser?.username}`);
                                    const myPrivateKey = await cryptoUtils.importKey(privKeyStr!, "private");
                                    const plainText = await cryptoUtils.decryptMessage(
                                        msg.content, msg.encrypted_aes_key, msg.iv, myPrivateKey
                                    );
                                    return { ...msg, content: plainText };
                                }
                                return msg;
                            } catch (e) {
                                return { ...msg, content: "[Lỗi giải mã]" };
                            }
                        }));

                        set({
                            messages: {
                                ...get().messages,
                                [conversation_id]: decryptedMessages
                            }
                        });
                    }
                } catch (error) {
                    console.error(error);
                    toast.error("Không tải được tin nhắn!");
                } finally {
                    set({ messageLoading: false })
                }
            },
            sendMessage: async (conversationId, content) => {
                const currentUser = useAuthStore.getState().user
                if (!currentUser) return;
                // 1. Tìm thông tin người nhận để lấy Public Key
                const currentConvo = get().conversations.find(c => c.id === conversationId);
                const recipient = currentConvo?.participants?.find(p => p.id !== currentUser.id);

                if (!recipient?.public_key) {
                    toast.error("ERROR: chưa lấy được khóa công khai của người nhận!");
                    return;
                }
                const tempId = `temp-${Date.now()}`;
                const optimisticMessage = {
                    id: tempId,
                    content: content,
                    content_type: 'text',
                    conversation_id: conversationId,
                    sender_id: currentUser!.id,
                    sender: currentUser!,
                    created_at: new Date().toISOString(),
                    encrypted_aes_key: null,
                    iv: null
                };

                set((state) => {
                    const currentMessages = state.messages[conversationId] || [];
                    return {
                        messages: {
                            ...state.messages,
                            [conversationId]: [...currentMessages, optimisticMessage]
                        }
                    };
                });

                try {
                    // Thực hiện mã hóa dữ liệu trước khi gửi API.
                    const encryptedData = await cryptoUtils.encryptMessage(content, recipient.public_key);
                    const payload = {
                        content: encryptedData.ciphertext,
                        encrypted_aes_key: encryptedData.encryptedAesKey,
                        iv: encryptedData.iv,
                        content_type: "text"
                    };


                    const result = await chatService.sendMessage(conversationId, payload);
                    get().updateLastMessage(result);
                    set((state) => {
                        const currentMessages = state.messages[conversationId] || [];

                        const updatedMessages = currentMessages.map((msg) =>
                            msg.id === tempId ? result : msg
                        );

                        return {
                            messages: {
                                ...state.messages,
                                [conversationId]: updatedMessages
                            }
                        };
                    });

                } catch (error) {
                    console.error(error);
                    toast.error("Không gửi được tin nhắn!");

                    set((state) => {
                        const currentMessages = state.messages[conversationId] || [];
                        return {
                            messages: {
                                ...state.messages,
                                [conversationId]: currentMessages.filter(msg => msg.id !== tempId)
                            }
                        };
                    });
                }
            },
            handleIncomingMessage: async (message: Message) => {
                const currentUser = useAuthStore.getState().user;
                const conversationId = message.conversation_id;

                try {
                    let displayContent = message.content;

                    // Nếu tin nhắn không phải do mình gửi, thì mới cần giải mã
                    // (Nếu do mình gửi, content trong store đã là text thuần từ bước sendMessage rồi)
                    if (message.sender_id !== currentUser?.id) {
                        // 1. Lấy Private Key của mình từ LocalStorage
                        const privKeyStr = localStorage.getItem(`priv_key_${currentUser?.username}`);
                        if (!privKeyStr) throw new Error("Missing Private Key");

                        const myPrivateKey = await cryptoUtils.importKey(privKeyStr, "private");

                        // 2. Giải mã nội dung
                        displayContent = await cryptoUtils.decryptMessage(
                            message.content,
                            message.encrypted_aes_key!,
                            message.iv!,
                            myPrivateKey
                        );
                    }

                    const decryptedMessage = { ...message, content: displayContent };

                    // 3. Cập nhật vào State
                    get().updateLastMessage(decryptedMessage);
                    set((state) => {
                        const currentMessages = state.messages[conversationId] || [];
                        if (currentMessages.some(m => m.id === message.id)) {
                            return state;
                        }
                        return {
                            messages: {
                                ...state.messages,
                                [conversationId]: [...currentMessages, decryptedMessage]
                            }
                        };
                    });
                } catch (err) {
                    console.error("Lỗi giải mã tin nhắn đến:", err);
                    // Nếu lỗi, vẫn hiển thị tin nhắn nhưng ghi chú là không thể giải mã
                    const errorMessage = { ...message, content: "[Tin nhắn mã hóa - Không thể giải mã]" };
                    set((state) => ({
                        messages: {
                            ...state.messages,
                            [conversationId]: [...(state.messages[conversationId] || []), errorMessage]
                        }
                    }));
                }
            },
            updateLastMessage: (message: Message) => {
                const conversationId = message.conversation_id;
                set((state) => {
                    const conversation = state.conversations.find((convo) => convo.id === conversationId);
                    if (!conversation) {
                        return state;
                    }

                    // Cập nhật tin nhắn cuối cùng của cuộc hội thoại.
                    const updatedConversation = {
                        ...conversation,
                        last_message: message
                    }

                    const otherConversations = state.conversations.filter((convo) => convo.id !== conversationId);

                    return {
                        conversations: [updatedConversation, ...otherConversations]
                    }


                })
            },
            handleUserStatusChange: (userId, status) => {
                set((state) => {
                    const currentList = state.onlineUserIds;

                    if (status === 'online') {
                        if (!currentList.includes(userId)) {
                            return { onlineUserIds: [...currentList, userId] }; // Nếu online => thêm id vào danh sách người online
                        }
                    } else {
                        return { onlineUserIds: currentList.filter(id => id !== userId) }; // Nếu offline => xóa id khỏi danh sách
                    }
                    return state;
                });
            },
            setOnlineUsers: (ids) => set({ onlineUserIds: ids }),
            fetchUsersOnline: async () => {
                try {
                    const usersOnlineIds = await chatService.fetchUsersOnline();
                    if (!usersOnlineIds) return;
                    get().setOnlineUsers(usersOnlineIds);
                } catch (error) {
                    console.log(error)
                }
            }
        }),

        {
            name: "chat-storage",
            partialize: (state) => ({
                conversations: state.conversations
            })
        }
    )
)