
const DB_NAME = "CryptoDB";
const STORE_NAME = "keys";

const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};


const base64ToBuffer = (str: string) => Uint8Array.from(atob(str), c => c.charCodeAt(0));
const bufferToBase64 = (buf: ArrayBuffer | Uint8Array): string => {
    const uint8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < uint8.byteLength; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return window.btoa(binary);
};

export const DCrypto = {
    async deriveMasterKey(password: string, salt: string): Promise<CryptoKey> {
        const encoder = new TextEncoder();
        const baseKey = await window.crypto.subtle.importKey(
            "raw", encoder.encode(password), "PBKDF2", false, ["deriveKey"]
        );

        return window.crypto.subtle.deriveKey(
            { 
                name: "PBKDF2", 
                salt: encoder.encode(salt), 
                iterations: 100000, 
                hash: "SHA-256" 
            },
            baseKey,
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        );
    },

    async encrypt(text: string, key: CryptoKey) {
        const encoder = new TextEncoder();
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            key,
            encoder.encode(text)
        );

        return {
            content: bufferToBase64(encrypted),
            iv: bufferToBase64(iv)
        };
    },

    async decrypt(encryptedBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
        const decoder = new TextDecoder();
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: base64ToBuffer(ivBase64) },
            key,
            base64ToBuffer(encryptedBase64)
        );

        return decoder.decode(decrypted);
    },

    async saveKeyToStorage(key: CryptoKey, name: string = "master_key") {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(key, name);
        return new Promise((res) => (tx.oncomplete = res));
    },

    async loadKeyFromStorage(name: string = "master_key"): Promise<CryptoKey | null> {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get(name);
        return new Promise((res) => {
            request.onsuccess = () => res(request.result || null);
            request.onerror = () => res(null);
        });
    },

    async clearAllKeys() {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete("master_key");
        tx.objectStore(STORE_NAME).delete("signing_key");
        return new Promise((res) => (tx.oncomplete = res));
    },

    async generateSigningKeyPair(): Promise<CryptoKeyPair> {
        return window.crypto.subtle.generateKey(
            {
                name: "ECDSA",
                namedCurve: "P-256", 
            },
            true,
            ["sign", "verify"]
        );
    },

    async packPrivateKey(privateKey: CryptoKey, masterKey: CryptoKey) {
        const exported = await window.crypto.subtle.exportKey("pkcs8", privateKey);
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv },
            masterKey,
            exported
        );

        return {
            encryptedKey: bufferToBase64(encrypted),
            iv: bufferToBase64(iv)
        };
    },

    async unpackPrivateKey(encryptedKeyStr: string, ivStr: string, masterKey: CryptoKey): Promise<CryptoKey> {
        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: base64ToBuffer(ivStr) },
            masterKey,
            base64ToBuffer(encryptedKeyStr)
        );

        return window.crypto.subtle.importKey(
            "pkcs8",
            decrypted,
            { name: "ECDSA", namedCurve: "P-256" },
            false,
            ["sign"]
        );
    },


    async exportPublicKey(key: CryptoKey): Promise<string> {
        const exported = await window.crypto.subtle.exportKey("spki", key);
        return bufferToBase64(exported);
    },

    async signData(privateKey: CryptoKey, data: string): Promise<string> {
        const encoder = new TextEncoder();
        const signature = await window.crypto.subtle.sign(
            { name: "ECDSA", hash: { name: "SHA-256" } },
            privateKey,
            encoder.encode(data)
        );
        return bufferToBase64(signature);
    }
};