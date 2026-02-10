
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
const bufferToBase64 = (buf: ArrayBuffer | Uint8Array) => {
    const uint8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    return btoa(String.fromCharCode(...uint8));
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

    async saveKeyToStorage(key: CryptoKey) {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(key, "master_key");
        return new Promise((res) => (tx.oncomplete = res));
    },

    async loadKeyFromStorage(): Promise<CryptoKey | null> {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const request = tx.objectStore(STORE_NAME).get("master_key");
        return new Promise((res) => {
            request.onsuccess = () => res(request.result || null);
            request.onerror = () => res(null);
        });
    },

    async clearKeyFromStorage() {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete("master_key");
        return new Promise((res) => (tx.oncomplete = res));
    }
};