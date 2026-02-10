import { $api } from "../api/axios";

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

    logout() {
        localStorage.removeItem('token');
    }
};