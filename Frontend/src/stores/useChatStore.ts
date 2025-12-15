import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chatService";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";
import type { Message } from "@/types/chat";

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            activeConversationId: null,
            loading: false,
            messageLoading: false,
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
                try {
                    set({ messageLoading: true });
                    if (conversation_id != null) {
                        const result = await chatService.fetchMessages(conversation_id);
                        set({
                            messages: {
                                ...get().messages,
                                [conversation_id]: result
                            }
                        })
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
                const tempId = `temp-${Date.now()}`;

                const optimisticMessage = {
                    id: tempId,
                    content: content,
                    content_type: 'text',
                    conversation_id: conversationId,
                    sender_id: currentUser!.id,
                    sender: currentUser!,
                    created_at: new Date().toISOString(),
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
                    const result = await chatService.sendMessage(conversationId, content);

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
            handleIncomingMessage: (message: Message) => {
                const conversationId = message.conversation_id;
                set((state) => {
                    const currentMessages = state.messages[conversationId] || [];

                    // Kiểm tra tin nhắn đã tồn tại hay chưa, trường hợp nhận 2 lần.
                    if (currentMessages.some(m => m.id === message.id)) {
                        return state;
                    }

                    return {
                        messages: {
                            ...state.messages,
                            [conversationId]: [...currentMessages, message]
                        }
                    };
                });
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