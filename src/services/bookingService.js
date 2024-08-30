'use strict';

const sequelize = require('../config/database');
const Booking = require('../models/booking');
const User = require('../models/user');
const SeatAvailability = require('../models/seatAvailability');
const Seat = require('../models/seat');
const Train = require('../models/train');
const Coach = require('../models/coach');
const sendBookingConfirmationEmail = require('./emailService');
const getPrice = require('./pricingService');

const bookTicket = async (
    username,
    trainNumber,
    coachType,
    status,
    seatNumber,
    journeyDate
) => {
    if (
        !username ||
        !trainNumber ||
        !coachType ||
        !journeyDate ||
        !seatNumber
    ) {
        throw new Error('Missing required details. Seat number is mandatory.');
    }

    const journeyDateObj = new Date(journeyDate);
    if (journeyDateObj <= new Date()) {
        throw new Error('Journey date must be in the future.');
    }

    const transaction = await sequelize.transaction();

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error('User not found.');
        }

        const train = await Train.findOne({ where: { trainNumber } });
        if (!train) {
            throw new Error('Train not found.');
        }

        const coach = await Coach.findOne({
            where: { type: coachType, trainId: train.id },
        });
        if (!coach) {
            throw new Error('No available coaches of this type in this train.');
        }

        const seatToBook = await Seat.findOne({
            where: { coachId: coach.id, seatNumber },
            transaction,
        });

        if (!seatToBook) {
            throw new Error('Seat not found.');
        }

        const seatAvailability = await SeatAvailability.findOne({
            where: {
                seatId: seatToBook.id,
                journeyDate: journeyDateObj,
            },
            transaction,
        });

        if (seatAvailability && seatAvailability.status === 'booked') {
            await transaction.rollback();
            return {
                message: `Seat ${seatNumber} is already booked for the journey date ${journeyDate}. Please select another seat.`,
            };
        }

        if (!seatAvailability) {
            await SeatAvailability.create(
                {
                    seatId: seatToBook.id,
                    journeyDate: journeyDateObj,
                    status: 'booked',
                },
                { transaction }
            );
        } else {
            seatAvailability.status = 'booked';
            await seatAvailability.save({ transaction });
        }

        const totalPrice = getPrice(train.totalDistance, coachType, user.age);

        const booking = await Booking.create(
            {
                seatId: seatToBook.id,
                userId: user.id,
                username,
                email: user.email,
                trainNumber,
                coachNumber: coach.coachNumber,
                seatNumber: seatToBook.seatNumber,
                coachType,
                status: status || 'confirmed',
                bookingDate: new Date(),
                journeyDate: journeyDateObj,
                price: totalPrice,
            },
            { transaction }
        );

        await transaction.commit();

        await sendBookingConfirmationEmail(user, train, booking);

        return booking;
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }
        console.error('Error booking ticket:', error);
        throw new Error('Failed to book ticket. Please try again.');
    }
};

const cancelBooking = async (bookingId, username) => {
    if (!bookingId || !username) {
        throw new Error('Booking ID and username are required.');
    }

    const transaction = await sequelize.transaction();

    try {
        const booking = await Booking.findByPk(bookingId);

        if (!booking) {
            throw new Error('Booking not found.');
        }

        if (booking.username.toLowerCase() !== username.toLowerCase()) {
            throw new Error('You are not authorized to cancel this booking.');
        }

        const seat = await Seat.findByPk(booking.seatId);

        if (!seat) {
            throw new Error('Seat not found.');
        }

        await booking.update({ status: 'canceled' }, { transaction });

        await SeatAvailability.update(
            { status: 'available' },
            {
                where: {
                    seatId: seat.id,
                    journeyDate: booking.journeyDate,
                    status: 'booked',
                },
                transaction,
            }
        );

        await SeatAvailability.destroy({
            where: {
                seatId: seat.id,
                journeyDate: booking.journeyDate,
                status: 'available',
            },
            transaction,
        });

        seat.status = 'available';
        await seat.save({ transaction });

        await transaction.commit();

        return { message: 'Booking canceled successfully.' };
    } catch (error) {
        await transaction.rollback();
        console.error(
            `Error canceling booking (ID: ${bookingId}, User: ${username}):`,
            error.message
        );
        throw new Error('Failed to cancel booking. Please try again.');
    }
};

const getUserBookings = async (username) => {
    if (!username) {
        throw new Error('Username is required.');
    }

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            throw new Error('User not found.');
        }

        const bookings = await Booking.findAll({
            where: { userId: user.id },
            include: [
                {
                    model: Train,
                    attributes: [
                        'trainNumber',
                        'name',
                        'source',
                        'destination',
                    ],
                },
                {
                    model: Coach,
                    attributes: ['coachNumber', 'type'],
                },
                {
                    model: Seat,
                    attributes: ['seatNumber'],
                },
            ],
        });

        if (!bookings.length) {
            return { message: 'No bookings found for this user.' };
        }

        return bookings.map((booking) => ({
            bookingId: booking.id,
            train: booking.train,
            coach: booking.coach,
            seat: booking.seat,
            seatNumber: booking.seatNumber,
            coachType: booking.coachType,
            status: booking.status,
            price: booking.price,
            createdAt: booking.createdAt,
        }));
    } catch (error) {
        console.error('Error fetching user bookings:', error.message);
        throw new Error('Failed to retrieve bookings. Please try again.');
    }
};

module.exports = {
    bookTicket,
    cancelBooking,
    getUserBookings,
};
