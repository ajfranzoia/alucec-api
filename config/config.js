var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
  development: {
    root: rootPath,
    jwt: {
      secret: '510560714356715613650',
      expiresInMinutes: 60,
    },
    port: 3000,
    db: 'mongodb://localhost/alucec_dev'
  },

  test: {
    root: rootPath,
    jwt: {
      secret: '975684563423244546',
      expiresInMinutes: 30,
    },
    port: 3000,
    db: 'mongodb://localhost/alucec_test'
  },

  production: {
    root: rootPath,
    jwt: {
      secret: '467563542342343243',
      expiresInMinutes: 30,
    },
    port: 3000,
    db: 'mongodb://localhost/alucec_production'
  }
};

var envConfig = config[env];

envConfig.paths = {
  root: rootPath,
  models: path.join(rootPath, 'app/models'),
  controllers: path.join(rootPath, 'app/controllers'),
  services: path.join(rootPath, 'app/services')
};

module.exports = envConfig;
