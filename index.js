const serverApp = require('./api');
const config = require('./config.js');
const logger = require('./utils/logger');

serverApp()
  .then(app => {
    app.listen(config.port, () => logger.info(`Listening on port, ${config.port}`));
  });
