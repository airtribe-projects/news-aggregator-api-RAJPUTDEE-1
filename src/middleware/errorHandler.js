/**
 * Error handling middleware
 */

const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Internal Server Error';

    // Wrong MongoDB ID error
    if (err.name === 'CastError') {
        const message = `Invalid ${err.path}: ${err.value}`;
        return res.status(400).json({ error: message });
    }

    // JWT error
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        return res.status(400).json({ error: message });
    }

    // JWT expired
    if (err.name === 'TokenExpiredError') {
        const message = 'Token has expired';
        return res.status(400).json({ error: message });
    }

    // Validation error with details
    if (err.details && Array.isArray(err.details)) {
        logger.error('Validation error', { details: err.details });
        return res.status(err.statusCode).json({
            error: err.message,
            details: err.details
        });
    }

    // Operational errors
    if (err.isOperational) {
        logger.error('Operational error', { message: err.message, statusCode: err.statusCode });
        return res.status(err.statusCode).json({
            error: err.message
        });
    }

    // NewsCatcher API errors - expose details for debugging
    if (err.message?.includes('NewsCatcher API')) {
        logger.error('External API error', { message: err.message, statusCode: err.statusCode, errorResponse: err.errorResponse });
        const upstreamStatus = Number.isInteger(err.statusCode) ? err.statusCode : 502;
        return res.status(upstreamStatus).json({
            error: err.message,
            details: err.errorResponse || {}
        });
    }

    // Unexpected errors - log but also expose a descriptive message
    logger.error('Unexpected error', { message: err.message, stack: err.stack });
    return res.status(500).json({
        error: err.message || 'Internal Server Error',
        type: 'internal_error'
    });
};

/**
 * Catch async errors wrapper
 */
const catchAsyncErrors = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = {
    errorHandler,
    catchAsyncErrors
};
