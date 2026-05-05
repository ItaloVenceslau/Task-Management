// API Configuration
// Change this to false when your real backend is ready
const USE_MOCK_DATA = true;

// Real API URL (keep for when backend is ready)
const API_BASE_URL = 'https://task-management-production-b99a.up.railway.app/api/tasks';

// Mock data for development/testing
let mockTasks = [
    {
        id: 1,
        title: "Complete project documentation",
        description: "Write comprehensive documentation for the TaskFlow API including endpoints and examples",
        status: "pending",
        createdAt: new Date().toISOString()
    },
    {
        id: 2,
        title: "Fix navigation bug",
        description: "Resolve the sidebar collapse issue on mobile devices and improve responsiveness",
        status: "in-progress",
        createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
        id: 3,
        title: "Update dependencies",
        description: "Upgrade all npm packages to latest versions and test for breaking changes",
        status: "completed",
        createdAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
        id: 4,
        title: "Design new dashboard UI",
        description: "Create modern dashboard layout with analytics and charts",
        status: "pending",
        createdAt: new Date(Date.now() - 259200000).toISOString()
    },
    {
        id: 5,
        title: "Implement search functionality",
        description: "Add search and filter capabilities to tasks view",
        status: "in-progress",
        createdAt: new Date(Date.now() - 345600000).toISOString()
    }
];

class TaskAPI {
    static async request(endpoint, options = {}) {
        // Use mock data if enabled
        if (USE_MOCK_DATA) {
            return this.mockRequest(endpoint, options);
        }

        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        const mergedOptions = { ...defaultOptions, ...options };

        try {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log('Fetching:', url, mergedOptions);
            
            const response = await fetch(url, mergedOptions);
            
            if (!response.ok) {
                // If real API fails and we're not using mock, throw error
                if (!USE_MOCK_DATA) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || `HTTP Error: ${response.status}`);
                }
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API Error:', error);
            // If real API fails, fall back to mock data
            if (!USE_MOCK_DATA) {
                console.warn('Falling back to mock data due to API error');
                return this.mockRequest(endpoint, options);
            }
            throw error;
        }
    }

    // Mock request handler for testing
    static async mockRequest(endpoint, options = {}) {
        // Simulate network delay for realistic behavior
        await new Promise(resolve => setTimeout(resolve, 300));

        const method = options.method || 'GET';
        
        // Extract ID from endpoint if present
        let id = null;
        let cleanEndpoint = endpoint;
        
        const idMatch = endpoint.match(/\/(\d+)$/);
        if (idMatch) {
            id = parseInt(idMatch[1]);
            cleanEndpoint = endpoint.replace(/\/\d+$/, '');
        }

        try {
            switch (method) {
                case 'GET':
                    // Get all tasks
                    if (cleanEndpoint === '' || cleanEndpoint === '/') {
                        return [...mockTasks];
                    }
                    // Get single task by ID
                    if (id) {
                        const task = mockTasks.find(t => t.id === id);
                        if (!task) {
                            throw new Error('Task not found');
                        }
                        return { ...task };
                    }
                    break;

                case 'POST':
                    if (cleanEndpoint === '' || cleanEndpoint === '/') {
                        const body = JSON.parse(options.body || '{}');
                        const newTask = {
                            id: Math.max(...mockTasks.map(t => t.id), 0) + 1,
                            title: body.title,
                            description: body.description || '',
                            status: 'pending',
                            createdAt: new Date().toISOString()
                        };
                        mockTasks.push(newTask);
                        return { 
                            success: true,
                            message: 'Task created successfully', 
                            task: newTask 
                        };
                    }
                    break;

                case 'PUT':
                    if (id) {
                        const body = JSON.parse(options.body || '{}');
                        const taskIndex = mockTasks.findIndex(t => t.id === id);
                        if (taskIndex === -1) {
                            throw new Error('Task not found');
                        }
                        
                        mockTasks[taskIndex] = {
                            ...mockTasks[taskIndex],
                            ...body,
                            updatedAt: new Date().toISOString()
                        };
                        return { 
                            success: true,
                            message: 'Task updated successfully', 
                            task: mockTasks[taskIndex] 
                        };
                    }
                    break;

                case 'DELETE':
                    if (id) {
                        const taskIndex = mockTasks.findIndex(t => t.id === id);
                        if (taskIndex === -1) {
                            throw new Error('Task not found');
                        }
                        mockTasks.splice(taskIndex, 1);
                        return { 
                            success: true,
                            message: 'Task deleted successfully' 
                        };
                    }
                    break;
            }
        } catch (error) {
            console.error('Mock API Error:', error);
            throw error;
        }

        throw new Error(`Invalid request: ${method} ${endpoint}`);
    }

    static async getAllTasks() {
        try {
            const response = await this.request('');
            // Ensure we always return an array
            const tasks = Array.isArray(response) ? response : [];
            return tasks;
        } catch (error) {
            console.error('Error getting tasks:', error);
            return [];
        }
    }

    static async getTaskById(id) {
        try {
            return await this.request(`/${id}`);
        } catch (error) {
            console.error('Error getting task by ID:', error);
            throw error;
        }
    }

    static async createTask(title, description) {
        try {
            return await this.request('', {
                method: 'POST',
                body: JSON.stringify({ title, description })
            });
        } catch (error) {
            console.error('Error creating task:', error);
            throw error;
        }
    }

    static async updateTask(id, updates) {
        try {
            return await this.request(`/${id}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });
        } catch (error) {
            console.error('Error updating task:', error);
            throw error;
        }
    }

    static async deleteTask(id) {
        try {
            await this.request(`/${id}`, { method: 'DELETE' });
            return true;
        } catch (error) {
            console.error('Error deleting task:', error);
            throw error;
        }
    }

    static async checkHealth() {
        try {
            if (USE_MOCK_DATA) {
                return true;
            }
            await this.request('');
            return true;
        } catch (error) {
            console.warn('Health check failed:', error);
            return false;
        }
    }
}

// Make available globally
window.TaskAPI = TaskAPI;

// Log initialization
console.log('TaskAPI initialized with mock data:', USE_MOCK_DATA);