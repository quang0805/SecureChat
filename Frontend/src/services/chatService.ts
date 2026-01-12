// chatService.ts
import api from "@/lib/axios";
import type { Conversation } from "@/types/chat";
import type { Message } from "@/types/chat";

export const chatService = {
    async fetchConversations(): Promise<Conversation[]> {
        const res = await api.get("/conversations");
        return res.data;
    },

    async fetchMessages(conversation_id: string, skip = 0, limit = 100): Promise<Message[]> {
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

    async sendMessage(conversationId: string, payload: {
        content: string,
        content_type: string,
        encrypted_aes_key?: string,
        iv?: string
    }) {
        const res = await api.post(`/conversations/${conversationId}/messages`, payload,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        return res.data
    },

    async fetchUsersOnline() {
        const res = await api.get('/users/online');
        return res.data;
    }
}
