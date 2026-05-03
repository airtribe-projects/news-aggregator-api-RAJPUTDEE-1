/**
 * User service - handles user-related business logic
 */

const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');
const authService = require('./authService');

const userService = {
    /**
     * Get user preferences
     */
    getPreferences: (userId) => {
        logger.debug('Getting preferences', { userId });

        const user = authService.getUser(userId);

        if (!user) {
            logger.error('User not found', { userId });
            throw new NotFoundError('User not found');
        }

        return user.preferences;
    },

    /**
     * Update user preferences
     */
    updatePreferences: (userId, preferences) => {
        logger.debug('Updating preferences', { userId, preferencesCount: preferences.length });

        const user = authService.getUser(userId);

        if (!user) {
            logger.error('User not found', { userId });
            throw new NotFoundError('User not found');
        }

        user.preferences = preferences;

        logger.info('Preferences updated', { userId, preferencesCount: preferences.length });

        return user.preferences;
    },

    /**
     * Get user by ID
     */
    getUserById: (userId) => {
        logger.debug('Getting user', { userId });

        const user = authService.getUser(userId);

        if (!user) {
            logger.error('User not found', { userId });
            throw new NotFoundError('User not found');
        }

        return {
            email: user.email,
            name: user.name,
            preferences: user.preferences
        };
    }
};

module.exports = userService;
