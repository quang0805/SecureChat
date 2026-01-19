// src/services/chatService.ts
import api from "@/lib/axios";
import type {
    Conversation,
    Message,
    CreateConversationPayload,
    SendMessagePayload
} from "@/types/chat";
import type { User } from "@/types/user";

export const chatService = {
    // 1. Lấy danh sách các cuộc hội thoại
    async fetchConversations(): Promise<Conversation[]> {
        const res = await api.get("/conversations");
        return res.data;
    },

    // 2. Lấy lịch sử tin nhắn trong một cuộc hội thoại
    async fetchMessages(conversation_id: string, skip = 0, limit = 100): Promise<Message[]> {
        const res = await api.get(`/conversations/${conversation_id}/messages`, {
            params: { skip, limit }
        });
        return res.data;
    },

    // 3. Gửi tin nhắn mới (Sử dụng Payload của Double Ratchet)
    async sendMessage(conversationId: string, payload: SendMessagePayload): Promise<Message> {
        const res = await api.post(`/conversations/${conversationId}/messages`, payload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        return res.data;
    },

    // 4. Lấy trạng thái bánh răng đã mã hóa từ Server (Dùng khi F5 hoặc đổi máy)
    async getRatchetState(conversationId: string): Promise<{ encrypted_ratchet_state: string | null }> {
        const res = await api.get(`/conversations/${conversationId}/ratchet-state`);
        return res.data;
    },

    // 5. Cập nhật trạng thái bánh răng mới lên Server (Gọi sau mỗi tin nhắn gửi/nhận)
    async updateRatchetState(conversationId: string, encrypted_ratchet_state: string): Promise<any> {
        const res = await api.patch(`/conversations/${conversationId}/ratchet-state`, {
            encrypted_ratchet_state
        });
        return res.data;
    },

    // 6. Lấy danh sách ID của các người dùng đang trực tuyến
    async fetchUsersOnline(): Promise<string[]> {
        const res = await api.get('/users/online');
        return res.data;
    },

    // 7. Tìm kiếm người dùng bằng username (Global Search)
    async searchUsers(query: string): Promise<User[]> {
        if (!query.trim()) return [];
        const res = await api.get(`/users/search`, {
            params: { q: query }
        });
        return res.data;
    },

    // 8. Tạo cuộc hội thoại mới (Thường gọi sau khi search và click vào User)
    async createConversation(payload: CreateConversationPayload): Promise<Conversation> {
        const res = await api.post(`/conversations`, payload);
        return res.data;
    }
};