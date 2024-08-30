'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Train = require('./train');

const Coach = sequelize.define(
    'Coach',
    {
        coachNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        type: {
            type: DataTypes.ENUM('Sleeper', 'AC', 'General'),
            allowNull: false,
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
        tableName: 'coaches',
    }
);

Coach.belongsTo(Train, { foreignKey: 'trainId' });
Train.hasMany(Coach, { foreignKey: 'trainId' });

module.exports = Coach;
