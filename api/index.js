const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const expressJSDocSwagger = require('express-jsdoc-swagger');
const { validateRequest, init } = require('express-oas-validator');
const getComments = require('../utils/getComments');

const config = require('../config.js');

const app = express();

let transformMethods = null;

const serverApp = () => new Promise(resolve => {
  const instance = expressJSDocSwagger(app)(config.api.swaggerOptions);
  instance.on('finish', (data, transforms) => {
    transformMethods = transforms;
    init(data);
    resolve(app);
  });
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan('tiny', { skip: () => process.env.NODE_ENV === 'test' }));
  /**
   * @typedef {object} ProcessRequest
   * @property {string} payload.required - JSDOC payload
   */

  /**
   * POST /api/v1/process-openapi
   * @param {ProcessRequest} request.body.required - JSDOC payload object
   * @return {object} 200 - success response
   */
  app.post('/api/v1/process-openapi', validateRequest(), (req, res) => {
    const { payload } = req.body;
    let swaggerObject = {
      openapi: '3.0.0',
      info: config.api.swaggerOptions.info,
    };
    const formattedPayload = getComments(payload);
    const parsedJSDocs = transformMethods.jsdocInfo()(formattedPayload);
    swaggerObject = transformMethods.getPaths(swaggerObject, parsedJSDocs);
    swaggerObject = transformMethods.getComponents(swaggerObject, parsedJSDocs);
    swaggerObject = transformMethods.getTags(swaggerObject, parsedJSDocs);
    res.json(swaggerObject);
  });
});

module.exports = serverApp;
