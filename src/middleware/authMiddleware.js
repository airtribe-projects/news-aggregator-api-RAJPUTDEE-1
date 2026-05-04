/**
 * Authentication middleware for JWT verification
 */

const jwt = require('jsonwebtoken');
const config = require('../config/constants');
const logger = require('../utils/logger');
const { AuthenticationError } = require('../utils/errors');

/**
 * Verify JWT token from Authorization header
 */
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            logger.warn('Missing authorization header');
            throw new AuthenticationError('No token provided');
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            logger.warn('Invalid authorization header format', { header: authHeader });
            throw new AuthenticationError('Invalid token format');
        }

        const token = parts[1];

        // Use synchronous verification so errors are handled in this scope
        try {
            const decoded = jwt.verify(token, config.JWT_SECRET);
            req.userId = decoded.userId;
            logger.debug('Token verified', { userId: req.userId });
            return next();
        } catch (verifyError) {
            logger.warn('Invalid token', { error: verifyError.message });
            return next(new AuthenticationError('Invalid token'));
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyToken
};
