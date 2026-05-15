/**
 * Validation utilities for input validation
 */

const { ValidationError } = require('./errors');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

const validators = {
    /**
     * Validate email format
     */
    validateEmail: (email) => {
        if (!email || typeof email !== 'string') {
            return false;
        }
        return EMAIL_REGEX.test(email);
    },

    /**
     * Validate password strength
     */
    validatePassword: (password) => {
        if (!password || typeof password !== 'string') {
            return false;
        }
        return password.length >= PASSWORD_MIN_LENGTH;
    },

    /**
     * Validate signup input
     */
    validateSignupInput: (data) => {
        const errors = [];

        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push('Name is required and must be a non-empty string');
        }

        if (!data.email || !validators.validateEmail(data.email)) {
            errors.push('Valid email is required');
        }

        if (!data.password || !validators.validatePassword(data.password)) {
            errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
        }

        if (!Array.isArray(data.preferences)) {
            errors.push('Preferences must be an array');
        }

        if (errors.length > 0) {
            throw new ValidationError('Validation failed', errors);
        }

        return true;
    },

    /**
     * Validate login input
     */
    validateLoginInput: (data) => {
        const errors = [];

        if (!data.email || !validators.validateEmail(data.email)) {
            errors.push('Valid email is required');
        }

        if (!data.password) {
            errors.push('Password is required');
        }

        if (errors.length > 0) {
            throw new ValidationError('Validation failed', errors);
        }

        return true;
    },

    /**
     * Validate preferences input
     */
    validatePreferencesInput: (data) => {
        if (!Array.isArray(data.preferences)) {
            throw new ValidationError('Preferences must be an array');
        }

        return true;
    },

    /**
     * Validate search query input
     */
    validateSearchInput: (data) => {
        const errors = [];

        if (!data.query || typeof data.query !== 'string' || data.query.trim() === '') {
            errors.push('Query is required and must be a non-empty string');
        } else {
            const wordCount = data.query.trim().split(/\s+/).length;
            const charCount = data.query.trim().length;
            
            if (wordCount < 3) {
                errors.push('Query must be at least 3 words');
            }
            if (charCount < 10) {
                errors.push('Query must be at least 10 characters');
            }
        }

        if (errors.length > 0) {
            throw new ValidationError('Invalid search query', errors);
        }

        return true;
    }
};

module.exports = validators;
