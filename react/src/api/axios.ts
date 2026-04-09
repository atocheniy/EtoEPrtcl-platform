import axios from 'axios';
import { DCrypto } from '../services/cryptoService';

export const $api = axios.create({
    baseURL: 'https://localhost:7173/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

$api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config.url.includes('/auth/login') || 
                              error.config.url.includes('/auth/register');

         if (error.response && error.response.status === 401 && !isAuthRequest) {
            console.warn("Сессия истекла");
            
            localStorage.removeItem('token');
            DCrypto.clearAllKeys();

            if (!window.location.pathname.includes('/login') && 
                !window.location.pathname.includes('/register')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }   
);

$api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token'); 

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default $api;