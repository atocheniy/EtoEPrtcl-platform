import React, { createContext, useState, useContext, useEffect } from 'react';
import { DCrypto } from '../../services/cryptoService';
import type { User } from '../../types/auth';
import { UserService } from '../../services/userService';

interface InitKeysResult {
    publicKey: string;
    encryptedPrivateKey: string;
    iv: string;
}

interface EncryptionContextType {
    masterKey: CryptoKey | null;
    signingKey: CryptoKey | null;
    userData: User | { fullName: 'Загрузка...', email: '' };
    setMasterKey: React.Dispatch<React.SetStateAction<CryptoKey | null>>;
    setSigningKey: (key: CryptoKey | null) => void;
    initKeysForRegister: (password: string, email: string) => Promise<{ publicKey: string, encryptedPrivateKey: string, iv: string }>;
    initKeysForLogin: (password: string, email: string, encKey: string, iv: string) => Promise<void>;

    orbColors: [string, string];
    setOrbColors: React.Dispatch<React.SetStateAction<[string, string]>>;
}

const EncryptionContext = createContext<EncryptionContextType | null>(null);

export const EncryptionProvider = ({ children }: { children: React.ReactNode }) => {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
    const [signingKey, setSigningKey] = useState<CryptoKey | null>(null);
    const [userData, setUserData] = useState<User>({ fullName: 'Загрузка...', email: '' });

    const [orbColors, setOrbColors] = useState<[string, string]>(['radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 80%)', 'radial-gradient(circle, rgba(169, 85, 247, 0.15) 0%, transparent 80%)']);

    useEffect(() => {
        if (masterKey) {
            UserService.getUser()
                .then(data => setUserData(data))
                .catch(() => setUserData({ fullName: 'Гость', email: 'Ошибка загрузки' }));
        }
    }, [masterKey]);
    
    /*
    const initKeys = async (password: string, email: string) => {
        const mKey = await DCrypto.deriveMasterKey(password, email);
        setMasterKey(mKey);
        await DCrypto.saveKeyToStorage(mKey, "master_key");

        const keyPair = await DCrypto.generateSigningKeyPair();
        setSigningKey(keyPair.privateKey);
        await DCrypto.saveKeyToStorage(keyPair.privateKey, "signing_key");

        return await DCrypto.exportPublicKey(keyPair.publicKey);
    };
    */

    const initKeysForRegister = async (password: string, email: string): Promise<InitKeysResult> => {
        const mKey = await DCrypto.deriveMasterKey(password, email);
        setMasterKey(mKey);
        await DCrypto.saveKeyToStorage(mKey, "master_key");

        const keyPair = await DCrypto.generateSigningKeyPair();
        setSigningKey(keyPair.privateKey);
        await DCrypto.saveKeyToStorage(keyPair.privateKey, "signing_key");

        const packed = await DCrypto.packPrivateKey(keyPair.privateKey, mKey);
        const pubKey = await DCrypto.exportPublicKey(keyPair.publicKey);

        return { publicKey: pubKey, encryptedPrivateKey: packed.encryptedKey, iv: packed.iv };
    };

    const initKeysForLogin = async (password: string, email: string, encKey: string, iv: string) => {
        const mKey = await DCrypto.deriveMasterKey(password, email);
        setMasterKey(mKey);
        await DCrypto.saveKeyToStorage(mKey, "master_key");

        const sKey = await DCrypto.unpackPrivateKey(encKey, iv, mKey);
        setSigningKey(sKey);
        await DCrypto.saveKeyToStorage(sKey, "signing_key");
    };

    return (
        <EncryptionContext.Provider value={{ masterKey, signingKey, userData, setMasterKey, setSigningKey, initKeysForRegister, initKeysForLogin, orbColors, setOrbColors}}>
            {children}
        </EncryptionContext.Provider>
    );
};

export const useEncryption = () => {
    const context = useContext(EncryptionContext);
    if (!context) throw new Error("useEncryption must be used within EncryptionProvider");
    return context;
};