const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const expressJSDocSwagger = require('express-jsdoc-swagger');

const config = require('../config.js');

const app = express();

let transformMethods = null;
const instance = expressJSDocSwagger(app)(config.api.swaggerOptions);
instance.on('finish', (_, transforms) => {
  transformMethods = transforms;
})
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('tiny', { skip: () => process.env.NODE_ENV === 'test' }));
app.post('/api/v1/process-openapi', (req, res) => {
  const { payload } = req.body;
  let swaggerObject = {
    openapi: '3.0.0',
    info: config.api.swaggerOptions.info,
  };
  const parsedJSDocs = transformMethods.jsdocInfo()(payload);
  swaggerObject = transformMethods.getPaths(swaggerObject, parsedJSDocs);
  swaggerObject = transformMethods.getComponents(swaggerObject, parsedJSDocs);
  swaggerObject = transformMethods.getTags(swaggerObject, parsedJSDocs);
  res.json(swaggerObject);
})

module.exports = app;