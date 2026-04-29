const express = require('express');
const cors = require('cors');  // ← ADD THIS
const taskRoutes = require('./routes/taskRoutes');
const logger = require('./middleware/logger');

const app = express();
const PORT = 3000;

// MIDDLEWARE - ORDER MATTERS!
app.use(cors());              // ← ADD THIS FIRST - Enables CORS for all origins
app.use(express.json());      // Parse JSON bodies
app.use(logger);              // Your custom logger

// Routes
app.use('/api/tasks', taskRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
    console.log(`Server backend running on http://localhost:${PORT}`);
    console.log(`Server site running on http://localhost:${PORT}/api/tasks`);
});