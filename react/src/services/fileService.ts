import { $api } from "../api/axios";

interface FileItem {
    id: string;
    name: string;
    extension: string;
}

export const FileService = {
    async createFile(name: string, projectId: string) {
        const response = await $api.post<FileItem>('/files', { name, projectId });
        return response.data; 
    },

    async updateFileContent(id: string, content: string) {
        const response = await $api.put(`/files/${id}`, { content });
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
