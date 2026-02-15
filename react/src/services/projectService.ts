import { $api } from "../api/axios";
import type { Project } from "../types/auth";

export const ProjectService = {
    async createProject(projectData: { name: string, iv: string }) {
        const response = await $api.post('/projects', projectData);
        return response.data;
    },
    
    async getProjects() {
         const response = await $api.get<Project[]>('/projects');
         return response.data;
    },

    async getProjectById(id: string) {
         const response = await $api.get<Project>(`/projects/${id}`);
         return response.data;
    }
};
