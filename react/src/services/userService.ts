import { $api } from "../api/axios";
import type { ApplicationTheme, UpdateEmail, UpdateName, User } from "../types/auth";

export const UserService = {
    async getUser() {
        const response = await $api.get<User>('/auth/me');
        return response.data; 
    },

    async changeName(data: UpdateName) {
        return $api.post('/auth/change-name', data);
    },

    async changeEmail(data: UpdateEmail) {
        return $api.post('/auth/change-email', data);
    },

    async updateColors(color1: string, color2: string) {
        return await $api.patch('/auth/colors', { color1, color2 });
    },

    async updateTheme(theme: ApplicationTheme) {
        return await $api.patch('/auth/theme', { theme });
    },

    async searchUser(email: string) {
        const response = await $api.get(`/auth/search?email=${email}`);
        return response.data;
    }
};
