// user.ts
export interface User {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;

    // --- CÁC TRƯỜNG PHỤC VỤ DOUBLE RATCHET & E2EE ---
    // Khóa định danh công khai (ECDH P-384)
    identity_key_pub: string | null;

    // Khóa bí mật định danh đã bị mã hóa (Wrap) bằng mật khẩu người dùng
    encrypted_private_key: string | null;

    // RSA Public Key (Nếu bạn vẫn muốn giữ để dùng cho mục đích khác như Chữ ký số)
    public_key?: string | null;

    created_at: string;
    updated_at: string;
}

export interface Friend {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    identity_key_pub: string | null;
}

export interface FriendRequest {
    user: User;
    status: "pending" | "accepted" | "declined";
}