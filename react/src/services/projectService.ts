import { $api } from "../api/axios";

export interface Project {
    id: string;
    name: string;
    iv: string;
}

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
