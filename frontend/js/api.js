// ========================================
// TASKFLOW API - COMPLETE FIXED VERSION
// ========================================

// Use your WORKING backend URL directly
const API_BASE_URL = 'https://task-management-production-b99a.up.railway.app/api/tasks';

console.log('🔗 API Configured to:', API_BASE_URL);

class TaskAPI {
    static async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            // Build URL correctly - handle both / and no /
            let url = `${API_BASE_URL}${endpoint}`;
            // Fix double slash if needed
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
            
            // Handle 204 No Content (successful delete)
            if (response.status === 204) {
                return { success: true };
            }
            
            const data = await response.json();
            console.log(`✅ Response:`, data);
            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ API Error:', error);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout - server is not responding');
            }
            
            throw error;
        }
    }

    static async getAllTasks() {
        try {
            const tasks = await this.request('');
            console.log(`📋 Received ${tasks.length} tasks`);
            // Ensure we return an array
            return Array.isArray(tasks) ? tasks : [];
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            showToast('Failed to load tasks. Check if backend is running.', 'error');
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
        
        try {
            const result = await this.request(`/${id}`, { 
                method: 'DELETE' 
            });
            console.log(`✅ Task ${id} deleted successfully`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to delete task ${id}:`, error);
            throw error;
        }
    }

    static async checkHealth() {
        try {
            const healthUrl = API_BASE_URL.replace('/api/tasks', '/health');
            const response = await fetch(healthUrl, {
                signal: AbortSignal.timeout(5000)
            });
            const isHealthy = response.ok;
            console.log(`💚 Health check: ${isHealthy ? 'OK' : 'FAILED'}`);
            return isHealthy;
        } catch (error) {
            console.warn('Health check failed:', error.message);
            return false;
        }
    }
}

// Make available globally
window.TaskAPI = TaskAPI;

// Auto-test connection on load
setTimeout(async () => {
    try {
        const tasks = await TaskAPI.getAllTasks();
        console.log(`✅ Initial API Test: Loaded ${tasks.length} tasks`);
        if (tasks.length > 0) {
            console.log('Sample task:', tasks[0]);
        }
    } catch (error) {
        console.error('Initial API Test Failed:', error);
    }
}, 1000);