// API Configuration
const USE_MOCK_DATA = false;  // ← CHANGE THIS TO false

// Real API URL (your Railway backend)
const API_BASE_URL = 'https://task-management-production-b99a.up.railway.app/api/tasks';

// Mock data is now DISABLED
let mockTasks = []; // Won't be used

class TaskAPI {
    static async request(endpoint, options = {}) {
        // If USE_MOCK_DATA is false, use real backend
        if (!USE_MOCK_DATA) {
            const defaultOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            };

            const mergedOptions = { ...defaultOptions, ...options };
            
            try {
                const url = `${API_BASE_URL}${endpoint}`;
                console.log(`📡 API Request: ${options.method || 'GET'} ${url}`);
                
                const response = await fetch(url, mergedOptions);
                
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
                console.error('❌ API Error:', error);
                throw error;
            }
        } else {
            // Mock data mode (currently disabled)
            return this.mockRequest(endpoint, options);
        }
    }

    static async getAllTasks() {
        try {
            const tasks = await this.request('');
            console.log(`📋 Received ${tasks.length} tasks from BACKEND`);
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
            const healthUrl = API_BASE_URL.replace('/api/tasks', '/health');
            const response = await fetch(healthUrl);
            return response.ok;
        } catch (error) {
            console.warn('Health check failed:', error);
            return false;
        }
    }

    // Mock methods (kept for reference but not used)
    static async mockRequest(endpoint, options) {
        console.warn('Mock data is disabled. Use real backend.');
        throw new Error('Mock data disabled');
    }
}

window.TaskAPI = TaskAPI;

console.log('🔗 API configured to:', API_BASE_URL);
console.log('📌 Mock data enabled:', USE_MOCK_DATA);