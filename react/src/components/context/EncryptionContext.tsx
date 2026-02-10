import React, { createContext, useState, useContext } from 'react';
import { DCrypto } from '../../services/cryptoService';


interface EncryptionContextType {
    masterKey: CryptoKey | null;
    setMasterKey: React.Dispatch<React.SetStateAction<CryptoKey | null>>;
    initKey: (password: string, email: string) => Promise<void>;
}

const EncryptionContext = createContext<EncryptionContextType | null>(null);

export const EncryptionProvider = ({ children }: { children: React.ReactNode }) => {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

    const initKey = async (password: string, email: string) => {
        const key = await DCrypto.deriveMasterKey(password, email);
        setMasterKey(key);
        await DCrypto.saveKeyToStorage(key); 
    };

    return (
        <EncryptionContext.Provider value={{ masterKey, setMasterKey, initKey }}>
            {children}
        </EncryptionContext.Provider>
    );
};

export const useEncryption = () => {
    const context = useContext(EncryptionContext);
    if (!context) throw new Error("useEncryption must be used within EncryptionProvider");
    return context;
};