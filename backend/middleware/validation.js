const validateTask = (req, res, next) => {
const { title, description } = req.body;

    if (!title) {
        return res.status(400).json({ error: 'Title is required' });
    }


    if (typeof title !== 'string') {
        return res.status(400).json({ error: 'Title must be a string' });
    }

    if (title.trim().length < 3) {
        return res.status(400).json({ error: 'Title must be at least 3 characters' });
    }

    if (title.length > 50) {
        return res.status(400).json({ error: 'Title cannot exceed 50 characters' });
    }

    if (description !== undefined) {
        if (typeof description !== 'string') {
        return res.status(400).json({ error: 'Description must be a string' });
        }
        if (description.length > 200) {
        return res.status(400).json({ error: 'Description cannot exceed 200 characters' });
        }
    }

    next();
    };

    const validateTaskUpdate = (req, res, next) => {
    const { title, description, status } = req.body;
    const allowedFields = ['title', 'description', 'status'];
    
    for (let field in req.body) {
        if (!allowedFields.includes(field)) {
        return res.status(400).json({ error: `Invalid field: ${field}` });
        }
    }

    if (title !== undefined) {
        if (typeof title !== 'string') {
        return res.status(400).json({ error: 'Title must be a string' });
        }
        if (title.trim().length < 3) {
        return res.status(400).json({ error: 'Title must be at least 3 characters' });
        }
        if (title.length > 50) {
        return res.status(400).json({ error: 'Title cannot exceed 50 characters' });
        }
    }

    if (description !== undefined) {
        if (typeof description !== 'string') {
        return res.status(400).json({ error: 'Description must be a string' });
        }
        if (description.length > 200) {
        return res.status(400).json({ error: 'Description cannot exceed 200 characters' });
        }
    }

    if (status !== undefined) {
        const allowedStatus = ['pending', 'in-progress', 'completed'];
        if (!allowedStatus.includes(status)) {
        return res.status(400).json({ error: 'Status must be: pending, in-progress, or completed' });
        }
    }

    next();
    };

module.exports = { validateTask, validateTaskUpdate };