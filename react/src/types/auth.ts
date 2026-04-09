export interface LoginInfo {
    email: string;
    password: string;
}

export interface RegisterInfo {
    email: string;
    password: string;
    fullName?: string;

    exchangePublicKey: string;           
    encryptedExchangePrivateKey: string; 
    exchangeKeyIv: string;   

    signSalt: string;
    theme: ApplicationTheme;
    mode: PerformanceMode;
}

export interface AuthResponse {
    token: string;

    encryptedExchangePrivateKey: string; 
    exchangeKeyIv: string;

    message?: string; 
    salt: string;
}

export interface User{
    email: string;
    fullName: string;
    salt: string;
    orbColor1: string;  
    orbColor2: string;  
    theme: ApplicationTheme;
    mode: PerformanceMode;
}

export const ApplicationTheme = {
    Light: 'Light',
    Dark: 'Dark',
    Auto: 'Auto'
} as const;
export type ApplicationTheme = typeof ApplicationTheme[keyof typeof ApplicationTheme];

export const PerformanceMode = {
    On: 'On',
    Off: 'Off',
    Auto: 'Auto'
} as const;
export type PerformanceMode = typeof PerformanceMode[keyof typeof PerformanceMode];

export interface UpdateName {
    newName: string;
}

export interface UpdateEmail{
    newEmail: string;
}

export interface FileItem {
    id: string;
    name: string;
    extension: string;
    iv: string;
    parentId: string | null;
    isFolder: boolean;
    links?: string[];
    tags?: Tag[];
}

export interface Tag {
    index: string;
    encryptedName: string;
    iv: string;
    decryptedName?: string;
}

export interface Project {
    id: string;
    name: string;
    iv: string;
    isPublic: boolean;
    priority: ProjectPriority;
    status: ProjectStatus;
    encryptedProjectKey: string;
    keyIv: string;
    role: string;
    publicEncryptedKey?: string;
    publicKeyIv?: string;
}

export const ProjectPriority = {
    Low: 'Low',
    Medium: 'Medium',
    High: 'High'
} as const;
export type ProjectPriority = typeof ProjectPriority[keyof typeof ProjectPriority];

export const ProjectStatus = {
    Planning: 'Planning',
    Active: 'Active',
    Hold: 'Hold',
    Completed: 'Completed'
} as const;
export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const listVariants = {
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
    },
  }),
  hidden: { opacity: 0, x: -20 },
  exit: { opacity: 0, x: -10, transition: { duration: 0.1 } }
};