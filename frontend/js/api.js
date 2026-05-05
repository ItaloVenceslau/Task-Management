// API Configuration - Automatically works in all environments
// For local development: http://localhost:3000/api/tasks
// For production: Your Railway URL

// Detect environment and set API URL

// Fallback for showToast if not defined
if (typeof showToast !== 'function') {
    window.showToast = function(message, type = 'success') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Try to use the real showToast if it exists later
        const checkToast = setInterval(() => {
            if (typeof window.showToast === 'function' && window.showToast !== showToastFallback) {
                clearInterval(checkToast);
                window.showToast(message, type);
            }
        }, 100);
    };
    var showToastFallback = window.showToast;
}

const getAPIBaseURL = () => {
    // Check if we're in production (deployed on Vercel)
    if (window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1')) {
        // Production - use your Railway backend URL
        return 'https://task-management-production-b99a.up.railway.app/api/tasks';
    }
    // Local development
    return 'http://localhost:3000/api/tasks';
};

const API_BASE_URL = getAPIBaseURL();

class TaskAPI {
    static async request(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };
        
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
            
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
                } catch (e) {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }
            
            // Handle 204 No Content responses
            if (response.status === 204) {
                return { success: true };
            }
            
            return await response.json();
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
            return Array.isArray(tasks) ? tasks : [];
        } catch (error) {
            console.error('Failed to fetch tasks:', error);
            showToast('Failed to load tasks. Make sure the backend is running.', 'error');
            return [];
        }
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch(`${API_BASE_URL.replace('/api/tasks', '')}/health`, {
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error.message);
            return false;
        }
    }
}

// Make available globally
window.TaskAPI = TaskAPI;
window.API_BASE_URL = API_BASE_URL;

console.log(`🔗 API configured to: ${API_BASE_URL}`);