// src/lib/doubleRatchet.ts

// Helper: Chuyển đổi ArrayBuffer an toàn
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
};

export const drLib = {
    // Sinh cặp khóa ECDH P-384 (giống messenger.js)
    generateEG: async () => {
        const keypair = await window.crypto.subtle.generateKey(
            { name: 'ECDH', namedCurve: 'P-384' },
            true,
            ['deriveKey', 'deriveBits']
        );
        return { pub: keypair.publicKey, sec: keypair.privateKey };
    },

    // Tính toán Shared Secret DH -> HMAC Key
    computeDH: async (myPriv: CryptoKey, theirPub: CryptoKey) => {
        return await window.crypto.subtle.deriveKey(
            { name: 'ECDH', public: theirPub },
            myPriv,
            { name: 'HMAC', hash: 'SHA-256', length: 256 },
            true,
            ['sign']
        );
    },

    // HKDF: Rk + DhOut -> NextRk, NextCk
    hkdf: async (inputKey: CryptoKey, saltKey: CryptoKey) => {
        // Sign '0' để lấy raw bits từ HMAC key hiện tại
        const inputKeyBuf = await window.crypto.subtle.sign({ name: 'HMAC' }, inputKey, new Uint8Array([0]));
        const saltBuf = await window.crypto.subtle.sign({ name: 'HMAC' }, saltKey, new TextEncoder().encode('salt1'));

        const masterKey = await window.crypto.subtle.importKey('raw', inputKeyBuf, 'HKDF', false, ['deriveKey']);

        const derive = (salt: ArrayBuffer, info: string) =>
            window.crypto.subtle.deriveKey(
                { name: 'HKDF', hash: 'SHA-256', salt, info: new TextEncoder().encode(info) },
                masterKey,
                { name: 'HMAC', hash: 'SHA-256', length: 256 },
                true,
                ['sign']
            );

        return [
            await derive(saltBuf, 'ratchet-rk'), // New Root Key
            await derive(saltBuf, 'ratchet-ck')  // New Chain Key
        ];
    },

    // Symmetric Ratchet: CK -> MsgKey + NextCK
    deriveNextKeys: async (chainKey: CryptoKey) => {
        const hmacMsg = await window.crypto.subtle.sign({ name: 'HMAC' }, chainKey, new TextEncoder().encode('message-key'));
        const hmacNext = await window.crypto.subtle.sign({ name: 'HMAC' }, chainKey, new TextEncoder().encode('next-chain-key'));

        const msgKey = await window.crypto.subtle.importKey('raw', hmacMsg, 'AES-GCM', true, ['encrypt', 'decrypt']);
        const nextCk = await window.crypto.subtle.importKey('raw', hmacNext, { name: 'HMAC', hash: 'SHA-256', length: 256 }, true, ['sign']);

        return { msgKey, nextCk };
    },

    // Export/Import Helpers
    exportKey: async (key: CryptoKey) => {
        const format = key.type === 'public' ? 'spki' : (key.type === 'private' ? 'pkcs8' : 'raw');
        const exported = await window.crypto.subtle.exportKey(format, key);
        return arrayBufferToBase64(exported);
    },

    importKey: async (b64: string, type: 'public' | 'private' | 'hmac' | 'aes') => {
        const buf = base64ToArrayBuffer(b64);
        if (type === 'public') return window.crypto.subtle.importKey('spki', buf, { name: 'ECDH', namedCurve: 'P-384' }, true, []);
        if (type === 'private') return window.crypto.subtle.importKey('pkcs8', buf, { name: 'ECDH', namedCurve: 'P-384' }, true, ['deriveKey', 'deriveBits']);
        if (type === 'hmac') return window.crypto.subtle.importKey('raw', buf, { name: 'HMAC', hash: 'SHA-256', length: 256 }, true, ['sign']);
        return window.crypto.subtle.importKey('raw', buf, 'AES-GCM', true, ['encrypt', 'decrypt']);
    }
};