export interface LoginInfo {
    email: string;
    password: string;
}

export interface RegisterInfo {
    email: string;
    password: string;
    fullName?: string;
    signingPublicKey: string;
    encryptedSigningPrivateKey: string; 
    signingKeyIv: string; 
}

export interface AuthResponse {
    token: string;
    encryptedSigningPrivateKey: string;
    signingKeyIv: string;
    message?: string; 
}

export interface User{
    email: string;
    fullName: string;
}