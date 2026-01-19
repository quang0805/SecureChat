// src/stores/useAuthStore.ts
import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { toast } from "sonner"
import { authService } from "@/services/authService"
import type { AuthState } from "@/types/store"
import { useChatStore } from "./useChatStore"
import { cryptoUtils } from "@/lib/cryptoUtils"
import { drLib } from "@/lib/doubleRatchet"

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            accessToken: null,
            user: null,
            loading: false,

            // Các trường bảo mật chỉ lưu trong RAM (không persist xuống LocalStorage)
            identityPrivateKey: null,
            tempMasterKey: null,

            clearState: () => {
                set({
                    accessToken: null,
                    user: null,
                    loading: false,
                    identityPrivateKey: null,
                    tempMasterKey: null
                })
                localStorage.clear()
                useChatStore.getState().reset()
            },

            signUp: async (username, password, firstName, lastName) => {
                try {
                    set({ loading: true })

                    // 1. Sinh cặp khóa định danh (Identity Key) bằng ECDH P-384
                    const identityKeyPair = await drLib.generateEG();
                    const identityPubKeyStr = await drLib.exportKey(identityKeyPair.pub);

                    // 2. Tạo Master Key từ mật khẩu (PBKDF2) để bảo vệ danh tính
                    const masterKey = await cryptoUtils.deriveMasterKey(password, username);

                    // 3. Gói (Wrap) Private Key định danh lại bằng Master Key
                    const { wrappedKey, iv } = await cryptoUtils.wrapPrivateKey(
                        identityKeyPair.sec,
                        masterKey
                    );
                    const finalEncryptedPrivKey = `${iv}:${wrappedKey}`;

                    // 4. Gửi thông tin lên Server
                    // identity_key_pub dùng để người khác bắt tay (handshake)
                    // encrypted_private_key dùng để mình khôi phục khi đổi máy
                    await authService.signUp(
                        username,
                        password,
                        firstName,
                        lastName,
                        identityPubKeyStr,
                        finalEncryptedPrivKey
                    );

                    toast.success("Đăng ký tài khoản bảo mật thành công!");
                } catch (error) {
                    console.error("SignUp Error:", error);
                    toast.error("Đăng ký không thành công!");
                    throw error
                } finally {
                    set({ loading: false })
                }
            },

            signIn: async (username, password) => {
                try {
                    set({ loading: true })

                    // Xóa sạch trạng thái cũ trước khi nạp tài khoản mới
                    useChatStore.getState().reset()

                    const { access_token } = await authService.signIn(username, password)
                    set({ accessToken: access_token })

                    // 1. Lấy thông tin User đầy đủ từ Server (bao gồm các chuỗi khóa)
                    const user = await authService.fetchMe();
                    set({ user });

                    if (user.encrypted_private_key) {
                        // 2. Tái tạo Master Key từ mật khẩu vừa nhập
                        const masterKey = await cryptoUtils.deriveMasterKey(password, username);
                        set({ tempMasterKey: masterKey });

                        // 3. Giải mã lấy lại Identity Private Key (CryptoKey object)
                        const [ivStr, wrappedKeyStr] = user.encrypted_private_key.split(":");
                        const privKeyObject = await cryptoUtils.unwrapPrivateKey(
                            wrappedKeyStr,
                            ivStr,
                            masterKey
                        );
                        set({ identityPrivateKey: privKeyObject });

                        // 4. Lưu bản backup Base64 vào LocalStorage (giúp truy cập nhanh)
                        const privKeyRaw = await drLib.exportKey(privKeyObject);
                        localStorage.setItem(`ident_priv_${username}`, privKeyRaw);
                    }

                    // Tải danh sách hội thoại sau khi đã có khóa giải mã
                    await useChatStore.getState().fetchConversation();

                    toast.success("Chào mừng trở lại! Hệ thống mã hóa đã sẵn sàng.");
                } catch (error) {
                    console.error("SignIn Error:", error);
                    toast.error("Đăng nhập thất bại. Kiểm tra lại tài khoản/mật khẩu.");
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
                    get().clearState();
                } finally {
                    set({ loading: false });
                }
            },

            updateDisplayName: async (newName: string) => {
                try {
                    set({ loading: true });
                    const updatedUser = await authService.updateDisplayName(newName);
                    set({ user: updatedUser });
                    toast.success("Đã cập nhật tên hiển thị");
                } catch (error) {
                    toast.error("Lỗi cập nhật tên");
                } finally {
                    set({ loading: false });
                }
            },

            updateAvatar: async (url: string) => {
                try {
                    set({ loading: true });
                    const updatedUser = await authService.updateAvatarUrl(url);
                    set({ user: updatedUser });
                    toast.success("Đã cập nhật ảnh đại diện");
                } catch (error) {
                    toast.error("Lỗi cập nhật ảnh");
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