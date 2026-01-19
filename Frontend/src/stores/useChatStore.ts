import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import { useAuthStore } from "./useAuthStore";
import { drLib, arrayBufferToBase64, base64ToArrayBuffer } from "@/lib/doubleRatchet";
import { cryptoUtils } from "@/lib/cryptoUtils";
import { chatService } from "@/services/chatService";
import { authService } from "@/services/authService";
import type { ChatState } from "@/types/store";
import type { Conversation, Message, RatchetState, SendMessagePayload, MessageHeader } from "@/types/chat";
import type { User } from "@/types/user";

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            messages: {},
            ratchetMap: {},
            activeConversationId: null,
            loading: false,
            messageLoading: false,
            onlineUserIds: [],

            setActiveConversationId: (id) => set({ activeConversationId: id }),

            reset: () => set({
                conversations: [],
                messages: {},
                ratchetMap: {},
                activeConversationId: null,
                loading: false
            }),

            // --- 1. ĐỒNG BỘ TRẠNG THÁI BÁNH RĂNG LÊN SERVER ---
            syncRatchetState: async (convoId: string) => {
                const state = get().ratchetMap[convoId];
                const { tempMasterKey } = useAuthStore.getState();
                if (!state || !tempMasterKey) return;

                try {
                    const stateString = JSON.stringify(state);
                    const encoder = new TextEncoder();

                    // SỬA: Dùng encryptData thay vì wrapPrivateKey
                    const encrypted = await cryptoUtils.encryptData(
                        encoder.encode(stateString).buffer,
                        tempMasterKey
                    );

                    const payload = `${encrypted.iv}:${encrypted.ciphertext}`;
                    await chatService.updateRatchetState(convoId, payload);
                } catch (error) {
                    console.error("DR: Sync state failed", error);
                }
            },

            loadRatchetState: async (convoId: string) => {
                const { tempMasterKey } = useAuthStore.getState();
                if (!tempMasterKey) return;
                try {
                    const res = await chatService.getRatchetState(convoId);
                    if (!res || !res.encrypted_ratchet_state) return;

                    const [ivStr, wrappedKeyStr] = res.encrypted_ratchet_state.split(":");
                    const decryptedBuf = await cryptoUtils.unwrapPrivateKey(wrappedKeyStr, ivStr, tempMasterKey);
                    const state: RatchetState = JSON.parse(new TextDecoder().decode(decryptedBuf as any));

                    set((s) => ({ ratchetMap: { ...s.ratchetMap, [convoId]: state } }));
                } catch (error) {
                    console.error("DR: Load state failed", error);
                }
            },

            // --- 2. KHỞI TẠO BÁNH RĂNG (HANDSHAKE) ---
            initializeRatchet: async (convoId, targetUser) => {
                const { identityPrivateKey } = useAuthStore.getState();
                if (!identityPrivateKey || !targetUser.identity_key_pub) return;

                try {
                    // Bước 1: Diffie-Hellman ban đầu (Identity Keys)
                    const remoteIdPub = await drLib.importKey(targetUser.identity_key_pub, "public");
                    const dhInit = await drLib.computeDH(identityPrivateKey, remoteIdPub);

                    // Bước 2: Tạo Root Key ban đầu qua HKDF
                    const [rk_init] = await drLib.hkdf(dhInit, dhInit);

                    // Bước 3: Tạo cặp khóa DH Ephemeral hiện tại
                    const myNewEph = await drLib.generateEG();

                    const newState: RatchetState = {
                        rootKey: await drLib.exportKey(rk_init),
                        sendChainKey: null,
                        recvChainKey: null,
                        myEphPriv: await drLib.exportKey(myNewEph.sec),
                        myEphPub: await drLib.exportKey(myNewEph.pub),
                        theirEphPub: targetUser.identity_key_pub,
                        sendCount: 0,
                        recvCount: 0,
                        prevChainLength: 0,
                        pendingRecvKeys: {}
                    };

                    set((s) => ({ ratchetMap: { ...s.ratchetMap, [convoId]: newState } }));
                    await get().syncRatchetState(convoId);
                } catch (error) {
                    console.error("DR: Init failed", error);
                }
            },

            // --- 3. GỬI TIN NHẮN (SENDING RATCHET) --
            sendMessage: async (conversationId, content, contentType = "text") => {
                const { user } = useAuthStore.getState();
                if (!user) return;

                // A. OPTIMISTIC UI: Hiển thị tin nhắn tạm thời bằng văn bản thuần
                const tempId = `temp-${Date.now()}`;
                const optimisticMsg = {
                    id: tempId,
                    content: content, // Bản rõ để người gửi đọc được ngay
                    sender_id: user.id,
                    conversation_id: conversationId,
                    created_at: new Date().toISOString(),
                    content_type: contentType as "text" | "image",
                    sender: user
                } as Message;

                // Đẩy tin nhắn tạm vào Store
                set((s) => ({
                    messages: {
                        ...s.messages,
                        [conversationId]: [...(s.messages[conversationId] || []), optimisticMsg]
                    }
                }));

                // B. KIỂM TRA VÀ NẠP TRẠNG THÁI BÁNH RĂNG (RATCHET STATE)
                if (!get().ratchetMap[conversationId]) {
                    await get().loadRatchetState(conversationId);
                }

                let state = get().ratchetMap[conversationId];

                // Nếu chưa từng có bánh răng (Lần đầu chat hoàn toàn), thực hiện Handshake
                if (!state) {
                    const convo = get().conversations.find(c => c.id === conversationId);
                    const recipient = convo?.participants.find(p => p.id !== user.id);
                    if (recipient && recipient.identity_key_pub) {
                        await get().initializeRatchet(conversationId, recipient);
                        state = get().ratchetMap[conversationId];
                    }
                }

                if (!state) {
                    toast.error("Không thể thiết lập mã hóa đầu cuối cho cuộc hội thoại này!");
                    // Xóa tin nhắn tạm nếu không thể mã hóa
                    set((s) => ({
                        messages: {
                            ...s.messages,
                            [conversationId]: (s.messages[conversationId] || []).filter(m => m.id !== tempId)
                        }
                    }));
                    return;
                }

                try {
                    // C. THỰC HIỆN XOAY BÁNH RĂNG GỬI (SENDING RATCHET)

                    // 1. Nếu là chuỗi gửi mới (chưa có sendChainKey), thực hiện DH bước đầu
                    if (!state.sendChainKey) {
                        const myEphPriv = await drLib.importKey(state.myEphPriv, 'private');
                        const theirEphPub = await drLib.importKey(state.theirEphPub, 'public');
                        const dhOut = await drLib.computeDH(myEphPriv, theirEphPub);

                        const rootKey = await drLib.importKey(state.rootKey, 'hmac');
                        const [newRk, newCk] = await drLib.hkdf(dhOut, rootKey);

                        state.rootKey = await drLib.exportKey(newRk);
                        state.sendChainKey = await drLib.exportKey(newCk);
                    }

                    // 2. Xoay bánh răng đối xứng để lấy Message Key
                    const currentCk = await drLib.importKey(state.sendChainKey, 'hmac');
                    const { msgKey, nextCk } = await drLib.deriveNextKeys(currentCk);

                    // 3. Chuẩn bị Header của Double Ratchet
                    const iv = window.crypto.getRandomValues(new Uint8Array(12));
                    const header: MessageHeader = {
                        pubKey: state.myEphPub,
                        count: state.sendCount + 1,
                        prevCount: state.prevChainLength,
                        iv: arrayBufferToBase64(iv.buffer)
                    };

                    // 4. MÃ HÓA NỘI DUNG (AES-GCM)
                    // Dùng JSON Header làm Additional Authenticated Data (AAD) để chống sửa đổi Header
                    const headerJson = JSON.stringify(header);
                    const ciphertextRaw = await window.crypto.subtle.encrypt(
                        {
                            name: 'AES-GCM',
                            iv,
                            additionalData: new TextEncoder().encode(headerJson)
                        },
                        msgKey,
                        new TextEncoder().encode(content)
                    );

                    let ciphertextStr = arrayBufferToBase64(ciphertextRaw);

                    // 5. XỬ LÝ MEDIA (CLOUDINARY)
                    // Nếu là ảnh, upload bản mã Ciphertext lên Cloudinary thay vì ảnh gốc
                    if (contentType === "image") {
                        const blob = new Blob([ciphertextStr], { type: "text/plain" });
                        const file = new File([blob], "encrypted_image.txt");
                        ciphertextStr = await authService.uploadToCloudinary(file);
                    }

                    // 6. GỬI GÓI TIN LÊN SERVER
                    const payload: SendMessagePayload = {
                        content: ciphertextStr,
                        content_type: contentType as "text" | "image",
                        dh_pub_key: header.pubKey,
                        msg_index: header.count,
                        iv: header.iv,
                        signature: headerJson // Lưu Header vào cột signature
                    };

                    const result = await chatService.sendMessage(conversationId, payload);

                    // 7. CẬP NHẬT TRẠNG THÁI BÁNH RĂNG LOCAL
                    const updatedState: RatchetState = {
                        ...state,
                        sendChainKey: await drLib.exportKey(nextCk),
                        sendCount: state.sendCount + 1
                    };

                    set((s) => ({
                        ratchetMap: { ...s.ratchetMap, [conversationId]: updatedState }
                    }));

                    // 8. ĐỒNG BỘ UI: Thay thế tin nhắn tạm bằng tin nhắn thật từ Server
                    // Quan trọng: Gán lại content gốc (plaintext) để người gửi vẫn đọc được
                    const finalMsgForStore = { ...result, content: content };

                    set((s) => ({
                        messages: {
                            ...s.messages,
                            [conversationId]: (s.messages[conversationId] || []).map(m =>
                                m.id === tempId ? finalMsgForStore : m
                            )
                        }
                    }));

                    get().updateLastMessage(finalMsgForStore);

                    // 9. ĐỒNG BỘ TRẠNG THÁI LÊN DATABASE (POSTGRES)
                    await get().syncRatchetState(conversationId);

                } catch (error) {
                    console.error("DR: Send Message Error", error);
                    toast.error("Lỗi hệ thống mã hóa, không thể gửi tin nhắn!");

                    // Xóa tin nhắn tạm nếu có lỗi xảy ra
                    set((s) => ({
                        messages: {
                            ...s.messages,
                            [conversationId]: (s.messages[conversationId] || []).filter(m => m.id !== tempId)
                        }
                    }));
                }
            },

            // --- 4. NHẬN TIN NHẮN (RECEIVING RATCHET) ---
            // --- 4. NHẬN TIN NHẮN (RECEIVING RATCHET) ---
            handleIncomingMessage: async (message: Message) => {
                const { user } = useAuthStore.getState();
                // 1. Kiểm tra cơ bản: Nếu không có user hoặc là tin của chính mình gửi (đã xử lý ở sendMessage) thì bỏ qua
                if (!user || message.sender_id === user.id) return;

                const convoId = message.conversation_id;

                // 2. Chống trùng lặp tin nhắn (Nếu ID này đã có trong Store thì không xử lý lại)
                const currentMessagesInStore = get().messages[convoId] || [];
                if (currentMessagesInStore.some((m) => m.id === message.id)) return;

                // 3. Nạp trạng thái bánh răng từ Server nếu RAM chưa có
                if (!get().ratchetMap[convoId]) {
                    await get().loadRatchetState(convoId);
                }

                let state = get().ratchetMap[convoId];
                if (!state) {
                    console.warn("DR: Nhận tin nhắn nhưng chưa có bánh răng khởi tạo cho phòng này.");
                    return;
                }

                try {
                    // 4. Phân tách Header từ trường signature
                    if (!message.signature) throw new Error("Tin nhắn thiếu Header Double Ratchet");
                    const header: MessageHeader = JSON.parse(message.signature);

                    // 5. KIỂM TRA DH RATCHET (Người gửi đã xoay bánh răng bất đối xứng)
                    const isDhStep = header.pubKey !== state.theirEphPub;

                    if (isDhStep) {
                        // A. Xử lý các khóa bị lỡ (Skipped Keys) của chuỗi cũ trước khi xoay DH
                        // Dựa trên logic pn (prevCount) trong header
                        if (state.recvChainKey) {
                            let oldCk = await drLib.importKey(state.recvChainKey, 'hmac');
                            while (state.recvCount < header.prevCount) {
                                const { msgKey, nextCk } = await drLib.deriveNextKeys(oldCk);
                                // Lưu khóa vào Map pending để giải mã các tin nhắn đến muộn sau này
                                state.pendingRecvKeys[`${state.theirEphPub}-${state.recvCount + 1}`] = await drLib.exportKey(msgKey);
                                oldCk = nextCk;
                                state.recvCount++;
                            }
                        }

                        // B. Thực hiện DH Ratchet bước mới
                        const myEphPriv = await drLib.importKey(state.myEphPriv, 'private');
                        const remotePubKey = await drLib.importKey(header.pubKey, 'public');
                        const dhOut = await drLib.computeDH(myEphPriv, remotePubKey);

                        const rootKey = await drLib.importKey(state.rootKey, 'hmac');
                        const [newRk, newCk] = await drLib.hkdf(dhOut, rootKey);

                        // C. Cập nhật State cho chuỗi mới
                        state.rootKey = await drLib.exportKey(newRk);
                        state.recvChainKey = await drLib.exportKey(newCk);
                        state.theirEphPub = header.pubKey;
                        state.recvCount = 0;
                        state.prevChainLength = state.sendCount;
                        state.sendCount = 0;

                        // D. Tạo cặp khóa DH mới cho chính mình (để lượt gửi sau đối phương cũng phải xoay DH)
                        const myNewEph = await drLib.generateEG();
                        state.myEphPriv = await drLib.exportKey(myNewEph.sec);
                        state.myEphPub = await drLib.exportKey(myNewEph.pub);
                    }

                    // 6. KIỂM TRA TIN NHẮN BỊ NHẢY CÓC TRONG CHUỖI HIỆN TẠI
                    // (Ví dụ nhận tin số 10 trong khi đang ở nấc số 8)
                    let currentRecvCk = await drLib.importKey(state.recvChainKey!, 'hmac');
                    while (state.recvCount + 1 < header.count) {
                        const { msgKey, nextCk } = await drLib.deriveNextKeys(currentRecvCk);
                        state.pendingRecvKeys[`${header.pubKey}-${state.recvCount + 1}`] = await drLib.exportKey(msgKey);
                        currentRecvCk = nextCk;
                        state.recvCount++;
                    }

                    // 7. XOAY BÁNH RĂNG ĐỐI XỨNG ĐỂ LẤY KHÓA GIẢI MÃ TIN HIỆN TẠI
                    const { msgKey, nextCk } = await drLib.deriveNextKeys(currentRecvCk);
                    state.recvChainKey = await drLib.exportKey(nextCk);
                    state.recvCount++;

                    // 8. XỬ LÝ NỘI DUNG (TẢI TỪ CLOUDINARY NẾU LÀ ẢNH)
                    let ciphertextStr = message.content;
                    if (message.content_type === "image" && ciphertextStr.startsWith("http")) {
                        const response = await fetch(ciphertextStr);
                        ciphertextStr = await response.text();
                    }

                    // 9. TIẾN HÀNH GIẢI MÃ (AES-GCM)
                    // Lưu ý: additionalData phải khớp 100% với lúc encrypt (chuỗi JSON header)
                    const decryptedRaw = await window.crypto.subtle.decrypt(
                        {
                            name: 'AES-GCM',
                            iv: base64ToArrayBuffer(header.iv),
                            additionalData: new TextEncoder().encode(message.signature)
                        },
                        msgKey,
                        base64ToArrayBuffer(ciphertextStr)
                    );

                    const plaintext = new TextDecoder().decode(decryptedRaw);

                    // 10. CẬP NHẬT STORE VÀ UI
                    const finalDecryptedMsg = { ...message, content: plaintext };

                    set((s) => ({
                        // Cập nhật mảng tin nhắn
                        messages: {
                            ...s.messages,
                            [convoId]: [...(s.messages[convoId] || []), finalDecryptedMsg]
                        },
                        // Lưu lại trạng thái bánh răng đã xoay
                        ratchetMap: {
                            ...s.ratchetMap,
                            [convoId]: { ...state }
                        }
                    }));

                    get().updateLastMessage(finalDecryptedMsg);

                    // 11. ĐỒNG BỘ TRẠNG THÁI MỚI LÊN SERVER
                    await get().syncRatchetState(convoId);

                } catch (error) {
                    console.error("DR: Decryption failed", error);
                    // Hiển thị tin nhắn lỗi giải mã trên UI thay vì để trống
                    const errorMsg = { ...message, content: "[Lỗi bảo mật: Không thể giải mã tin nhắn này]" };
                    set((s) => ({
                        messages: {
                            ...s.messages,
                            [convoId]: [...(s.messages[convoId] || []), errorMsg]
                        }
                    }));
                }
            },

            // --- 5. HÀM BỔ TRỢ ---
            fetchConversation: async () => {
                set({ loading: true });
                try {
                    const res = await chatService.fetchConversations();
                    set({ conversations: res });
                } finally { set({ loading: false }); }
            },

            fetchMessages: async (convoId) => {
                set({ messageLoading: true });
                try {
                    const res = await chatService.fetchMessages(convoId);
                    set((s) => ({ messages: { ...s.messages, [convoId]: res } }));
                } finally { set({ messageLoading: false }); }
            },

            startConversation: async (targetUser) => {
                try {
                    const newConvo = await chatService.createConversation({ type: 'private', participant_ids: [targetUser.id] });
                    await get().initializeRatchet(newConvo.id, targetUser);
                    set((s) => ({ conversations: [newConvo, ...s.conversations.filter(c => c.id !== newConvo.id)], activeConversationId: newConvo.id }));
                } catch (e) { toast.error("Lỗi tạo hội thoại"); }
            },

            searchUsers: async (q) => chatService.searchUsers(q),
            updateLastMessage: (msg) => {
                set((s) => {
                    const convo = s.conversations.find(c => c.id === msg.conversation_id);
                    if (!convo) return s;
                    return { conversations: [{ ...convo, last_message: msg }, ...s.conversations.filter(c => c.id !== msg.conversation_id)] };
                });
            },
            handleIncomingNewConversation: (convo) => set((s) => ({ conversations: [convo, ...s.conversations.filter(c => c.id !== convo.id)] })),
            handleUserStatusChange: (id, status) => set((s) => ({ onlineUserIds: status === 'online' ? [...new Set([...s.onlineUserIds, id])] : s.onlineUserIds.filter(x => x !== id) })),
            setOnlineUsers: (ids) => set({ onlineUserIds: ids }),
            fetchUsersOnline: async () => { const ids = await chatService.fetchUsersOnline(); set({ onlineUserIds: ids }); },
        }),
        {
            name: "chat-storage",
            partialize: (state) => ({ conversations: state.conversations }),
        }
    )
);