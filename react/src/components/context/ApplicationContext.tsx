import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { DCrypto } from '../../services/cryptoService';
import { ApplicationTheme, PerformanceMode, type FileItem, type Project, type User } from '../../types/auth';
import { UserService } from '../../services/userService';
import { ProjectService } from '../../services/projectService';
import $api from '../../api/axios';
import { useMediaQuery } from '@mui/material';

interface InitKeysResult {
    publicKey: string;
    encryptedPrivateKey: string;
    iv: string;
    exchangePublicKey: string;
    encryptedExchangePrivateKey: string;
    exchangeKeyIv: string;
    salt: string;
}

interface ApplicationContextType {
    masterKey: CryptoKey | null;
    signingKey: CryptoKey | null;
    exchangeKey: CryptoKey | null;
    currentProjectKey: CryptoKey | null;
    setCurrentProjectKey: React.Dispatch<React.SetStateAction<CryptoKey | null>>;

    userData: User | { fullName: 'Загрузка...', email: '', salt: '' };
    refreshUserData: () => Promise<void>;

    projectData: Project;
    setProjectData: React.Dispatch<React.SetStateAction<Project>>; 
    projects: Project[];
    refreshProjects: () => Promise<void>;
    refreshProjectData: () => Promise<void>;

    projectFiles: FileItem[];
    setProjectFiles: React.Dispatch<React.SetStateAction<FileItem[]>>;
    refreshProjectFiles: (projectId: string, pKey: CryptoKey) => Promise<void>;

    setMasterKey: React.Dispatch<React.SetStateAction<CryptoKey | null>>;
    setSigningKey: (key: CryptoKey | null) => void;
    initKeysForRegister: (password: string) => Promise<{ publicKey: string, encryptedPrivateKey: string, iv: string, salt: string; exchangePublicKey: string, encryptedExchangePrivateKey: string,  exchangeKeyIv: string}>;
    initKeysForLogin: (password: string, salt: string, encKey: string, iv: string,  encExchangeKey: string, exchangeIv: string) => Promise<void>;

    currentProjectId: string | null;

    orbColors: [string, string];
    setOrbColors: React.Dispatch<React.SetStateAction<[string, string]>>;

    theme: ApplicationTheme;
    setTheme: React.Dispatch<React.SetStateAction<ApplicationTheme>>;

    currentTheme: ApplicationTheme;
    setCurrentTheme: React.Dispatch<React.SetStateAction<ApplicationTheme>>;

    mode: PerformanceMode;
    setMode: React.Dispatch<React.SetStateAction<PerformanceMode>>;

    isDarkMode: boolean;

    refreshCurrentProjectId: (id: string) => void;
    clearCurrentProjectId: () => void;

    logout: () => void;
}

const ApplicationContext = createContext<ApplicationContextType | null>(null);

export const ApplicationProvider = ({ children }: { children: React.ReactNode }) => {
    const [masterKey, setMasterKey] = useState<CryptoKey | null>(null);

    const [signingKey, setSigningKey] = useState<CryptoKey | null>(null);

    const [exchangeKey, setExchangeKey] = useState<CryptoKey | null>(null);
    const [currentProjectKey, setCurrentProjectKey] = useState<CryptoKey | null>(null);
    
    const [userData, setUserData] = useState<User>({ fullName: 'Загрузка...', email: '', salt: '', orbColor1: 'rgba(112, 112, 112, 0)', orbColor2: 'rgba(112, 112, 112, 0)', theme: ApplicationTheme.Auto, mode: PerformanceMode.On });
    const [projectData, setProjectData] = useState<Project>({ id: "123", name: 'Загрузка...', iv: "123", isPublic: false, priority: "Low", status: "Active", encryptedProjectKey: "", keyIv: "", role: 'Viewer'});
    
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    const [projects, setProjects] = useState<Project[]>([]);
    const [projectFiles, setProjectFiles] = useState<FileItem[]>([]);

    const [orbColors, setOrbColors] = useState<[string, string]>([
        'rgba(112, 112, 112, 0)',
        'rgba(112, 112, 112, 0)' 
    ]);

    const [theme, setTheme] = useState<ApplicationTheme>(ApplicationTheme.Auto);
    const [currentTheme, setCurrentTheme] = useState<ApplicationTheme>(ApplicationTheme.Auto);
    const [mode, setMode] = useState<PerformanceMode>(PerformanceMode.On);

    const systemPrefersDark = useMediaQuery('(prefers-color-scheme: dark)');
    const isDarkMode = useMemo(() => {
        if (theme === 'Auto') {
            console.log("System prefers dark mode:", systemPrefersDark);
            return systemPrefersDark; 
        }
        console.log("User theme preference:", theme);
        return theme === 'Dark'; 
    }, [theme, systemPrefersDark]);

    useEffect(() => {
        const activeTheme = isDarkMode ? ApplicationTheme.Dark : ApplicationTheme.Light;
        setCurrentTheme(activeTheme);
        console.log("Theme synchronized to:", activeTheme);
    }, [isDarkMode]);

    const refreshUserData = async () => {
        try {
            const data = await UserService.getUser();
            setUserData(data);

            if (data.orbColor1 && data.orbColor2) setOrbColors([data.orbColor1, data.orbColor2]);
            if (data.theme) setTheme(data.theme);
            if (data.mode) setMode(data.mode);
        } catch (error) {
            console.error("Ошибка обновления данных пользователя", error);
            setUserData({ fullName: 'Гость', email: 'Ошибка загрузки', salt: '', orbColor1: 'rgba(140, 0, 0, 0.52)', orbColor2: 'rgba(140, 0, 0, 0.52)', theme: ApplicationTheme.Auto, mode: PerformanceMode.On });
        }
    };
    

    const refreshProjects = async () => {
        if (!masterKey) return;
        try {
            const data = await ProjectService.getProjects();
            const myExchangePrivateKey = await DCrypto.loadKeyFromStorage("exchange_private_key");
            const decryptedProjects = await Promise.all(data.map(async (p: any) => {
                try {
                    const pKey = await DCrypto.unwrapProjectKey(p, masterKey, myExchangePrivateKey);
                    const clearName = await DCrypto.decrypt(p.name, p.iv, pKey);
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

    const refreshProjectFiles = async (projectId: string, pKey: CryptoKey) => {
        if (!pKey) return; 
        try {
            const response = await $api.get<any[]>(`/files/project/${projectId}`);
            const decryptedFiles = await Promise.all(response.data.map(async f => {
                try {
                    const name = await DCrypto.decrypt(f.name, f.iv, pKey);
                    // const name = await DCrypto.decrypt(f.name, f.iv, masterKey);
                    
                    const rawTags = f.tags || [];
                    const decryptedTags = await Promise.all(rawTags.map(async (t: any) => {
                        try {
                            return await DCrypto.decrypt(t.encryptedName, t.iv, pKey);
                        } catch { return null; }
                    }));

                    return { ...f, name, links: f.links || [], tags: decryptedTags.map((t, i) => ({ index: rawTags[i].index, encryptedName: rawTags[i].encryptedName, iv: rawTags[i].iv, decryptedName: t })) || [] };
                } catch { return { ...f, name: "Ошибка расшифровки" }; }
            }));
            setProjectFiles(decryptedFiles);
        } catch (err) {
            console.error("Ошибка загрузки файлов:", err);
        }
    };

    const refreshProjectData = async () => {
        if (currentProjectId && masterKey && currentProjectKey) {
            const data = await ProjectService.getProjectById(currentProjectId);
            const clearName = await DCrypto.decrypt(data.name, data.iv, currentProjectKey);
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
            status: "Active",
            encryptedProjectKey: "",
            keyIv: "",
            role: "",
        });
    };

    useEffect(() => {
        if (!currentProjectId) {
            setProjectFiles([]);
            setCurrentProjectKey(null);
            return;
        }

        if(currentProjectId){
            ProjectService.getProjectById(currentProjectId).then( async data => {    
                try {
                const myExchangePrivateKey = await DCrypto.loadKeyFromStorage("exchange_private_key");
                const pKey = await DCrypto.unwrapProjectKey(data, masterKey, myExchangePrivateKey); 

                if (data.isPublic && !masterKey) {
                    setUserData({ 
                        fullName: "Гость", 
                        email: 'Без регистрации', 
                        salt: '', 
                        orbColor1: 'rgba(100, 100, 100, 0)', 
                        orbColor2: 'rgba(100, 100, 100, 0)', 
                        theme: ApplicationTheme.Auto, 
                        mode: PerformanceMode.On 
                    });
                    setOrbColors(['rgba(100, 100, 100, 0)', 'rgba(100, 100, 100, 0)']);
                }
                setCurrentProjectKey(pKey); 
                const clearName = await DCrypto.decrypt(data.name, data.iv, pKey);
                
                setProjectData({
                        id: data.id,      
                        name: clearName,  
                        iv: data.iv,
                        isPublic: data.isPublic,
                        priority: data.priority,
                        status: data.status,
                        encryptedProjectKey: data.encryptedProjectKey,                  
                        keyIv: data.keyIv,
                        role: data.role
                    });

                refreshProjectFiles(currentProjectId, pKey);
            } catch (cryptoErr) {   
                console.error("ОШИБКА ДЕШИФРОВКИ КЛЮЧА ПРОЕКТА:", cryptoErr);
                setProjectData(prev => ({ ...prev, name: "Ошибка доступа" }));
            }
        });

        } 
        else { setProjectFiles([]); if (!currentProjectId) setCurrentProjectKey(null); }
   }, [currentProjectId, masterKey])

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            refreshUserData();
        }

        if (masterKey && signingKey) { 
            refreshProjects();
        }
    }, [masterKey, signingKey]);

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

        const exchangeKeyPair = await DCrypto.generateExchangeKeyPair();
        await DCrypto.saveKeyToStorage(exchangeKeyPair.privateKey, "exchange_private_key");
        const packedExchange = await DCrypto.packPrivateKey(exchangeKeyPair.privateKey, mKey);
        const pubPackedExchange = await DCrypto.exportPublicKey(exchangeKeyPair.publicKey);
        
        return { publicKey: pubKey, encryptedPrivateKey: packed.encryptedKey, iv: packed.iv , exchangePublicKey: pubPackedExchange, encryptedExchangePrivateKey: packedExchange.encryptedKey,  exchangeKeyIv: packedExchange.iv, salt: salt};
    };

    const initKeysForLogin = async (password: string, salt: string, encKey: string, iv: string, encExchangeKey: string, exchangeIv: string) => {

        const mKey = await DCrypto.deriveMasterKey(password, salt);
        setMasterKey(mKey);
        await DCrypto.saveKeyToStorage(mKey, "master_key");

        const sKey = await DCrypto.unpackPrivateKey(encKey, iv, mKey, 'signing');
        setSigningKey(sKey);
        await DCrypto.saveKeyToStorage(sKey, "signing_key");


        if (!encExchangeKey || !exchangeIv) {
            console.warn("У пользователя отсутствуют ключи обмена");
            alert("Отсутствуют ключи обмена")
            return; 
        }

        const exKey = await DCrypto.unpackPrivateKey(encExchangeKey, exchangeIv, mKey, 'exchange');
        setExchangeKey(exKey);
        await DCrypto.saveKeyToStorage(exKey, "exchange_private_key");
    };

    const logout = () => {
        setMasterKey(null);
        setSigningKey(null);
        setExchangeKey(null);

        setUserData({ 
            fullName: 'Загрузка...', 
            email: '', 
            salt: '', 
            orbColor1: 'rgba(0, 0, 0, 0)', 
            orbColor2: 'rgba(0, 0, 0, 0)' ,
            theme: ApplicationTheme.Auto,
            mode: PerformanceMode.On,
        });

        setProjects([]);
        clearCurrentProjectId();

        localStorage.removeItem('token');
        DCrypto.clearAllKeys(); 
    };

    return (
        <ApplicationContext.Provider value={{ masterKey, signingKey, exchangeKey, currentProjectKey, userData, setCurrentProjectKey, refreshUserData, setMasterKey, setSigningKey, initKeysForRegister, initKeysForLogin, orbColors, setOrbColors, theme, setTheme, currentTheme, setCurrentTheme, mode, setMode, isDarkMode, refreshCurrentProjectId, currentProjectId, projectData, setProjectData, projects, refreshProjects, refreshProjectData, clearCurrentProjectId, projectFiles, setProjectFiles, refreshProjectFiles, logout }}>
            {children}
        </ApplicationContext.Provider>
    );
};

export const useApplication = () => {
    const context = useContext(ApplicationContext);
    if (!context) throw new Error("useApplication must be used within ApplicationProvider");
    return context;
};