import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { chatService } from "@/services/chatService";
import { toast } from "sonner";

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
                try {
                    set({ loading: true });
                    await chatService.sendMessage(conversationId, content);
                } catch (error) {
                    ;
                    console.log(error)
                    toast.error("Không gửi được tin nhắn!");
                } finally {
                    set({ loading: false });
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