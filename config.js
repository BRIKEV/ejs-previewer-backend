module.exports = {
  // This variable must be "PORT" because is the one heroku uses
  port: process.env.PORT || 3000,
  api: {
    swaggerOptions: {
      info: {
        version: '1.0.0',
        title: 'ejs-previewer-backend',
        license: {
          name: 'MIT',
        },
      },
      filesPattern: './**/*.js',
      baseDir: __dirname,
    },
  },
};
