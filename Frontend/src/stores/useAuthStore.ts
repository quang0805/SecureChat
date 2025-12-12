import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "sonner"
import { authService } from "@/services/authService"
import type { AuthState } from "@/types/store"
import { useChatStore } from "./useChatStore"

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            loading: false,

            clearState: () => {
                set({ accessToken: null, user: null, loading: false })
                localStorage.clear()
                useChatStore.getState().reset()
            },

            signUp: async (username, password, firstName, lastName) => {

                try {
                    set({ loading: true })
                    const res = await authService.signUp(username, password, firstName, lastName)
                    console.log(res.data)
                    toast.success("Đăng ký thành công!")
                } catch (error) {
                    console.error(error);
                    toast.error("Đăng ký không thành công!")
                    throw error
                } finally {
                    set({ loading: false })
                }
            },

            signIn: async (username, password) => {
                try {
                    set({ loading: true })
                    localStorage.clear()
                    useChatStore.getState().reset()
                    const { access_token } = await authService.signIn(username, password)

                    // Lưu token vào state
                    set({ accessToken: access_token })
                    await get().fetchMe()
                    useChatStore.getState().fetchConversation()

                    toast.success("Đăng nhập thành công!")
                } catch (error) {
                    console.error(error)
                    toast.error("Đăng nhập thất bại!")
                    throw error
                } finally {
                    set({ loading: false })
                }
            },

            logOut: () => {
                get().clearState()
            },

            fetchMe: async () => {
                try {
                    set({ loading: true })
                    const user = await authService.fetchMe()
                    set({ user })
                } catch (error) {
                    console.error(error)
                    toast.error("Phiên đăng nhập hết hạn hoặc lỗi hệ thống")
                    get().clearState()
                } finally {
                    set({ loading: false })
                }
            }
        }),
        {
            name: "auth-storage",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                accessToken: state.accessToken,
                user: state.user
            }),
        }
    )
)