const express = require('express');
const cors = require('cors');
const taskRoutes = require('./src/routes/taskRoutes');
const logger = require('./src/middleware/logger');

const app = express();
const PORT = process.env.PORT || 3000;  // ← USE THIS

// Middleware
app.use(cors());
app.use(express.json());
app.use(logger);

// Routes
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

// Listen on all interfaces
app.listen(PORT, '0.0.0.0', () => {  // ← ADD '0.0.0.0'
    console.log(`Server running on port ${PORT}`);
});