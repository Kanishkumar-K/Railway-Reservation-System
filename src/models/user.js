'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { validate } = require('node-cron');
const { isInt } = require('validator');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            len: [3, 30],
            isAlphanumeric: true,
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        },
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: [6, 30],
        },
    },
    role: {
        type: DataTypes.ENUM('user', 'admin'),
        defaultValue: 'user',
        validate: {
            isIn: [['user', 'admin']],
        },
    },

    age: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            isInt: true,
        },
    },
    gender: {
        type: DataTypes.ENUM('male', 'female', 'other'),
        allowNull: true,
        validate: {
            isIn: [['male', 'female', 'other']],
        },
    },

    mobileNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            is: /^[\d]{10}$/i,
        },
    },
});

module.exports = User;
