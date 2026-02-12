import axios from 'axios';
import { DCrypto } from '../services/cryptoService';

export const $api = axios.create({
    baseURL: 'https://localhost:7173/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

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