/**
 * Authentication service - handles auth business logic
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config/constants');
const logger = require('../utils/logger');
const { AuthenticationError, ConflictError } = require('../utils/errors');

// In-memory user storage
const users = new Map();

const authService = {
    /**
     * Register a new user
     */
    signup: async (userData) => {
        logger.debug('Signup attempt', { email: userData.email });

        // Check if user already exists
        if (users.has(userData.email)) {
            logger.warn('User already exists', { email: userData.email });
            throw new ConflictError('User already exists');
        }

        try {
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Store user
            users.set(userData.email, {
                email: userData.email,
                name: userData.name,
                password: hashedPassword,
                preferences: userData.preferences || []
            });

            logger.info('User created successfully', { email: userData.email });

            return {
                email: userData.email,
                name: userData.name,
                preferences: userData.preferences || []
            };
        } catch (error) {
            logger.error('Error during signup', { error: error.message });
            throw error;
        }
    },

    /**
     * Login user and return JWT token
     */
    login: async (email, password) => {
        logger.debug('Login attempt', { email });

        // Find user
        const user = users.get(email);

        if (!user) {
            logger.warn('User not found', { email });
            throw new AuthenticationError('Invalid credentials');
        }

        try {
            // Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                logger.warn('Invalid password', { email });
                throw new AuthenticationError('Invalid credentials');
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: email },
                config.JWT_SECRET,
                { expiresIn: config.JWT_EXPIRY }
            );

            logger.info('User logged in successfully', { email });

            return {
                token,
                user: {
                    email: user.email,
                    name: user.name
                }
            };
        } catch (error) {
            if (error instanceof AuthenticationError) {
                throw error;
            }
            logger.error('Error during login', { error: error.message });
            throw error;
        }
    },

    /**
     * Get user by email (internal use)
     */
    getUser: (email) => {
        return users.get(email);
    },

    /**
     * Get all users (for internal use)
     */
    getAllUsers: () => {
        return users;
    }
};

module.exports = authService;
