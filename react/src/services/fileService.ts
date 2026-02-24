import { $api } from "../api/axios";
import type { FileItem } from "../types/auth";

export const FileService = {
    async createFile(name: string, projectId: string) {
        const response = await $api.post<FileItem>('/files', { name, projectId });
        return response.data; 
    },

    async deleteFile(id: string) {
        const response = await $api.delete(`/files/${id}`);
        return response.data;
    },

    async updateFileMetadata(id: string, name: string, extension: string, iv: string) {
        const response = await $api.put(`/files/${id}`, { name, extension, iv });
        return response.data;
    },

    async updateFileContent(id: string, content: string, iv: string) {
        const response = await $api.put(`/files/${id}`, { content, iv });
        return response.data;
    },
    
    async getFiles() {
         const response = await $api.get<File[]>('/files');
         return response.data;
    },

    async getFileById(id: string) {
         const response = await $api.get<File>(`/files/${id}`);
         return response.data;
    }
};
