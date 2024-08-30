'use strict';

const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Seat = require('./seat');

class SeatAvailability extends Model {}

SeatAvailability.init(
    {
        seatId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Seats',
                key: 'id',
            },
        },
        journeyDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('available', 'booked'),
            defaultValue: 'available',
        },
    },
    {
        sequelize,
        modelName: 'SeatAvailability',
    }
);
SeatAvailability.belongsTo(Seat, { foreignKey: 'seatId' });
Seat.hasMany(SeatAvailability, { foreignKey: 'seatId' });

module.exports = SeatAvailability;
