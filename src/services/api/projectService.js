import { api, errorHandler } from '../../utils/api';

export const projectService = {
  async getAllProjects(params) {
    try {
      const response = await api.get('/projects', { params });
      return response.data;
    } catch (error) {
      errorHandler.logError(error, { context: 'getAllProjects', params });
      throw error;
    }
  },

  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response.data;
    } catch (error) {
      errorHandler.logError(error, { context: 'createProject', projectData });
      throw error;
    }
  },

  async getProjectById(id) {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data;
    } catch (error) {
      errorHandler.logError(error, { context: 'getProjectById', id });
      throw error;
    }
  },

  async updateProject(id, projectData) {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data;
    } catch (error) {
      errorHandler.logError(error, { context: 'updateProject', id, projectData });
      throw error;
    }
  },

  async deleteProject(id) {
    try {
      await api.delete(`/projects/${id}`);
      return true;
    } catch (error) {
      errorHandler.logError(error, { context: 'deleteProject', id });
      throw error;
    }
  }
};





