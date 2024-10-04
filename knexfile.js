require('dotenv').config();
const path = require('path');

module.exports = {

  development: {
    client: 'pg',
    connection: {
      host:     'localhost',
      database: process.env.DB_DEV_NAME,
      user:     process.env.DB_DEV_USER,
      password: process.env.DB_DEV_PASSWORD,
      multipleStatements: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, '/knex/migrations')
    }
  },

  staging: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, '/knex/migrations')
    }
  },

  production: {
    client: 'pg',
    connection: {
      host:     process.env.DB_HOST,
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: path.join(__dirname, '/knex/migrations')
    }
  }

};
