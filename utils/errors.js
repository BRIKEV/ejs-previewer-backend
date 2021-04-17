const logger = require('./logger');

const ERROR_TYPES = {
  NOT_FOUND: 'Not found',
  SERVER_ERROR: 'Internal server error',
};

const errorFormatter = error => ({
  message: error.message,
  type: error.type,
});

const handleHTTPError = res => error => {
  const formattedError = errorFormatter(error);
  logger.error(error.stack);
  const types = {
    [ERROR_TYPES.NOT_FOUND]: () => res.status(404).json(formattedError),
    [ERROR_TYPES.SERVER_ERROR]: () => res.status(500).json(formattedError),
  };
  return types[error.type]();
};

const errorGenerator = (message, type = ERROR_TYPES.SERVER_ERROR) => {
  const error = new Error(message);
  error.type = type;
  return error;
};

module.exports = {
  ERROR_TYPES,
  handleHTTPError,
  errorGenerator,
};
