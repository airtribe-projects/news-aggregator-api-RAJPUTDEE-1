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

    // External APIs - NewsCatcher CatchAll API
    NEWSCATCHER_API_KEY: process.env.NEWSCATCHER_API_KEY,
    NEWSCATCHER_BASE_URL: process.env.NEWSCATCHER_BASE_URL || 'https://catchall.newscatcherapi.com',
    
    // CatchAll API Endpoints
    NEWSCATCHER_INITIALIZE_ENDPOINT: '/catchAll/initialize',
    NEWSCATCHER_SUBMIT_ENDPOINT: '/catchAll/submit',
    NEWSCATCHER_STATUS_ENDPOINT: '/catchAll/status',
    NEWSCATCHER_PULL_ENDPOINT: '/catchAll/pull',
    
    // Job polling configuration
    NEWSCATCHER_JOB_POLL_INTERVAL: 2000, // 2 seconds between polls
    NEWSCATCHER_JOB_MAX_POLLS: 5, // Maximum 10 seconds total

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
