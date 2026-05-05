// ========================================
// TASKFLOW API - COMPLETE FIXED VERSION
// ========================================

// Get the correct API URL based on environment
const getAPIBaseURL = () => {
    // Get current hostname
    const hostname = window.location.hostname;
    
    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:3000/api/tasks';
    }
    
    // Production on Vercel - Use YOUR Railway URL
    // IMPORTANT: Replace this with your actual Railway URL
    return 'https://task-management-production-b99a.up.railway.app/api/tasks';
};

const API_BASE_URL = getAPIBaseURL();
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
        
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const url = `${API_BASE_URL}${endpoint}`;
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
            
            // Handle 204 No Content
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
            return Array.isArray(tasks) ? tasks : [];
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            // Don't show toast here to avoid spam
            return [];
        }
    }

    static async getTaskById(id) {
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
        await this.request(`/${id}`, { method: 'DELETE' });
        return true;
    }

    static async checkHealth() {
        try {
            const healthUrl = API_BASE_URL.replace('/api/tasks', '/health');
            const response = await fetch(healthUrl, {
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error.message);
            return false;
        }
    }
}

// Make available globally
window.TaskAPI = TaskAPI;

// Auto test connection on load
setTimeout(async () => {
    try {
        const healthy = await TaskAPI.checkHealth();
        console.log(`💚 Backend health: ${healthy ? 'OK' : 'FAILED'}`);
        if (healthy) {
            const tasks = await TaskAPI.getAllTasks();
            console.log(`📋 Backend has ${tasks.length} tasks`);
        }
    } catch (error) {
        console.error('Connection test failed:', error);
    }
}, 1000);