import { $api } from "../api/axios";
import { DCrypto } from "../services/cryptoService";

import type { LoginInfo, RegisterInfo, AuthResponse } from "../types/auth"; 

export const AuthService = {
    async register(data: RegisterInfo) {
        return $api.post('/auth/register', data);
    },

    async login(data: LoginInfo) {
        const response = await $api.post<AuthResponse>('/auth/login', data);
        
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
        }
        return response;
    },

    async logout() {
        localStorage.removeItem('token');
        await DCrypto.clearAllKeys();
    }
};