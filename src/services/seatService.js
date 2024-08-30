'use strict';

const Seat = require('../models/seat');
const SeatAvailability = require('../models/seatAvailability');
const Coach = require('../models/coach');
const Train = require('../models/train');
const logger = require('../config/winston-config');

const createSeatsForCoach = async (coachId, trainId, numberOfSeats = 40) => {
    if (!coachId || !trainId) {
        const error = new Error('Coach ID and Train ID are required');
        logger.error(error.message);
        throw error;
    }

    if (numberOfSeats <= 0) {
        const error = new Error(
            'Hey Admin!! Please specify the number of seats. By default numberOfSeats is 40 per coach'
        );
        logger.error(error.message);
        throw error;
    }

    const transaction = await Seat.sequelize.transaction();

    try {
        const coachExists = await Coach.findByPk(coachId);
        const trainExists = await Train.findByPk(trainId);

        if (!coachExists) {
            const error = new Error('Coach does not exist');
            logger.error(error.message);
            throw error;
        }
        if (!trainExists) {
            const error = new Error('Train does not exist');
            logger.error(error.message);
            throw error;
        }

        const existingSeats = await Seat.findAll({
            where: { coachId, trainId },
        });
        if (existingSeats.length > 0) {
            const error = new Error(
                'Seats have already been created for this coach'
            );
            logger.error(error.message);
            throw error;
        }

        const seats = [];
        const seatAvailability = [];
        for (let i = 1; i <= numberOfSeats; i++) {
            seats.push({
                seatNumber: i,
                coachId,
                trainId,
                status: 'available',
            });

            seatAvailability.push({
                seatNumber: i,
                coachId,
                trainId,
                status: 'available',
                journeyDate: new Date(
                    new Date().setDate(new Date().getDate() + 30)
                ),
            });
        }

        const createdSeats = await Seat.bulkCreate(seats, { transaction });

        for (const availability of seatAvailability) {
            await SeatAvailability.create(
                {
                    seatId: createdSeats.find(
                        (seat) => seat.seatNumber === availability.seatNumber
                    ).id,
                    journeyDate: availability.journeyDate,
                    status: availability.status,
                },
                { transaction }
            );
        }

        await transaction.commit();
        return createdSeats;
    } catch (error) {
        await transaction.rollback();
        logger.error('Error creating seats: ', error);
        throw new Error('Error creating seats: ' + error.message);
    }
};

const getSeatsByTrain = async (trainId) => {
    if (!trainId) {
        const error = new Error('Train ID is required');
        logger.error(error.message);
        throw error;
    }

    try {
        const trainExists = await Train.findByPk(trainId);
        if (!trainExists) {
            const error = new Error('Train does not exist');
            logger.error(error.message);
            throw error;
        }

        const seats = await Seat.findAll({ where: { trainId } });
        if (seats.length === 0) {
            const error = new Error('No seats found for this train');
            logger.error(error.message);
            throw error;
        }

        return seats;
    } catch (error) {
        logger.error('Error retrieving seats for the train: ', error);
        throw new Error(
            'Error retrieving seats for the train: ' + error.message
        );
    }
};

const getAllSeats = async (page = 1, limit = 10) => {
    try {
        if (page < 1 || limit < 1) {
            const error = new Error('Page and limit must be greater than 0');
            logger.error(error.message);
            throw error;
        }

        const offset = (page - 1) * limit;
        const seats = await Seat.findAll({
            limit: limit,
            offset: offset,
        });

        if (seats.length === 0) {
            const error = new Error('No seats found in the system');
            logger.error(error.message);
            throw error;
        }

        return seats;
    } catch (error) {
        logger.error('Error retrieving seats: ', error);
        throw new Error('Error retrieving seats: ' + error.message);
    }
};

const updateSeat = async (id, seatData) => {
    if (!id || !seatData) {
        const error = new Error('Seat ID and seat data are required');
        logger.error(error.message);
        throw error;
    }

    try {
        const seat = await Seat.findByPk(id);
        if (!seat) {
            const error = new Error('Seat not found');
            logger.error(error.message);
            throw error;
        }

        const updatedSeat = await seat.update(seatData);
        return updatedSeat;
    } catch (error) {
        logger.error('Error updating seat: ', error);
        throw new Error('Error updating seat: ' + error.message);
    }
};

module.exports = {
    createSeatsForCoach,
    getAllSeats,
    getSeatsByTrain,
    updateSeat,
};
