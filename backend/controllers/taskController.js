const TaskService = require('../services/taskService');

class TaskController {
    getAllTasks = (req, res) => {
        try {
            const allTasks = TaskService.getAllTasks();
            return res.status(200).json(allTasks);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    };

// GET /api/tasks/:id
    getTaskById = (req, res) => {
        try {
            const task = TaskService.getTaskById(req.params.id);

            return res.status(200).json(task);
        } catch (error) {
            if (error.message.includes('id')) {
                return res.status(400).json({ error: error.message }); // Bad request
            }
            return res.status(404).json({ error: error.message }); // Not found
        }
    };

// POST /api/tasks
    createTask = (req, res) => {
        try {
            const newTask = TaskService.createTask(req.body.title, req.body.description);

            return res.status(201).json({message: 'new Task was created successfully', newTask});
        } catch (error) {
            return res.status(400).json({error: error.message});
        }

    };

// PUT /api/tasks/:id
    updateTask = (req, res) => {
        try {
            const id = req.params.id;
            if (isNaN(parseInt(id))) return res.status(400).json({error: `Invalid Id`});

            const update = TaskService.updateTask(id, req.body);

            return res.status(200).json(update);

        } catch (error) {
            if (error.message.includes('found')) {
                return res.status(404).json({error: error.message});
            }
            return res.status(400).json({error: error.message});
        }
    };

// DELETE /api/tasks/:id
    deleteTask = (req, res) => {
        try {
            const id = req.params.id;
            
            const deletedTask = TaskService.deleteTask(id);
            
            return res.status(204).end();
        } catch (error) {
            if (error.message.includes('found')) {
                return res.status(404).json({error: error.message});
            }
            return res.status(400).json({error: error.message});
        }

        // If task exists: delete and return 204 (no content)
        // If not: return 404 with { error: "Task not found" }
    };
}

module.exports = new TaskController();