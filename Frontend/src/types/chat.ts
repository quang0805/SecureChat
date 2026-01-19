import type { User } from "./user";

// 1. Participant: Người tham gia trong một cuộc hội thoại
export interface Participant extends User {
    role: "member" | "admin";
    joined_at: string;
    // Trạng thái bánh răng của người này (đã mã hóa) lưu trên DB
    encrypted_ratchet_state?: string | null;
}

// 2. Message: Cấu trúc tin nhắn Double Ratchet
export interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;           // Ciphertext (Base64) hoặc URL Cloudinary
    content_type: "text" | "image";

    // --- HEADER DOUBLE RATCHET ---
    // Trường signature này chúng ta dùng để chứa JSON của MessageHeader
    signature: string | null;
    iv: string | null;         // Initialization Vector cho AES-GCM

    // Các trường hỗ trợ hiển thị/logic
    created_at: string;
    sender: User;              // Thông tin người gửi (để hiện Avatar/Tên)

    // Không dùng nữa trong Double Ratchet (có thể xóa)
    // encrypted_aes_key: string | null;
    // encrypted_aes_key_sender: string | null;
}

// 3. MessageHeader: Cấu trúc dữ liệu đi kèm tin nhắn (lưu trong field signature)
export interface MessageHeader {
    pubKey: string;     // DH Ephemeral Public Key của người gửi
    count: number;      // Chỉ số tin nhắn trong chuỗi hiện tại (n)
    prevCount: number;  // Độ dài của chuỗi gửi trước đó (pn)
    iv: string;         // IV dùng cho AES-GCM
}

// 4. RatchetState: Trạng thái bánh răng lưu trong Zustand và Database
export interface RatchetState {
    rootKey: string;           // Khóa gốc (Base64)
    sendChainKey: string | null;
    recvChainKey: string | null;
    myEphPriv: string;         // DH Ephemeral Private Key hiện tại của mình
    myEphPub: string;          // DH Ephemeral Public Key hiện tại của mình
    theirEphPub: string;       // DH Ephemeral Public Key mới nhất nhận từ đối phương
    sendCount: number;         // Số tin nhắn đã gửi trong chuỗi hiện tại
    recvCount: number;         // Số tin nhắn đã nhận trong chuỗi hiện tại
    prevChainLength: number;   // pn (độ dài chuỗi gửi trước đó)
    // Map lưu các khóa của tin nhắn bị nhảy cóc: { "PubKey-Index": "Base64_Message_Key" }
    pendingRecvKeys: Record<string, string>;
}

// 5. Conversation: Cuộc hội thoại
export interface Conversation {
    id: string;
    type: "private" | "group";
    name: string | null;
    avatar_url: string | null;
    creator_id: string;
    participants: User[];      // Danh sách User (để lấy identity_key_pub)
    last_message: Message | null;
    created_at: string;
    updated_at: string;
}

// 6. API Payloads
export interface ConversationResponse {
    conversations: Conversation[];
}

export interface CreateConversationPayload {
    type: "private" | "group";
    participant_ids: string[];
    name?: string;
}

export interface SendMessagePayload {
    content: string;
    content_type: "text" | "image";
    iv: string;
    signature: string;
    dh_pub_key: string;
    msg_index: number;
}