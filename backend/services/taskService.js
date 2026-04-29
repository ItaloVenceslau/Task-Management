// Initial tasks (already created for you)
let tasks = [
  {
    id: 1,
    title: "Complete Express challenge",
    description: "Finish the middleware and routing exercise",
    status: "pending",
    createdAt: "2026-04-28T10:00:00.000Z"
  },
  {
    id: 2,
    title: "Review pull requests",
    description: "Check team's code submissions",
    status: "in-progress",
    createdAt: "2026-04-28T09:30:00.000Z"
  }
];

let nextId = 3;

class TaskService {

    getAllTasks() {
        if (!tasks.length) throw new Error(`Missing tasks, give one task to start`);

        return tasks;
    }

    getTaskById(id) {
        const intId = parseInt(id, 10);

        if (isNaN(intId)) throw new Error(`Invalid id`);

        const findId = tasks.find(p => p.id === intId);

        if (!findId) throw new Error(`Task not found`);

        return findId;
    }

    createTask(title, description) {
        if (!title && !description) throw new Error(`The fields "title" and "description" are missing arguments`);
        if (!title || !description) throw new Error(`The field "${!title ? "title" : "description"}" is missing arguments`);

        const newTask = {
            id: nextId++,
            title: title,
            description: description || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };  

        tasks.push(newTask);

        return newTask;
    }

    updateTask(id, upd) {
        const {title, status, description} = upd;
        const intId = parseInt(id, 10);

        const index = tasks.findIndex(p => p.id === intId);

        if (index === -1) throw new Error(`task not found`);
                
        if (title) tasks[index].title = title;

        if (status) tasks[index].status = status;

        if (description) tasks[index].description = description;

        return {message: `task was updated successfully`};
    }

    deleteTask(id) {
        const intId = parseInt(id, 10);

        if (isNaN(intId)) throw new Error(`Invalid id`);

        const idIndex = tasks.findIndex(p => p.id === intId);

        if (idIndex === -1) throw new Error(`Task not found`);

        tasks.splice(idIndex, 1);

        return;
    }
}

module.exports = new TaskService();