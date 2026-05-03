/**
 * Application configuration and constants
 */

require('dotenv').config();

const config = {
    // Server
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',

    // JWT
    JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-this-in-production',
    JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',

    // External APIs
    NEWSCATCHER_API_KEY: process.env.NEWSCATCHER_API_KEY,
    NEWSCATCHER_API_URL: process.env.NEWSCATCHER_API_URL || 'https://api.newscatcherapi.com/v2/search',

    // Logging
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    // Validation
    PASSWORD_MIN_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

    // API Response
    DEFAULT_PAGE_SIZE: 10,
    MAX_NEWS_RESULTS: 100
};

module.exports = config;
