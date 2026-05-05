const TaskService = require('../services/taskService');

class TaskController {
    constructor() {
        this.service = new TaskService();
        this.initialized = false;
        this.initPromise = null;
    }
    
    async initialize() {
        if (!this.initPromise) {
            this.initPromise = this.service.init()
                .then(() => {
                    this.initialized = true;
                    console.log("✅ TaskController initialized");
                })
                .catch((error) => {
                    console.error("❌ TaskController initialization failed:", error.message);
                    throw error;
                });
        }
        return this.initPromise;
    }
    
    getAllTasks = async (req, res) => {
        try {
            await this.initialize();
            const tasks = await this.service.getAllTasks();
            res.status(200).json(tasks);
        } catch (error) {
            console.error("Error in getAllTasks:", error.message);
            res.status(500).json({ error: error.message });
        }
    };
    
    getTaskById = async (req, res) => {
        try {
            await this.initialize();
            const task = await this.service.getTaskById(req.params.id);
            res.status(200).json(task);
        } catch (error) {
            console.error("Error in getTaskById:", error.message);
            
            if (error.message.includes("Invalid id")) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes("not found")) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    };
    
    createTask = async (req, res) => {
        try {
            await this.initialize();
            const { title, description } = req.body;
            const newTask = await this.service.createTask(title, description);
            res.status(201).json({ 
                message: "Task was created successfully", 
                task: newTask 
            });
        } catch (error) {
            console.error("Error in createTask:", error.message);
            res.status(400).json({ error: error.message });
        }
    };
    
    updateTask = async (req, res) => {
        try {
            await this.initialize();
            const id = req.params.id;
            const updates = req.body;
            const result = await this.service.updateTask(id, updates);
            res.status(200).json(result);
        } catch (error) {
            console.error("Error in updateTask:", error.message);
            
            if (error.message.includes("Invalid id")) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes("not found")) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(400).json({ error: error.message });
            }
        }
    };
    
    deleteTask = async (req, res) => {
        try {
            await this.initialize();
            const id = req.params.id;
            await this.service.deleteTask(id);
            res.status(204).send();
        } catch (error) {
            console.error("Error in deleteTask:", error.message);
            
            if (error.message.includes("Invalid id")) {
                res.status(400).json({ error: error.message });
            } else if (error.message.includes("not found")) {
                res.status(404).json({ error: error.message });
            } else {
                res.status(500).json({ error: error.message });
            }
        }
    };
}

module.exports = new TaskController();