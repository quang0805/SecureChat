// useChatStore.ts
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chatService";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";
import type { Conversation, Message } from "@/types/chat";
import { cryptoUtils } from "@/lib/cryptoUtils";
import api from "@/lib/axios";
import type { User } from "@/types/user";

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
            // CẦN TỐI ƯU LOGIC DECRYPT MESSAGE GIỮA CÁC HÀM : 29-12-2025
            fetchConversation: async () => {
                try {
                    set({ loading: true });
                    const result = await chatService.fetchConversations();

                    const currentUser = useAuthStore.getState().user;
                    if (!currentUser) {
                        set({ conversations: result });
                        return;
                    }

                    // 1. Lấy Private Key từ LocalStorage để sẵn sàng giải mã
                    const privKeyStr = localStorage.getItem(`priv_key_${currentUser.username}`);

                    if (!privKeyStr) {
                        set({ conversations: result });
                        return;
                    }

                    const myPrivateKey = await cryptoUtils.importKey(privKeyStr, "private");

                    // 2. Duyệt qua từng cuộc hội thoại để giải mã last_message
                    const decryptedConversations = await Promise.all(result.map(async (convo) => {
                        const lastMsg = convo.last_message;

                        // Nếu không có tin nhắn cuối hoặc tin nhắn không có thông tin E2EE
                        if (!lastMsg || !lastMsg.iv) {
                            return convo;
                        }

                        try {
                            // 3. Xác định dùng chìa khóa nào (người gửi hay người nhận)
                            const aesKeyToDecrypt = (lastMsg.sender_id === currentUser.id)
                                ? lastMsg.encrypted_aes_key_sender
                                : lastMsg.encrypted_aes_key;

                            if (aesKeyToDecrypt) {
                                const plainText = await cryptoUtils.decryptMessage(
                                    lastMsg.content,
                                    aesKeyToDecrypt,
                                    lastMsg.iv,
                                    myPrivateKey
                                );

                                // Trả về conversation với nội dung last_message đã giải mã
                                return {
                                    ...convo,
                                    last_message: {
                                        ...lastMsg,
                                        content: plainText
                                    }
                                };
                            }
                        } catch (error) {
                            console.error(`Lỗi giải mã last_message cho convo ${convo.id}:`, error);
                            return {
                                ...convo,
                                last_message: {
                                    ...lastMsg,
                                    content: "[Tin nhắn mã hóa]"
                                }
                            };
                        }
                        return convo;
                    }));

                    set({ conversations: decryptedConversations });
                    console.log("Đã giải mã danh sách hội thoại:", decryptedConversations);

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
                    if (conversation_id != null) {
                        const result = await chatService.fetchMessages(conversation_id);
                        const currentUser = useAuthStore.getState().user;

                        const privKeyStr = localStorage.getItem(`priv_key_${currentUser?.username}`);
                        if (!privKeyStr) throw new Error("Chưa có Private Key để giải mã");
                        const myPrivateKey = await cryptoUtils.importKey(privKeyStr, "private");
                        // Giải mã toàn bộ danh sách tin nhắn trước khi lưu vào store. Store sẽ chỉ lưu plain text. 
                        const decryptedMessages = await Promise.all(result.map(async (msg) => {
                            try {
                                // Kiểm tra tin nhắn gửi hay nhận để lấy khóa message hợp lý. 
                                const aesKeyToDecrypt = (msg.sender_id === currentUser?.id)
                                    ? msg.encrypted_aes_key_sender
                                    : msg.encrypted_aes_key;

                                if (aesKeyToDecrypt && msg.iv) {
                                    const plainText = await cryptoUtils.decryptMessage(
                                        msg.content,
                                        aesKeyToDecrypt,
                                        msg.iv,
                                        myPrivateKey
                                    );
                                    return { ...msg, content: plainText };
                                }
                                return msg;
                            } catch (e) {
                                return { ...msg, content: "[Lỗi giải mã]" };
                            }
                        }
                        ));
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
                const sender = currentConvo?.participants?.find(p => p.id === currentUser.id);

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
                    encrypted_aes_key_sender: null,
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
                    const encryptedAesKeySender = await cryptoUtils.encryptAesKeyForMe(
                        encryptedData.aesKeyRaw, sender?.public_key!
                    )
                    console.log(`Encrypted AES key sender: ${encryptedAesKeySender}`);
                    const payload = {
                        content: encryptedData.ciphertext,
                        encrypted_aes_key: encryptedData.encryptedAesKey,
                        encrypted_aes_key_sender: encryptedAesKeySender,
                        iv: encryptedData.iv,
                        content_type: "text"
                    };


                    const result = await chatService.sendMessage(conversationId, payload);
                    const messageToStore = { ...result, content: content };
                    get().updateLastMessage(messageToStore);

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

                // 1. Kiểm tra trùng lặp (nếu tin nhắn ID này đã có trong store thì bỏ qua luôn)
                const currentMessages = get().messages[conversationId] || [];
                if (currentMessages.some(m => m.id === message.id)) {
                    return;
                }

                try {
                    let displayContent = message.content;

                    // 2. Nếu là tin nhắn của người khác gửi đến -> PHẢI GIẢI MÃ
                    if (message.sender_id !== currentUser?.id) {
                        const privKeyStr = localStorage.getItem(`priv_key_${currentUser?.username}`);
                        if (!privKeyStr) throw new Error("No private key found");

                        const myPrivateKey = await cryptoUtils.importKey(privKeyStr, "private");
                        displayContent = await cryptoUtils.decryptMessage(
                            message.content,
                            message.encrypted_aes_key!,
                            message.iv!,
                            myPrivateKey
                        );
                    } else {
                        // Bổ sung sau, ở đây sẽ giải quyết vấn đề nhiều thiết bị sử dụng
                        return;
                    }

                    const finalMessage = { ...message, content: displayContent };

                    get().updateLastMessage(finalMessage);

                    set((state) => {
                        const messagesInConvo = state.messages[conversationId] || [];
                        return {
                            messages: {
                                ...state.messages,
                                [conversationId]: [...messagesInConvo, finalMessage]
                            }
                        };
                    });
                } catch (err) {
                    console.error("Lỗi xử lý tin nhắn đến:", err);
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
            },
            searchUsers: async (query: string) => {
                try {
                    const result = await chatService.searchUsers(query); // Endpoint backend
                    return result;
                } catch (error) {
                    console.error("Search error", error);
                    return [];
                }
            },
            startConversation: async (targetUser: User) => {

                try {
                    const newConvo = await chatService.createConversation({
                        type: 'private',
                        participant_ids: [targetUser.id]
                    });

                    set((state) => {
                        const isExisted = state.conversations.some(c => c.id === newConvo.id);
                        if (isExisted) {
                            return { activeConversationId: newConvo.id };
                        }

                        return {
                            conversations: [newConvo, ...state.conversations],
                            activeConversationId: newConvo.id
                        };
                    });
                } catch (error) {
                    toast.error("Không thể bắt đầu cuộc trò chuyện");
                }

            },
            handleIncomingNewConversation: (newConvo: Conversation) => {
                set((state) => {
                    if (state.conversations.some(c => c.id === newConvo.id)) return state;
                    return {
                        conversations: [newConvo, ...state.conversations]
                    };
                })
            },
        }),
        {
            name: "chat-storage",
            partialize: (state) => ({
                conversations: state.conversations
            })
        }
    )
)
