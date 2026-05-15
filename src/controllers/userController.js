/**
 * User controller - handles user-related HTTP requests
 */

const logger = require('../utils/logger');
const userService = require('../services/userService');
const validators = require('../utils/validators');

const userController = {
    /**
     * Get user preferences endpoint
     */
    getPreferences: async (req, res, next) => {
        try {
            const userId = req.userId;

            logger.debug('Get preferences request', { userId });

            const preferences = await userService.getPreferences(userId);

            res.status(200).json({
                preferences
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update user preferences endpoint
     */
    updatePreferences: async (req, res, next) => {
        try {
            const userId = req.userId;
            const { preferences } = req.body;

            logger.debug('Update preferences request', { userId, preferencesCount: preferences?.length });

            // Validate input
            validators.validatePreferencesInput({
                preferences
            });

            // Call service
            const updatedPreferences = await userService.updatePreferences(userId, preferences);

            res.status(200).json({
                message: 'Preferences updated successfully',
                preferences: updatedPreferences
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get user profile endpoint
     */
    getProfile: async (req, res, next) => {
        try {
            const userId = req.userId;

            logger.debug('Get profile request', { userId });

            const user = await userService.getUserById(userId);

            res.status(200).json(user);
        } catch (error) {
            next(error);
        }
    }
};

module.exports = userController;
