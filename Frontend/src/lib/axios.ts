import { useAuthStore } from "@/stores/useAuthStore"
import axios from "axios"

const api = axios.create({
    baseURL: import.meta.env.MODE === "development" ? "http://localhost:8000/api/v1" : "/api/v1",
    withCredentials: true
})

// Gán AccessToken vào request header
api.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState()
    if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
})

// Kieemr tra stus_code trả về, nếu là 401 => logout.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { status, config } = error.response || {};

        if (status === 401) {
            const isLoginRequest = config.url.includes('/signin');
            if (!isLoginRequest) {
                useAuthStore.getState().clearState();
                window.location.href = '/signin';
            }
        }
        return Promise.reject(error);
    }
)

export default api