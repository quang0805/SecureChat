const ALGO_RSA = "RSA-OAEP";
const ALGO_AES = "AES-GCM";

export const cryptoUtils = {
    // 1. Tạo cặp khóa RSA
    generateKeyPair: async () => {
        return await window.crypto.subtle.generateKey(
            {
                name: "RSA-OAEP",
                modulusLength: 2048,
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: "SHA-256",
            },
            true,
            ["encrypt", "decrypt"]
        );
    },

    // 2. Xuất khóa sang định dạng chuỗi để lưu DB
    exportKey: async (key: CryptoKey) => {
        const exported = await window.crypto.subtle.exportKey(
            key.type === "public" ? "spki" : "pkcs8",
            key
        );
        return arrayBufferToBase64(exported);
    },

    // 3. Nhập khóa từ chuỗi
    importKey: async (keyStr: string, type: "public" | "private") => {
        const binaryDer = Uint8Array.from(atob(keyStr), c => c.charCodeAt(0));
        return await window.crypto.subtle.importKey(
            type === "public" ? "spki" : "pkcs8",
            binaryDer,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            type === "public" ? ["encrypt"] : ["decrypt"]
        );
    },

    // 4. Mã hóa tin nhắn (Hybrid Encryption)
    encryptMessage: async (plaintext: string, recipientPublicKeyStr: string) => {
        // Tạo khóa AES mã hóa tin nhắn.
        const aesKey = await window.crypto.subtle.generateKey(
            { name: ALGO_AES, length: 256 },
            true,
            ["encrypt", "decrypt"]
        );

        // Mã hóa nội dung bằng AES-GCM
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encodedText = new TextEncoder().encode(plaintext);
        const encryptedContent = await window.crypto.subtle.encrypt(
            { name: ALGO_AES, iv },
            aesKey,
            encodedText
        );

        // Xuất AES ra dạng Raw
        const aesKeyRaw = await window.crypto.subtle.exportKey("raw", aesKey);


        // Mã hóa khóa AES bằng RSA Public Key của người nhận
        const recipientPubKey = await cryptoUtils.importKey(recipientPublicKeyStr, "public");
        const exportedAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
        const encryptedAesKey = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            recipientPubKey,
            exportedAesKey
        );

        return {
            ciphertext: arrayBufferToBase64(encryptedContent),
            encryptedAesKey: arrayBufferToBase64(encryptedAesKey),
            iv: arrayBufferToBase64(iv.buffer),
            aesKeyRaw: aesKeyRaw
        };
    },
    // HELPER - mã hóa khóa AES bằng public key của mình. 
    encryptAesKeyForMe: async (aesKeyRaw: ArrayBuffer, myPublicKeyStr: string) => {
        const myPubKey = await cryptoUtils.importKey(myPublicKeyStr, "public");
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" }, myPubKey, aesKeyRaw
        );
        return arrayBufferToBase64(encrypted);
    },
    // 5. Giải mã tin nhắn
    decryptMessage: async (ciphertext: string, encryptedAesKey: string, iv: string, myPrivateKey: CryptoKey) => {
        // Giải mã khóa AES bằng RSA Private Key của mình
        const encryptedAesKeyBin = Uint8Array.from(atob(encryptedAesKey), c => c.charCodeAt(0));
        const aesKeyRaw = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            myPrivateKey,
            encryptedAesKeyBin
        );

        const aesKey = await window.crypto.subtle.importKey(
            "raw", aesKeyRaw, { name: ALGO_AES }, true, ["decrypt"]
        );

        // Giải mã nội dung bằng AES
        const ciphertextBin = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
        const ivBin = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

        const decrypted = await window.crypto.subtle.decrypt(
            { name: ALGO_AES, iv: ivBin },
            aesKey,
            ciphertextBin
        );

        return new TextDecoder().decode(decrypted);
    },

    // 6. Hàm tạo Master Key từ mật khẩu (PBKDF2)
    deriveMasterKey: async (password: string, salt: string) => {
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
                salt: encoder.encode(salt), // Dùng username làm salt
                iterations: 100000,
                hash: "SHA-256",
            },
            passwordKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    },

    // 7. Wrap Private Key (Mã hóa Private Key bằng Master Key)
    wrapPrivateKey: async (privateKey: CryptoKey, masterKey: CryptoKey) => {
        const exportedPrivKey = await window.crypto.subtle.exportKey("pkcs8", privateKey);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encryptedPrivKey = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            masterKey,
            exportedPrivKey
        );

        // Trả về chuỗi gồm IV + Ciphertext để lưu lên DB
        return {
            wrappedKey: arrayBufferToBase64(encryptedPrivKey),
            iv: arrayBufferToBase64(iv.buffer)
        };
    },

    // 8. Unwrap Private Key (Giải mã lấy lại Private Key)
    unwrapPrivateKey: async (wrappedKeyStr: string, ivStr: string, masterKey: CryptoKey) => {
        const encryptedPrivKey = Uint8Array.from(atob(wrappedKeyStr), c => c.charCodeAt(0));
        const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));

        const decryptedPrivKey = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv },
            masterKey,
            encryptedPrivKey
        );

        return await window.crypto.subtle.importKey(
            "pkcs8",
            decryptedPrivKey,
            { name: "RSA-OAEP", hash: "SHA-256" },
            true,
            ["decrypt"]
        );
    },

};
// Hàm chuyển đổi ArrayBuffer sang Base64 một cách an toàn cho dữ liệu lớn
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
};