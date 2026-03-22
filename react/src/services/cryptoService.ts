    import type { User } from "../types/auth";
    import { UserService } from "./userService";

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


    const _base64ToBuffer = (str: string) => Uint8Array.from(atob(str), c => c.charCodeAt(0));
    /*
    const bufferToBase64 = (buf: ArrayBuffer | Uint8Array): string => {
        const uint8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < uint8.byteLength; i++) {
            binary += String.fromCharCode(uint8[i]);
        }
        return window.btoa(binary);
    };
    */
    const _bufferToBase64 = (buf: ArrayBuffer | Uint8Array): string => {
        const uint8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
        
        const CHUNK_SIZE = 0x8000;
        let binary = '';
        for (let i = 0; i < uint8.length; i += CHUNK_SIZE) {
            binary += String.fromCharCode.apply(
                null, 
                uint8.subarray(i, i + CHUNK_SIZE) as unknown as number[]
            );
        }
        return window.btoa(binary);
    };

    export const DCrypto = {

        bufferToBase64: _bufferToBase64,
        base64ToBuffer: _base64ToBuffer,

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

        async encrypt(text: string, key: CryptoKey, existingIv?: Uint8Array) {
            const encoder = new TextEncoder();
            const iv = existingIv || window.crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await window.crypto.subtle.encrypt(
                { name: "AES-GCM", iv: (iv as unknown) as BufferSource  },
                key,
                encoder.encode(text)
            );

            return {
                content: _bufferToBase64(encrypted),
                iv: _bufferToBase64(iv)
            };
        },

        async decrypt(encryptedBase64: string, ivBase64: string, key: CryptoKey): Promise<string> {
            const decoder = new TextDecoder();
            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: _base64ToBuffer(ivBase64) },
                key,
                _base64ToBuffer(encryptedBase64)
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
            tx.objectStore(STORE_NAME).delete("exchange_private_key");
            return new Promise((res) => (tx.oncomplete = res));
        },

        async generateUniqueSalt(length: number = 16): Promise<string> {
            const array = new Uint8Array(length);
            window.crypto.getRandomValues(array);

            return Array.from(array)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        },

        async generateProjectKey(): Promise<CryptoKey> {
            return await window.crypto.subtle.generateKey(
                { name: "AES-GCM", length: 256 },
                true,
                ["encrypt", "decrypt"]
            );
        },

        async exportProjectKey(key: CryptoKey): Promise<string> {
            const exported = await window.crypto.subtle.exportKey("raw", key);
            return this.bufferToBase64(exported);
        },

        async importProjectKey(rawKeyStr: string): Promise<CryptoKey> {
            const buf = this.base64ToBuffer(rawKeyStr);
            return await window.crypto.subtle.importKey(
                "raw", buf, { name: "AES-GCM" }, true, ["encrypt", "decrypt"]
            );
        },

        async hashTag(tagName: string, salt: string): Promise<string> {
            const encoder = new TextEncoder();
            
            const data = encoder.encode(tagName.toLowerCase() + salt);
            const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
            return _bufferToBase64(hashBuffer);
        },

        async unwrapProjectKeyWithRSA(wrappedKeyBase64: string, privateKey: CryptoKey): Promise<string> {
            const encryptedBuffer = this.base64ToBuffer(wrappedKeyBase64);
            const decryptedBuffer = await window.crypto.subtle.decrypt(
                { name: "RSA-OAEP" },
                privateKey,
                encryptedBuffer
            );

            return this.bufferToBase64(decryptedBuffer);
        },

        //============SigningKey===============//

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
                encryptedKey: _bufferToBase64(encrypted),
                iv: _bufferToBase64(iv)
            };
        },

        async unpackPrivateKey(encryptedKeyStr: string, ivStr: string, masterKey: CryptoKey, keyType: 'signing' | 'exchange'): Promise<CryptoKey> {
            const decrypted = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv: _base64ToBuffer(ivStr) },
                masterKey,
                _base64ToBuffer(encryptedKeyStr)
            );

            const importParams = keyType === 'signing' 
            ? { name: "ECDSA", namedCurve: "P-256" } 
            : { name: "RSA-OAEP", hash: "SHA-256" };

            const usages: KeyUsage[] = keyType === 'signing' 
            ? ["sign"] 
            : ["decrypt"];


            return window.crypto.subtle.importKey(
                "pkcs8",
                decrypted,
                importParams,
                false,
                usages
            );
        },

        async exportPublicKey(key: CryptoKey): Promise<string> {
            const exported = await window.crypto.subtle.exportKey("spki", key);
            return _bufferToBase64(exported);
        },


        //============ExchangeKey===============//

        async generateExchangeKeyPair(): Promise<CryptoKeyPair> {
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

        async exportExchangePublicKey(key: CryptoKey): Promise<string> {
            const exported = await window.crypto.subtle.exportKey("spki", key);
            return this.bufferToBase64(exported);
        },

        async importExchangePublicKey(keyStr: string): Promise<CryptoKey> {
            return await window.crypto.subtle.importKey(
                "spki",
                this.base64ToBuffer(keyStr),
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            );
        },


        async signData(privateKey: CryptoKey, data: string): Promise<string> {
            const encoder = new TextEncoder();
            const signature = await window.crypto.subtle.sign(
                { name: "ECDSA", hash: { name: "SHA-256" } },
                privateKey,
                encoder.encode(data)
            );
            return _bufferToBase64(signature);
        }
    };