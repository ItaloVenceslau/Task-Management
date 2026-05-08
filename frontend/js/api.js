// ========================================
// TASKFLOW API - REAL BACKEND ONLY
// ========================================

const API_BASE_URL = CLASSIC_BACKEND;

console.log('🔗 API Connected to:', API_BASE_URL);

class TaskAPI {
    static async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            let url = `${API_BASE_URL}${endpoint}`;
            url = url.replace(/([^:]\/)\/+/g, "$1");
            
            console.log(`📡 ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, {
                ...mergedOptions,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                let errorMessage = `HTTP Error: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {}
                throw new Error(errorMessage);
            }
            
            if (response.status === 204) {
                return { success: true };
            }
            
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    static async getAllTasks() {
        try {
            const tasks = await this.request('');
            console.log(`📋 Backend returned ${tasks.length} tasks`);
            return Array.isArray(tasks) ? tasks : [];
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            return [];
        }
    }

    static async getTaskById(id) {
        if (!id) throw new Error('Task ID is required');
        return await this.request(`/${id}`);
    }

    static async createTask(title, description) {
        if (!title || !description) {
            throw new Error('Title and description are required');
        }
        return await this.request('', {
            method: 'POST',
            body: JSON.stringify({ title, description })
        });
    }

    static async updateTask(id, updates) {
        if (!id) throw new Error('Task ID is required');
        return await this.request(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    }

    static async deleteTask(id) {
        if (!id) throw new Error('Task ID is required');
        console.log(`🗑️ Deleting task ${id}...`);
        await this.request(`/${id}`, { method: 'DELETE' });
        console.log(`✅ Task ${id} deleted`);
        return true;
    }

    static async checkHealth() {
        try {
            const healthUrl = API_BASE_URL.replace('/api/tasks', '/health');
            const response = await fetch(healthUrl);
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error.message);
            return false;
        }
    }
}

window.TaskAPI = TaskAPI;

// Test on load
setTimeout(async () => {
    try {
        const tasks = await TaskAPI.getAllTasks();
        console.log(`✅ Connected to backend. Found ${tasks.length} tasks`);
        if (tasks.length > 0) {
            console.log('First task:', tasks[0]);
        }
    } catch (error) {
        console.error('❌ Backend connection failed:', error.message);
    }
}, 1000);