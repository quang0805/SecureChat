// authService.ts
import api from "@/lib/axios";
import axios from "axios";
export const authService = {
    signUp: async (
        username: string,
        password: string,
        firstName: string,
        lastName: string,
        pubKeyStr: string,
        privKeyStr: string
    ) => {
        const res = await api.post(
            "/auth/signup",
            { username, password, display_name: `${firstName} ${lastName}`, public_key: pubKeyStr, encrypted_private_key: privKeyStr },
            { withCredentials: true }
        )
        return res.data;
    },
    signIn: async (
        username: string,
        password: string
    ) => {
        const formData = new URLSearchParams()
        formData.append('username', username)
        formData.append('password', password)

        const res = await api.post(
            "/auth/signin",
            formData.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
        return res.data
    },
    fetchMe: async () => {
        const res = await api.get(
            "/users/me"
        )
        return res.data

    },
    updateDisplayName: async (newName: string) => {
        const res = await api.patch(`/users/me?display_name=${newName}`);
        return res.data;
    },
    uploadToCloudinary: async (file: File) => {
        const cloudName = "detmos3za";
        const uploadPreset = "secure_chat";

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        // Gửi ảnh avatar lên cloud dinary.
        const res = await axios.post(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            formData
        );
        return res.data.secure_url;
    },
    updateAvatarUrl: async (url: string) => {
        // Gửi Link ảnh về Backend.
        const res = await api.patch(`/users/me/avatar`, { avatar_url: url });
        return res.data;
    },

}