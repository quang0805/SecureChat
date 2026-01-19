// src/services/authService.ts
import api from "@/lib/axios";
import axios from "axios";
import type { User } from "@/types/user";

export const authService = {
    // 1. Đăng ký tài khoản mới với các khóa định danh ECDH
    signUp: async (
        username: string,
        password: string,
        firstName: string,
        lastName: string,
        identityKeyPub: string, // Khóa ECDH công khai cho Double Ratchet
        encryptedPrivKey: string // Khóa ECDH bí mật đã mã hóa bằng Master Key (mật khẩu)
    ): Promise<User> => {
        const res = await api.post(
            "/auth/signup",
            {
                username,
                password,
                display_name: `${firstName} ${lastName}`,
                identity_key_pub: identityKeyPub,
                encrypted_private_key: encryptedPrivKey
            }
        );
        return res.data;
    },

    // 2. Đăng nhập hệ thống (Sử dụng OAuth2 Password Flow)
    signIn: async (username: string, password: string): Promise<{ access_token: string, token_type: string }> => {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const res = await api.post(
            "/auth/signin",
            formData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return res.data;
    },

    // 3. Lấy thông tin người dùng hiện tại (Kèm các chuỗi khóa để khôi phục bánh răng)
    fetchMe: async (): Promise<User> => {
        const res = await api.get("/users/me");
        return res.data;
    },

    // 4. Cập nhật tên hiển thị
    updateDisplayName: async (newName: string): Promise<User> => {
        const res = await api.patch(`/users/me`, null, {
            params: { display_name: newName }
        });
        return res.data;
    },

    // 5. Upload tệp lên Cloudinary (Dùng chung cho cả Avatar và Tin nhắn ảnh mã hóa)
    uploadToCloudinary: async (file: File | Blob): Promise<string> => {
        const cloudName = "detmos3za"; // Cloud Name của bạn
        const uploadPreset = "secure_chat"; // Upload Preset (phải để Unsigned)

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        // Gọi trực tiếp đến API Cloudinary (không cần Header Authorization của backend mình)
        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );

        return res.data.secure_url; // Trả về link https
    },

    // 6. Cập nhật đường dẫn Avatar trong Database người dùng
    updateAvatarUrl: async (url: string): Promise<User> => {
        const res = await api.patch(`/users/me/avatar`, { avatar_url: url });
        return res.data;
    }
};