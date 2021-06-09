const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const expressJSDocSwagger = require('express-jsdoc-swagger');
const { validateRequest, init } = require('express-oas-validator');
const {
  CustomErrorTypes,
  errorFactory,
  handleHttpError,
  tagError,
} = require('error-handler-module');

const getComments = require('../utils/getComments');
const logger = require('../utils/logger');
const config = require('../config.js');

const unauthorizedError = errorFactory(CustomErrorTypes.UNAUTHORIZED);
const badRequestError = errorFactory(CustomErrorTypes.BAD_REQUEST);

const app = express();

let transformMethods = null;

const serverApp = () => new Promise(resolve => {
  const instance = expressJSDocSwagger(app)(config.api.swaggerOptions);
  instance.on('finish', (data, transforms) => {
    transformMethods = transforms;
    init(data);
    resolve(app);
  });
  const corsOptions = {
    origin: (origin, callback) => {
      if (config.whitelist.indexOf(origin) !== -1 || !origin) {
        return callback(null, true);
      }
      logger.error(`CORS error for this origin ${origin}`);
      return callback(unauthorizedError('Not allowed by CORS'));
    },
  };
  app.use(cors(corsOptions));
  app.use(helmet());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan('tiny', { skip: () => process.env.NODE_ENV === 'test' }));
  /**
   * @typedef {object} ProcessRequest
   * @property {string} payload.required - JSDOC payload
   */

  /**
   * @typedef {object} Error
   * @property {string} message.required - error message
   * @property {ExtraInfo} extra - extra info
   */

  /**
   * @typedef {object} ExtraInfo
   * @property {string} invalidPayload
   */

  /**
   * POST /api/v1/process-openapi
   * @param {ProcessRequest} request.body.required - JSDOC payload object
   * @return {object} 200 - success response
   * @return {Error} 500 - success response
   */
  app.post('/api/v1/process-openapi', validateRequest(), (req, res, next) => {
    const { payload } = req.body;
    let swaggerObject = {
      openapi: '3.0.0',
      info: config.api.swaggerOptions.info,
    };
    try {
      const formattedPayload = getComments(payload);
      if (formattedPayload.length === 0) {
        throw badRequestError('Error: you send and invalid payload', {
          invalidPayload: payload,
        });
      }
      const parsedJSDocs = transformMethods.jsdocInfo()(formattedPayload);
      swaggerObject = transformMethods.getPaths(swaggerObject, parsedJSDocs);
      swaggerObject = transformMethods.getComponents(swaggerObject, parsedJSDocs);
      swaggerObject = transformMethods.getTags(swaggerObject, parsedJSDocs);
      return res.json(swaggerObject);
    } catch (error) {
      return next(tagError(error));
    }
  });

  app.use(handleHttpError(logger));
});

module.exports = serverApp;
