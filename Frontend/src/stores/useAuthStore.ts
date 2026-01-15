// useAuthStore.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "sonner"
import { authService } from "@/services/authService"
import type { AuthState } from "@/types/store"
import { useChatStore } from "./useChatStore"
import { cryptoUtils } from "@/lib/cryptoUtils"

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            loading: false,
            privateKey: null,
            clearState: () => {
                set({ accessToken: null, user: null, loading: false })
                localStorage.clear()
                useChatStore.getState().reset()
            },

            signUp: async (username, password, firstName, lastName) => {

                try {
                    set({ loading: true })
                    // 1. Tạo cặp khóa E2EE
                    const keyPair = await cryptoUtils.generateKeyPair();
                    const pubKeyStr = await cryptoUtils.exportKey(keyPair.publicKey);
                    // 2. Mã hóa Private Key bằng mật khẩu (Key Wrapping)
                    const masterKey = await cryptoUtils.deriveMasterKey(password, username);
                    const { wrappedKey, iv } = await cryptoUtils.wrapPrivateKey(keyPair.privateKey, masterKey);
                    const finalEncryptedPrivKey = `${iv}:${wrappedKey}`;
                    // 3. Gửi kèm Public Key lên Server
                    const res = await authService.signUp(username, password, firstName, lastName, pubKeyStr, finalEncryptedPrivKey);
                    // 4. Lưu Private key vào LocalStorage (hoặc IndexedDB) để dùng sau này
                    localStorage.setItem(`priv_key_${username}`, finalEncryptedPrivKey);
                    console.log(res.data);
                    toast.success("Đăng ký thành công!");
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
                    const user = await authService.fetchMe();

                    if (user.encrypted_private_key) {
                        // 2. Tách IV và Ciphertext
                        const [ivStr, wrappedKeyStr] = user.encrypted_private_key.split(":");

                        // 3. Dùng mật khẩu vừa nhập để tái tạo Master Key
                        const masterKey = await cryptoUtils.deriveMasterKey(password, username);

                        // 4. Giải mã lấy lại Private Key RSA chuẩn
                        const privateKey = await cryptoUtils.unwrapPrivateKey(wrappedKeyStr, ivStr, masterKey);

                        // 5. Xuất ra PEM để lưu vào LocalStorage (Bây giờ xóa đi vẫn lấy lại được từ DB)
                        const privKeyRaw = await cryptoUtils.exportKey(privateKey);
                        localStorage.setItem(`priv_key_${username}`, privKeyRaw);
                    }

                    useChatStore.getState().fetchConversation();
                    toast.success("Đăng nhập thành công!")
                } catch (error) {
                    console.error(error);
                    toast.error("Đăng nhập thất bại!");
                    throw error
                } finally {
                    set({ loading: false });
                }
            },

            logOut: () => {
                get().clearState();
            },

            fetchMe: async () => {
                try {
                    set({ loading: true });
                    const user = await authService.fetchMe();
                    set({ user });
                } catch (error) {
                    console.error(error);
                    toast.error("Phiên đăng nhập hết hạn hoặc lỗi hệ thống");
                    get().clearState();
                } finally {
                    set({ loading: false });
                }
            },
            updateDisplayName: async (newName: string) => {
                try {
                    set({ loading: true });
                    const user = await authService.updateDisplayName(newName);
                    set({ user });
                } catch (error) {
                    console.error(error);
                    toast.error("Không thể cập nhật tên!");
                } finally {
                    set({ loading: false });
                }
            },
            updateAvatar: async (url: string) => {
                try {
                    set({ loading: true });
                    const user = await authService.updateAvatarUrl(url);
                    set({ user });
                } catch (error) {
                    console.log(error);
                    toast.error("Không thể cập nhật avatar!");
                } finally {
                    set({ loading: false });
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