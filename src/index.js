/**
 * Main application file - Express app configuration and setup
 */

const express = require('express');
const config = require('./config/constants');
const logger = require('./utils/logger');

// Middleware imports
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const newsRoutes = require('./routes/newsRoutes');

// Initialize Express app
const app = express();

// Logger
logger.info('Initializing News Aggregator API');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Routes
app.use('/users', authRoutes);
app.use('/users', userRoutes);
app.use('/news', newsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    logger.debug('Health check');
    res.status(200).json({ status: 'OK', message: 'Server is healthy' });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'News Aggregator API',
        version: '1.0.0',
        endpoints: {
            auth: '/users/signup, /users/login',
            preferences: 'GET/PUT /users/preferences',
            news: 'GET /news, GET /news/search',
            health: 'GET /health'
        }
    });
});

// 404 handler
app.use((req, res) => {
    logger.warn('Route not found', { method: req.method, path: req.path });
    res.status(404).json({ error: 'Route not found' });
});

// Global error handler (must be last)
app.use(errorHandler);

logger.info('API routes configured', { port: config.PORT });

module.exports = app;
