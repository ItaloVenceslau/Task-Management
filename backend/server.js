const express = require('express');
const cors = require('cors');
const app = express();

// Configure CORS to accept requests from multiple origins
const allowedOrigins = [
    'http://localhost:3000',           // Local frontend
    'http://localhost:5500',            // Live server
    'http://127.0.0.1:5500',           // Live server alternative
    'https://task-management-ukh3.vercel.app',  // Your Vercel frontend
    'https://task-management-ukh3.vercel.app',  // Any Vercel preview
    /\.vercel\.app$/,                   // All Vercel preview deployments
    'https://your-custom-domain.com'    // Add your custom domain if any
];

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(pattern => 
            typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
        )) {
            callback(null, true);
        } else {
            console.log(`Blocked origin: ${origin}`);
            callback(null, true); // Still allow but log it
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Your task routes
const taskRoutes = require('./routes/taskRoutes');
app.use('/api/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.method} ${req.url} not found` });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 CORS enabled for multiple origins`);
});