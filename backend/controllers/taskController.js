const TaskServiceClass = require('../services/taskService');
const service = new TaskServiceClass();

// Inicializa a conexão com o banco
service.init().catch(err => console.error("Erro ao conectar banco:", err));

class TaskController {
    // Adicionamos async/await em todas as funções
    getAllTasks = async (req, res) => {
        try {
            const allTasks = await service.getAllTasks();
            return res.status(200).json(allTasks);
        } catch (error) {
            return res.status(404).json({ error: error.message });
        }
    };

    getTaskById = async (req, res) => {
        try {
            const task = await service.getTaskById(req.params.id);
            return res.status(200).json(task);
        } catch (error) {
            const status = error.message.includes('id') ? 400 : 404;
            return res.status(status).json({ error: error.message });
        }
    };

    createTask = async (req, res) => {
        try {
            const newTask = await service.createTask(req.body.title, req.body.description);
            return res.status(201).json({ message: 'new Task was created successfully', newTask });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    };

    updateTask = async (req, res) => {
        try {
            const id = req.params.id;
            if (isNaN(parseInt(id))) return res.status(400).json({ error: `Invalid Id` });

            const update = await service.updateTask(id, req.body);
            return res.status(200).json(update);
        } catch (error) {
            const status = error.message.includes('found') ? 404 : 400;
            return res.status(status).json({ error: error.message });
        }
    };

    deleteTask = async (req, res) => {
        try {
            const id = req.params.id;
            await service.deleteTask(id);
            return res.status(204).end();
        } catch (error) {
            const status = error.message.includes('found') ? 404 : 400;
            return res.status(status).json({ error: error.message });
        }
    };
}

module.exports = new TaskController();
