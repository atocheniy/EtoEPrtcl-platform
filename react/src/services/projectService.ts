import { $api } from "../api/axios";
import type { Project, ProjectPriority, ProjectStatus } from "../types/auth";

export const ProjectService = {
    async createProject(projectData: { name: string, iv: string, encryptedProjectKey: string, projectKeyIv: string }) {
        const response = await $api.post('/projects', projectData);
        return response.data;
    },

    async deleteProject(id: string) {
        const response = await $api.delete(`/projects/${id}`);
        return response.data;
    },

    async updateProject(projectData: {id: string, name: string, iv: string, isPublic: boolean, priority: ProjectPriority, status: ProjectStatus, publicEncryptedKey?: string, publicKeyIv?: string}) {
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
    },

    async addMember(projectId: string, memberData: any) {
        return await $api.post(`/projects/${projectId}/members`, memberData);
    },

    async getMembers(projectId: string) {
        const response = await $api.get(`/projects/${projectId}/members`);
        return response.data;
    },
    async removeMember(projectId: string, userId: string) {
        return await $api.delete(`/projects/${projectId}/members/${userId}`);
    },
    async updateMemberRole(projectId: string, userId: string, role: string) {
        return await $api.patch(`/projects/${projectId}/members/${userId}/role`, JSON.stringify(role));
    }
};
