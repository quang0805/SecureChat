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
            setActiveConversation: (id) => {
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