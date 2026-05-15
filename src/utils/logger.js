/**
 * Logger utility for consistent logging across the application
 */

const LOG_LEVELS = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const getCurrentLogLevel = () => {
    const level = process.env.LOG_LEVEL || 'info';
    return level.toUpperCase();
};

const isLogLevelEnabled = (level) => {
    const levels = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
    const currentLevel = getCurrentLogLevel();
    const currentIndex = levels.indexOf(currentLevel);
    const messageIndex = levels.indexOf(level);
    return messageIndex >= currentIndex;
};

const formatLog = (level, message, data = null) => {
    const timestamp = new Date().toISOString();
    let log = `[${timestamp}] [${level}] ${message}`;
    if (data) {
        log += ` | ${JSON.stringify(data)}`;
    }
    return log;
};

const logger = {
    error: (message, data = null) => {
        if (isLogLevelEnabled(LOG_LEVELS.ERROR)) {
            console.error(formatLog(LOG_LEVELS.ERROR, message, data));
        }
    },
    warn: (message, data = null) => {
        if (isLogLevelEnabled(LOG_LEVELS.WARN)) {
            console.warn(formatLog(LOG_LEVELS.WARN, message, data));
        }
    },
    info: (message, data = null) => {
        if (isLogLevelEnabled(LOG_LEVELS.INFO)) {
            console.log(formatLog(LOG_LEVELS.INFO, message, data));
        }
    },
    debug: (message, data = null) => {
        if (isLogLevelEnabled(LOG_LEVELS.DEBUG)) {
            console.log(formatLog(LOG_LEVELS.DEBUG, message, data));
        }
    }
};

module.exports = logger;
