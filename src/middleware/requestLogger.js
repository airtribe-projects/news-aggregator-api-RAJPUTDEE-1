const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
    const start = Date.now();

    res.once('finish', () => {
        const duration = Date.now() - start;
        logger.info(`${req.method} ${req.path}`, {
            method: req.method,
            path: req.path,
            ip: req.ip,
            status: res.statusCode,
            duration: `${duration}ms`
        });
    });

    next();
};

module.exports = {
    requestLogger
};
