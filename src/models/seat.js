'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Coach = require('./coach');
const Train = require('./train');

const Seat = sequelize.define(
    'Seat',
    {
        seatNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        coachId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Coach,
                key: 'id',
            },
        },
        trainId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Train,
                key: 'id',
            },
        },
    },
    {
        tableName: 'seats',
    }
);

module.exports = Seat;
