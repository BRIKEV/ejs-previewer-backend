const app = require('./api');
const config = require('./config.js');
const logger = require('./utils/logger');

app.listen(config.port, () => logger.info(`Listening on port, ${config.port}`));
