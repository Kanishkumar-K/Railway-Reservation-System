'use strict';

require('dotenv').config();

const isDocker = process.env.ENV === 'production';

module.exports = {
    development: {
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: isDocker ? 'host.docker.internal' : process.env.DB_HOST,
        dialect: 'mysql',
    },
};
