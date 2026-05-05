// O valor abaixo será substituído automaticamente pela Vercel no deploy
const API_BASE_URL = 'https://task-management-production-b99a.up.railway.app/api/tasks';

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
            // Garante que não haja barras duplas acidentais
            const url = `${API_BASE_URL}${endpoint}`;
            const response = await fetch(url, mergedOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na API TaskFlow:', error);
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
        await this.request(`/${id}`, { method: 'DELETE' });
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

// Disponibiliza globalmente ANTES do app.js carregar
window.TaskAPI = TaskAPI;
