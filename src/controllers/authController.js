/**
 * Authentication controller - handles auth-related HTTP requests
 */

const logger = require('../utils/logger');
const authService = require('../services/authService');
const validators = require('../utils/validators');

const authController = {
    /**
     * Signup endpoint
     */
    signup: async (req, res, next) => {
        try {
            const { name, email, password, preferences } = req.body;

            logger.debug('Signup request', { email, name });

            // Validate input
            validators.validateSignupInput({
                name,
                email,
                password,
                preferences
            });

            // Call service
            const user = await authService.signup({
                name,
                email,
                password,
                preferences
            });

            res.status(201).json({
                message: 'User created successfully',
                user
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Login endpoint
     */
    login: async (req, res, next) => {
        try {
            const { email, password } = req.body;

            logger.debug('Login request', { email });

            // Validate input
            validators.validateLoginInput({
                email,
                password
            });

            // Call service
            const result = await authService.login(email, password);

            res.status(200).json({
                message: 'Login successful',
                token: result.token,
                user: result.user
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
