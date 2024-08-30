'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Train = sequelize.define(
    'Train',
    {
        trainNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        destination: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        departureTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        arrivalTime: {
            type: DataTypes.TIME,
            allowNull: false,
        },
        totalDistance: {
            type: DataTypes.FLOAT,
            allowNull: false,
        },
    },
    {
        tableName: 'trains',
    }
);

module.exports = Train;
