const express = require('express');
const router = express.Router();
const TaskController = require('../controllers/taskController');
const { validateTask, validateTaskUpdate } = require('../middleware/validation');

router.get('/', TaskController.getAllTasks);
router.get('/:id', TaskController.getTaskById);
router.post('/', validateTask, TaskController.createTask);
router.put('/:id', validateTaskUpdate, TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

const taskController = require('../controllers/taskController');

// If getAllTasks is undefined, your export is wrong

module.exports = router;