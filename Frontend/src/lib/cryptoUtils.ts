// src/lib/cryptoUtils.ts

// --- HELPERS: Chuyển đổi an toàn cho dữ liệu lớn (như ảnh hoặc Ratchet State) ---
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
};

export const cryptoUtils = {
    // 1. Hàm tạo Master Key từ mật khẩu (PBKDF2)
    deriveMasterKey: async (password: string, salt: string): Promise<CryptoKey> => {
        const encoder = new TextEncoder();
        const passwordKey = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            { name: "PBKDF2" },
            false,
            ["deriveKey"]
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: "SHA-256",
            },
            passwordKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    },

    // 2. Wrap Identity Private Key (Dùng Master Key mã hóa khóa ECDH)
    wrapPrivateKey: async (privateKey: CryptoKey, masterKey: CryptoKey) => {
        const exportedPrivKey = await window.crypto.subtle.exportKey("pkcs8", privateKey);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedPrivKey = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            masterKey,
            exportedPrivKey
        );

        return {
            wrappedKey: arrayBufferToBase64(encryptedPrivKey),
            iv: arrayBufferToBase64(iv.buffer)
        };
    },

    // 3. Unwrap Identity Private Key (Giải mã lấy lại khóa ECDH P-384)
    unwrapPrivateKey: async (wrappedKeyStr: string, ivStr: string, masterKey: CryptoKey): Promise<CryptoKey> => {
        const encryptedPrivKey = base64ToArrayBuffer(wrappedKeyStr);
        const iv = base64ToArrayBuffer(ivStr);

        const decryptedPrivKey = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            masterKey,
            encryptedPrivKey
        );

        return await window.crypto.subtle.importKey(
            "pkcs8",
            decryptedPrivKey,
            { name: "ECDH", namedCurve: "P-384" }, // PHẢI khớp với drLib.generateEG
            true,
            ["deriveKey", "deriveBits"]
        );
    },
    // 9. Mã hóa dữ liệu bất kỳ (dùng cho Ratchet State)
    encryptData: async (data: ArrayBuffer, masterKey: CryptoKey) => {
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            masterKey,
            data
        );

        return {
            ciphertext: arrayBufferToBase64(encrypted),
            iv: arrayBufferToBase64(iv.buffer)
        };
    },

    // 10. Giải mã dữ liệu bất kỳ
    decryptData: async (ciphertextStr: string, ivStr: string, masterKey: CryptoKey) => {
        const ciphertext = base64ToArrayBuffer(ciphertextStr);
        const iv = base64ToArrayBuffer(ivStr);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            masterKey,
            ciphertext
        );

        return decrypted; // Trả về ArrayBuffer
    }
};