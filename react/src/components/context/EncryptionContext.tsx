import React, { createContext, useState, useContext, useEffect } from 'react';
import { DCrypto } from '../../services/cryptoService';
import type { FileItem, Project, User } from '../../types/auth';
import { UserService } from '../../services/userService';
import { ProjectService } from '../../services/projectService';
import $api from '../../api/axios';

interface InitKeysResult {
    publicKey: string;
    encryptedPrivateKey: string;
    iv: string;
    salt: string;
}

interface EncryptionContextType {
    masterKey: CryptoKey | null;
    signingKey: CryptoKey | null;

    userData: User | { fullName: 'Загрузка...', email: '' };
    refreshUserData: () => Promise<void>;

    projectData: Project; 
    projects: Project[];
    refreshProjects: () => Promise<void>;
    refreshProjectData: () => Promise<void>;

    projectFiles: FileItem[];
    setProjectFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
    refreshProjectFiles: (projectId: string) => Promise<void>;

    setMasterKey: React.Dispatch<React.SetStateAction<CryptoKey | null>>;
    setSigningKey: (key: CryptoKey | null) => void;
    initKeysForRegister: (password: string, email: string) => Promise<{ publicKey: string, encryptedPrivateKey: string, iv: string, salt: string;}>;
    initKeysForLogin: (password: string, salt: string, encKey: string, iv: string) => Promise<void>;

    currentProjectId: string | null;
    orbColors: [string, string];
    setOrbColors: React.Dispatch<React.SetStateAction<[string, string]>>;
    refreshCurrentProjectId: (id: string) => void;
    clearCurrentProjectId: () => void;
}

const EncryptionContext = createContext<EncryptionContextType | null>(null);

export const EncryptionProvider = ({ children }: { children: React.ReactNode }) => {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);
    const [signingKey, setSigningKey] = useState<CryptoKey | null>(null);
    const [userData, setUserData] = useState<User>({ fullName: 'Загрузка...', email: '', salt: '', orbColor1: 'rgba(0, 0, 0, 0)', orbColor2: 'rgba(0, 0, 0, 0)' });
    const [projectData, setProjectData] = useState<Project>({ id: "123", name: 'Загрузка...', iv: "123", isPublic: false, priority: "Low", status: "Active"});
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);

    const [orbColors, setOrbColors] = useState<[string, string]>([
        'rgba(99, 102, 241, 0.3)',
        'rgba(169, 85, 247, 0.15)' 
    ]);

    const refreshUserData = async () => {
        try {
            const data = await UserService.getUser();
            setUserData(data);

            if (data.orbColor1 && data.orbColor2) setOrbColors([data.orbColor1, data.orbColor2]);
        } catch (error) {
            console.error("Ошибка обновления данных пользователя", error);
            setUserData({ fullName: 'Гость', email: 'Ошибка загрузки', salt: '', orbColor1: 'rgba(0, 0, 0, 0)', orbColor2: 'rgba(0, 0, 0, 0)' });
        }
    };
    

    const refreshProjects = async () => {
        if (!masterKey) return;
        try {
            const data = await ProjectService.getProjects();
            const decryptedProjects = await Promise.all(data.map(async (p: any) => {
                try {
                    const clearName = await DCrypto.decrypt(p.name, p.iv, masterKey);
                    return { ...p, name: clearName };
                } catch (e) {
                    return { ...p, name: "Ошибка расшифровки" };
                }
            }));
            setProjects(decryptedProjects);
        } catch (error) {
            console.error("Ошибка загрузки проектов", error);
        }
    };

    const refreshProjectFiles = async (projectId: string) => {
        if (!masterKey) return;
        try {
            const response = await $api.get<FileItem[]>(`/files/project/${projectId}`);
            const decryptedFiles = await Promise.all(response.data.map(async f => {
                try {
                    const name = await DCrypto.decrypt(f.name, f.iv, masterKey);
                    return { ...f, name };
                } catch { return { ...f, name: "Ошибка расшифровки" }; }
            }));
            setProjectFiles(decryptedFiles);
        } catch (err) {
            console.error("Ошибка загрузки файлов:", err);
        }
    };

    const refreshProjectData = async () => {
        if (currentProjectId && masterKey) {
            const data = await ProjectService.getProjectById(currentProjectId);
            const clearName = await DCrypto.decrypt(data.name, data.iv, masterKey);
            setProjectData({ ...data, name: clearName });
        }
    };

    const refreshCurrentProjectId = (id: string) => {
        console.log(id);
        setCurrentProjectId(id);
    }

    const clearCurrentProjectId = () => {
        setCurrentProjectId(null);
        setProjectFiles([]);
        setProjectData({ 
            id: "123", 
            name: 'Загрузка...', 
            iv: "123", 
            isPublic: false, 
            priority: "Low", 
            status: "Active"
        });
    };

    useEffect(() => {
        if(currentProjectId && masterKey){
            ProjectService.getProjectById(currentProjectId).then( async data => {    
                const clearName = await DCrypto.decrypt(data.name, data.iv, masterKey);
                setProjectData({
                        id: data.id,      
                        name: clearName,  
                        iv: data.iv,
                        isPublic: data.isPublic,
                        priority: data.priority,
                        status: data.status
                    });
            }).catch(err => console.error(err));

            refreshProjectFiles(currentProjectId);
        } else { setProjectFiles([]); }
   }, [currentProjectId, masterKey])

    useEffect(() => {
        if (masterKey) {
            refreshProjects();
            refreshUserData();
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

    const initKeysForRegister = async (password: string): Promise<InitKeysResult> => {
        const salt = await DCrypto.generateUniqueSalt();

        const mKey = await DCrypto.deriveMasterKey(password, salt);
        setMasterKey(mKey);
        await DCrypto.saveKeyToStorage(mKey, "master_key");

        const keyPair = await DCrypto.generateSigningKeyPair();
        setSigningKey(keyPair.privateKey);
        await DCrypto.saveKeyToStorage(keyPair.privateKey, "signing_key");

        const packed = await DCrypto.packPrivateKey(keyPair.privateKey, mKey);
        const pubKey = await DCrypto.exportPublicKey(keyPair.publicKey);

        return { publicKey: pubKey, encryptedPrivateKey: packed.encryptedKey, iv: packed.iv , salt: salt};
    };

    const initKeysForLogin = async (password: string, salt: string, encKey: string, iv: string) => {

        const mKey = await DCrypto.deriveMasterKey(password, salt);
        setMasterKey(mKey);
        await DCrypto.saveKeyToStorage(mKey, "master_key");

        const sKey = await DCrypto.unpackPrivateKey(encKey, iv, mKey);
        setSigningKey(sKey);
        await DCrypto.saveKeyToStorage(sKey, "signing_key");
    };

    return (
        <EncryptionContext.Provider value={{ masterKey, signingKey, userData, refreshUserData, setMasterKey, setSigningKey, initKeysForRegister, initKeysForLogin, orbColors, setOrbColors, refreshCurrentProjectId, currentProjectId, projectData, projects, refreshProjects, refreshProjectData, clearCurrentProjectId, projectFiles, setProjectFiles, refreshProjectFiles }}>
            {children}
        </EncryptionContext.Provider>
    );
};

export const useEncryption = () => {
    const context = useContext(EncryptionContext);
    if (!context) throw new Error("useEncryption must be used within EncryptionProvider");
    return context;
};