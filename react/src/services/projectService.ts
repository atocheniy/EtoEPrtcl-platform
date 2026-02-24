import { $api } from "../api/axios";
import type { Project, ProjectPriority, ProjectStatus } from "../types/auth";

export const ProjectService = {
    async createProject(projectData: { name: string, iv: string }) {
        const response = await $api.post('/projects', projectData);
        return response.data;
    },

    async deleteProject(id: string) {
        const response = await $api.delete(`/projects/${id}`);
        return response.data;
    },

    async updateProject(projectData: {id: string, name: string, iv: string, isPublic: boolean, priority: ProjectPriority, status: ProjectStatus}) {
        const response = await $api.put(`/projects/${projectData.id}`, projectData);
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
