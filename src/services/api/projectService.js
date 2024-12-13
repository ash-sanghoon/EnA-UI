// import { api, errorHandler } from '../../utils/api';

// export const projectService = {
//   async getAllProjects(params) {
//     try {
//       const response = await api.get('/projects', { params });
//       return response.data;
//     } catch (error) {
//       errorHandler.logError(error, { context: 'getAllProjects', params });
//       throw error;
//     }
//   },

//   async createProject(projectData) {
//     try {
//       const response = await api.post('/projects', projectData);
//       return response.data;
//     } catch (error) {
//       errorHandler.logError(error, { context: 'createProject', projectData });
//       throw error;
//     }
//   },

//   async getProjectById(id) {
//     try {
//       const response = await api.get(`/projects/${id}`);
//       return response.data;
//     } catch (error) {
//       errorHandler.logError(error, { context: 'getProjectById', id });
//       throw error;
//     }
//   },

//   async updateProject(id, projectData) {
//     try {
//       const response = await api.put(`/projects/${id}`, projectData);
//       return response.data;
//     } catch (error) {
//       errorHandler.logError(error, { context: 'updateProject', id, projectData });
//       throw error;
//     }
//   },

//   async deleteProject(id) {
//     try {
//       await api.delete(`/projects/${id}`);
//       return true;
//     } catch (error) {
//       errorHandler.logError(error, { context: 'deleteProject', id });
//       throw error;
//     }
//   }
// };

import { api, errorHandler } from '../../utils/api';

export const projectService = {
  async getAllProjects(params) {
    try {
      // First try to read from the filesystem
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      return await response.json();
    } catch (error) {
      errorHandler.logError(error, { context: 'getAllProjects', params });
      throw error;
    }
  },

  async createProject(projectData) {
    try {
      const formData = new FormData();
      Object.entries(projectData).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await fetch('/api/create-project', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to create project');
      return await response.json();
    } catch (error) {
      errorHandler.logError(error, { context: 'createProject', projectData });
      throw error;
    }
  },

  async getProjectById(id) {
    try {
      const response = await fetch(`/api/projects/${id}`);
      if (!response.ok) throw new Error('Failed to fetch project');
      return await response.json();
    } catch (error) {
      errorHandler.logError(error, { context: 'getProjectById', id });
      throw error;
    }
  },

  async uploadDrawings(projectId, files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/upload-drawing?projectId=${projectId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload drawings');
      return await response.json();
    } catch (error) {
      errorHandler.logError(error, { context: 'uploadDrawings', projectId });
      throw error;
    }
  }
};




