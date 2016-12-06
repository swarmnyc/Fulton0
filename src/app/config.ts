export = {
  MongoDB: {
    mongoURI: 'mongodb://localhost:27017/test-coolapp'
  },
  OAuth: {
    enabled: true,
    modelName: 'PasswordGrant',
    tokenEndpoint: 'token',
    grants: ['password']
  },
  Logger: {
    transports: {
      console: {
        enabled: true,
        level: 'debug'
      }
    }
  }
};
