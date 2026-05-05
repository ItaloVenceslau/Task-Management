// ========================================
// API CONFIGURATION FOR VERCEL + RAILWAY
// ========================================

// Automatically detects environment and uses correct backend URL

const USE_MOCK_DATA = true; // Set to false when real API is available

// Mock data
let mockTasks = [
    {
        id: 1,
        title: "Complete project documentation",
        description: "Write comprehensive documentation for the TaskFlow API",
        status: "pending",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: "Fix navigation bug",
        description: "Resolve the sidebar collapse issue on mobile devices",
        status: "in-progress",
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 3,
        title: "Update dependencies",
        description: "Upgrade all npm packages to latest versions",
        status: "completed",
        createdAt: new Date(Date.now() - 172800000).toISOString()
    }
];

const getApiBaseUrl = () => {
    // Production: Frontend running on Vercel
    if (window.location.hostname.includes('vercel.app') || 
        window.location.hostname !== 'localhost') {
        // REPLACE THIS WITH YOUR ACTUAL RAILWAY URL
        return 'https://your-railway-app.up.railway.app/api/tasks';
    }
    
    // Development: Localhost
    return 'http://localhost:3000/api/tasks';
};

const API_BASE_URL = getApiBaseUrl();

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
            const url = `${API_BASE_URL}${endpoint}`;
            console.log(`📡 API Call: ${options.method || 'GET'} ${url}`);
            
            const response = await fetch(url, mergedOptions);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('❌ API Error:', error);
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
            const healthUrl = API_BASE_URL.replace('/api/tasks', '/health');
            const response = await fetch(healthUrl);
            return response.ok;
        } catch {
            return false;
        }
    }
}

// Make available globally
window.TaskAPI = TaskAPI;
console.log(`✅ API Configured: ${API_BASE_URL}`);