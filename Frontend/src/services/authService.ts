// authService.ts
import api from "@/lib/axios";
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
                },
                withCredentials: true
            }
        )
        return res.data
    },
    fetchMe: async () => {
        const res = await api.get(
            "/users/me",
            {
                withCredentials: true
            }
        )
        return res.data
    }
}