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
const verifyToken = (req, res, next) => {
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

        jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
            if (err) {
                logger.warn('Invalid token', { error: err.message });
                throw new AuthenticationError('Invalid token');
            }

            req.userId = decoded.userId;
            logger.debug('Token verified', { userId: req.userId });
            next();
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyToken
};
