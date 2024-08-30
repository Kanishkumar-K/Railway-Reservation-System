'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./user');
const Train = require('./train');
const Coach = require('./coach');
const Seat = require('./seat');

const Booking = sequelize.define(
    'Booking',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        seatId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Seat,
                key: 'id',
            },
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        trainNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Train,
                key: 'trainNumber',
            },
        },
        coachNumber: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: Coach,
                key: 'coachNumber',
            },
        },
        seatNumber: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        coachType: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        status: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'booked',
        },
        bookingDate: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        journeyDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
    },
    {
        tableName: 'Bookings',
        indexes: [
            {
                unique: true,
                fields: ['seatId', 'trainNumber', 'coachNumber', 'journeyDate'],
            },
        ],
        timestamps: true,
    }
);

Booking.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Booking, { foreignKey: 'userId' });

Booking.belongsTo(Seat, { foreignKey: 'seatId' });
Seat.hasMany(Booking, { foreignKey: 'seatId' });

Booking.belongsTo(Train, {
    foreignKey: 'trainNumber',
    targetKey: 'trainNumber',
});
Train.hasMany(Booking, { foreignKey: 'trainNumber', sourceKey: 'trainNumber' });

Booking.belongsTo(Coach, {
    foreignKey: 'coachNumber',
    targetKey: 'coachNumber',
});
Coach.hasMany(Booking, { foreignKey: 'coachNumber', sourceKey: 'coachNumber' });

module.exports = Booking;
