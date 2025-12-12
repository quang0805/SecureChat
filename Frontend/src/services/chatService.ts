import api from "@/lib/axios";
import type { Conversation } from "@/types/chat";
import type { Message } from "@/types/chat";

export const chatService = {
    async fetchConversations(): Promise<Conversation[]> {
        const res = await api.get("/conversations");
        return res.data;
    },

    async fetchMessages(conversation_id: string, skip = 0, limit = 50): Promise<Message[]> {
        const res = await api.get(`/conversations/${conversation_id}/messages`,
            {
                params: {
                    skip: skip,
                    limit: limit
                }
            }

        );
        return res.data;
    },

    async sendMessage(conversationId: string, content: string) {
        const data = {
            content: content,
            content_type: "text"
        }
        const res = await api.post(`/conversations/${conversationId}/messages`, data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }

        )
    }
}
