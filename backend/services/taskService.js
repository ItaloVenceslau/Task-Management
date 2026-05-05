// Initial tasks (already created for you)
// let tasks = [
//   {
//     id: 1,
//     title: "Complete Express challenge",
//     description: "Finish the middleware and routing exercise",
//     status: "pending",
//     createdAt: "2026-04-28T10:00:00.000Z"
//   },
//   {
//     id: 2,
//     title: "Review pull requests",
//     description: "Check team's code submissions",
//     status: "in-progress",
//     createdAt: "2026-04-28T09:30:00.000Z"
//   }
// ];

const { seedDatabase } = require('../db/db');
const db = require('./db');

class TaskService {
    constructor() {
        this.tasks = null;
    }
    
    async init() {
        const database = await db.connectDB();
        this.tasks = database.collection('tasks');
        this.tasks.seedDatabase();
    }
    
    async getAllTasks() {
        const tasks = await this.tasks.find({}).toArray();
        if (!tasks.length) throw new Error(`Missing tasks, give one task to start`);
        return tasks;
    }
    
    async getTaskById(id) {
        const intId = parseInt(id, 10);
        if (isNaN(intId)) throw new Error(`Invalid id`);
        
        const task = await this.tasks.findOne({ id: intId });
        if (!task) throw new Error(`Task not found`);
        return task;
    }
    
    async createTask(title, description) {
        if (!title && !description) throw new Error(`The fields "title" and "description" are missing arguments`);
        if (!title || !description) throw new Error(`The field "${!title ? "title" : "description"}" is missing arguments`);
        
        const lastTask = await this.tasks.find({}).sort({ id: -1 }).limit(1).toArray();
        const nextId = lastTask.length > 0 ? lastTask[0].id + 1 : 1;
        
        const newTask = {
            id: nextId,
            title: title,
            description: description || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        await this.tasks.insertOne(newTask);
        return newTask;
    }
    
    async updateTask(id, upd) {
        const { title, status, description } = upd;
        const intId = parseInt(id, 10);
        
        const updateFields = {};
        if (title) updateFields.title = title;
        if (status) updateFields.status = status;
        if (description) updateFields.description = description;
        
        const result = await this.tasks.updateOne(
            { id: intId },
            { $set: updateFields }
        );
        
        if (result.matchedCount === 0) throw new Error(`Task not found`);
        return { message: `Task was updated successfully` };
    }
    
    async deleteTask(id) {
        const intId = parseInt(id, 10);
        if (isNaN(intId)) throw new Error(`Invalid id`);
        
        const result = await this.tasks.deleteOne({ id: intId });
        if (result.deletedCount === 0) throw new Error(`Task not found`);
        return;
    }
}

module.exports = TaskService;