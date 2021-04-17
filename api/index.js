const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const expressJSDocSwagger = require('express-jsdoc-swagger');

const config = require('../config.js');

const app = express();

expressJSDocSwagger(app)(config.api.swaggerOptions);
app.use(cors());
app.use(helmet());
app.use(morgan('tiny', { skip: () => process.env.NODE_ENV === 'test' }));

module.exports = app;