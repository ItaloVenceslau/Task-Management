// ========================================
// API SERVICE - Backend Communication
// ========================================

// Use Railway backend URL or localhost for development
const API_BASE_URL = import.meta.env.VITE_CLASSIC_BACKEND;

class TaskAPI {
    static async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, mergedOptions);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getAllTasks() {
        const tasks = await this.request('');
        return Array.isArray(tasks) ? tasks : [];
    }

    static async getTaskById(id) {
        return await this.request(`/${id}`);
    }

    static async createTask(title, description) {
        return await this.request('', {
            method: 'POST',
            body: JSON.stringify({ title, description })
        });
    }

    static async updateTask(id, updates) {
        return await this.request(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    static async deleteTask(id) {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Delete failed');
        }
        
        return true;
    }

    static async checkHealth() {
        try {
            await this.request('');
            return true;
        } catch {
            return false;
        }
    }
}

// Make available globally
window.TaskAPI = TaskAPI;