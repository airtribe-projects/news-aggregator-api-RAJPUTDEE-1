require('dotenv').config();
const app = require('./src/index');
const config = require('./src/config/constants');
const logger = require('./src/utils/logger');

const port = config.PORT || 3000;

if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            logger.error('Something bad happened', { error: err.message });
            return process.exit(1);
        }
        logger.info(`Server is listening on port ${port}`);
        logger.info(`Environment: ${config.NODE_ENV}`);
    });
}

module.exports = app;
