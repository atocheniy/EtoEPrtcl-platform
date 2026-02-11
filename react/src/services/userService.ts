import { $api } from "../api/axios";

export interface User {
    email: string;
    fullName: string;
}

export const UserService = {
    async getUser() {
        const response = await $api.get<User>('/auth/me');
        return response.data; 
    },
};
