import axios from 'axios';

// Get API URL from environment variables or runtime config
const getApiUrl = () => {
  // Check for runtime environment config (injected by Docker)
  if (typeof window !== 'undefined' && (window as any)._env_?.REACT_APP_API_URL) {
    return (window as any)._env_.REACT_APP_API_URL;
  }
  
  // Fall back to build-time environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Default for development
  return 'http://localhost:5000';
};

const API_BASE_URL = getApiUrl() + '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  dueDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse {
  success: boolean;
  data?: Task | Task[];
  count?: number;
  error?: string;
  message?: string;
}

class TaskService {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const response = await api.get<ApiResponse>('/tasks');
      return response.data.data as Task[];
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch tasks');
    }
  }

  // Get single task
  async getTask(id: string): Promise<Task> {
    try {
      const response = await api.get<ApiResponse>(`/tasks/${id}`);
      return response.data.data as Task;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to fetch task');
    }
  }

  // Create new task
  async createTask(task: Omit<Task, '_id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      const response = await api.post<ApiResponse>('/tasks', task);
      return response.data.data as Task;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to create task');
    }
  }

  // Update task
  async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    try {
      const response = await api.put<ApiResponse>(`/tasks/${id}`, task);
      return response.data.data as Task;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to update task');
    }
  }

  // Delete task
  async deleteTask(id: string): Promise<void> {
    try {
      await api.delete<ApiResponse>(`/tasks/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to delete task');
    }
  }

  // Toggle task completion
  async toggleTaskCompletion(id: string, completed: boolean): Promise<Task> {
    return this.updateTask(id, { completed });
  }

  // Trigger ETL workflow
  async triggerETL(adminToken: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const response = await api.post('/etl/trigger-etl', {}, {
        headers: {
          'x-admin-token': adminToken
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to trigger ETL workflow');
    }
  }
}

const taskServiceInstance = new TaskService();
export default taskServiceInstance;