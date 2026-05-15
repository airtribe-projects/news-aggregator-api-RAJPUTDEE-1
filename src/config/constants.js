require('dotenv').config();

const parsePort = (value, fallback = 3000) => {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is required');
}

const config = {
    // Server
    PORT: parsePort(process.env.PORT),
    NODE_ENV: process.env.NODE_ENV || 'development',

    // JWT
    JWT_SECRET: jwtSecret,
    JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',

    // External APIs - NewsCatcher CatchAll API
    NEWSCATCHER_API_KEY: process.env.NEWSCATCHER_API_KEY,
    NEWSCATCHER_BASE_URL: process.env.NEWSCATCHER_BASE_URL || 'https://catchall.newscatcherapi.com',
    
    // CatchAll API Endpoints
    NEWSCATCHER_INITIALIZE_ENDPOINT: '/catchAll/initialize',
    NEWSCATCHER_SUBMIT_ENDPOINT: '/catchAll/submit',
    NEWSCATCHER_STATUS_ENDPOINT: '/catchAll/status',
    NEWSCATCHER_PULL_ENDPOINT: '/catchAll/pull',
    NEWSCATCHER_REQUEST_TIMEOUT: Number(process.env.NEWSCATCHER_REQUEST_TIMEOUT || 10000),
    
    // Job polling configuration
    NEWSCATCHER_JOB_POLL_INTERVAL: Number(process.env.NEWSCATCHER_JOB_POLL_INTERVAL || 30000), // 30 seconds between polls
    NEWSCATCHER_JOB_MAX_POLLS: Number(process.env.NEWSCATCHER_JOB_MAX_POLLS || 30), // Up to 15 minutes total

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
