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

//============SigningKeysVerification===============//

$api.interceptors.request.use(async (config) => {
    const token = localStorage.getItem('token'); 
    const signingKey = await DCrypto.loadKeyFromStorage("signing_key");

    if (signingKey && config.method) 
    {
        const timestamp = Date.now().toString();
        const method = config.method.toUpperCase();
        const url = config.url || "";

        const cleanPath = url.startsWith('/') ? `/api${url}` : `/api/${url}`;
        
        const message = `${method}|${cleanPath}|${timestamp}`;

        // console.log(`[FRONTEND SIGN] Message: ${message}`);
        
        const signature = await DCrypto.signData(signingKey, message);

        config.headers['X-Signature'] = signature;
        config.headers['X-Timestamp'] = timestamp;
    }
    
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default $api;