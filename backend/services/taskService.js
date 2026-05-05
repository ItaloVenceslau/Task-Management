const { connectDB, seedDatabase } = require('../db/db');

class TaskService {
    constructor() {
        this.collection = null;
        this.isConnected = false;
    }
    
    async init() {
        try {
            const database = await connectDB();
            this.collection = database.collection('tasks');
            await seedDatabase();
            this.isConnected = true;
            console.log("✅ TaskService initialized successfully");
        } catch (error) {
            console.error("❌ TaskService initialization failed:", error.message);
            this.isConnected = false;
            throw error;
        }
    }
    
    async getAllTasks() {
        if (!this.isConnected) {
            throw new Error("Database not connected. Please try again later.");
        }
        
        const tasks = await this.collection.find({}).toArray();
        return tasks;
    }
    
    async getTaskById(id) {
        if (!this.isConnected) {
            throw new Error("Database not connected. Please try again later.");
        }
        
        const intId = parseInt(id, 10);
        if (isNaN(intId)) {
            throw new Error(`Invalid id format: ${id}`);
        }
        
        const task = await this.collection.findOne({ id: intId });
        if (!task) {
            throw new Error(`Task with id ${intId} not found`);
        }
        
        return task;
    }
    
    async createTask(title, description) {
        if (!this.isConnected) {
            throw new Error("Database not connected. Please try again later.");
        }
        
        if (!title || title.trim().length === 0) {
            throw new Error("Title is required");
        }
        
        if (title.trim().length < 3) {
            throw new Error("Title must be at least 3 characters");
        }
        
        if (!description || description.trim().length === 0) {
            throw new Error("Description is required");
        }
        
        const lastTask = await this.collection.find({}).sort({ id: -1 }).limit(1).toArray();
        const nextId = lastTask.length > 0 ? lastTask[0].id + 1 : 1;
        
        const newTask = {
            id: nextId,
            title: title.trim(),
            description: description.trim(),
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        await this.collection.insertOne(newTask);
        console.log(`✅ Created task ${nextId}: ${title}`);
        
        return newTask;
    }
    
    async updateTask(id, updates) {
        if (!this.isConnected) {
            throw new Error("Database not connected. Please try again later.");
        }
        
        const intId = parseInt(id, 10);
        if (isNaN(intId)) {
            throw new Error(`Invalid id format: ${id}`);
        }
        
        const { title, description, status } = updates;
        const updateFields = {};
        
        if (title !== undefined) {
            if (title.trim().length < 3) {
                throw new Error("Title must be at least 3 characters");
            }
            updateFields.title = title.trim();
        }
        
        if (description !== undefined) {
            updateFields.description = description.trim();
        }
        
        if (status !== undefined) {
            const validStatuses = ['pending', 'in-progress', 'completed'];
            if (!validStatuses.includes(status)) {
                throw new Error("Status must be: pending, in-progress, or completed");
            }
            updateFields.status = status;
        }
        
        if (Object.keys(updateFields).length === 0) {
            throw new Error("No valid fields to update");
        }
        
        const result = await this.collection.updateOne(
            { id: intId },
            { $set: updateFields }
        );
        
        if (result.matchedCount === 0) {
            throw new Error(`Task with id ${intId} not found`);
        }
        
        console.log(`✅ Updated task ${intId}`);
        return { message: `Task ${intId} was updated successfully` };
    }
    
    async deleteTask(id) {
        if (!this.isConnected) {
            throw new Error("Database not connected. Please try again later.");
        }
        
        const intId = parseInt(id, 10);
        if (isNaN(intId)) {
            throw new Error(`Invalid id format: ${id}`);
        }
        
        const result = await this.collection.deleteOne({ id: intId });
        if (result.deletedCount === 0) {
            throw new Error(`Task with id ${intId} not found`);
        }
        
        console.log(`✅ Deleted task ${intId}`);
        return { message: `Task ${intId} deleted successfully` };
    }
}

module.exports = TaskService;