module.exports = {
  // This variable must be "PORT" because is the one heroku uses
  port: process.env.PORT || 3000,
  whitelist: [process.env.APP_HOST, `https://${process.env.DOCS_HOST}`],
  api: {
    swaggerOptions: {
      info: {
        version: '1.0.0',
        title: 'ejs-previewer-backend',
        license: {
          name: 'MIT',
        },
      },
      filesPattern: './api/*.js',
      baseDir: __dirname,
    },
  },
};
