/**
 * Request logging middleware
 */

const logger = require('../utils/logger');

/**
 * Log incoming requests
 */
const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path}`, {
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
};

module.exports = {
    requestLogger
};
