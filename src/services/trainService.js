'use strict';

const logger = require('../config/winston-config');
const Train = require('../models/train');

const createTrain = async (trainData) => {
    try {
        const {
            trainNumber,
            name,
            source,
            destination,
            departureTime,
            arrivalTime,
        } = trainData;

        if (
            !trainNumber ||
            !name ||
            !source ||
            !destination ||
            !departureTime ||
            !arrivalTime
        ) {
            const error = new Error(
                'All fields (trainNumber, name, source, destination, departureTime, arrivalTime) are required'
            );
            logger.error(error.message);
            throw error;
        }

        if (new Date(departureTime) >= new Date(arrivalTime)) {
            const error = new Error(
                'Departure time must be before arrival time'
            );
            logger.error(error.message);
            throw error;
        }

        const existingTrain = await Train.findOne({ where: { trainNumber } });
        if (existingTrain) {
            const error = new Error('Train with this number already exists');
            logger.error(error.message);
            throw error;
        }

        const newTrain = await Train.create(trainData);
        return newTrain;
    } catch (error) {
        logger.error('Error creating train: ' + error.message, {
            stack: error.stack,
        });
        throw new Error('Error creating train: ' + error.message);
    }
};

const getAllTrains = async (page = 1, limit = 10) => {
    try {
        if (page < 1 || limit < 1) {
            const error = new Error('Page and limit must be greater than 0');
            logger.error(error.message);
            throw error;
        }

        const offset = (page - 1) * limit;
        const trains = await Train.findAll({
            limit: limit,
            offset: offset,
        });

        if (trains.length === 0) {
            const error = new Error('No trains found');
            logger.error(error.message);
            throw error;
        }

        return trains;
    } catch (error) {
        logger.error('Error retrieving trains: ' + error.message, {
            stack: error.stack,
        });
        throw new Error('Error retrieving trains: ' + error.message);
    }
};

const getTrainById = async (id) => {
    try {
        if (isNaN(parseInt(id))) {
            const error = new Error('Invalid ID format');
            logger.error(error.message);
            throw error;
        }

        const train = await Train.findByPk(id);
        if (!train) {
            const error = new Error('Train not found');
            logger.error(error.message);
            throw error;
        }

        return train;
    } catch (error) {
        logger.error('Error retrieving train: ' + error.message, {
            stack: error.stack,
        });
        throw new Error('Error retrieving train: ' + error.message);
    }
};

const updateTrain = async (id, trainData) => {
    try {
        if (isNaN(parseInt(id))) {
            const error = new Error('Invalid ID format');
            logger.error(error.message);
            throw error;
        }

        const train = await Train.findByPk(id);
        if (!train) {
            const error = new Error('Train not found');
            logger.error(error.message);
            throw error;
        }

        const { trainNumber, departureTime, arrivalTime } = trainData;

        if (trainNumber && !trainNumber.trim()) {
            const error = new Error('Invalid train number');
            logger.error(error.message);
            throw error;
        }

        if (
            departureTime &&
            arrivalTime &&
            new Date(departureTime) >= new Date(arrivalTime)
        ) {
            const error = new Error(
                'Departure time must be before arrival time'
            );
            logger.error(error.message);
            throw error;
        }

        const updatedTrain = await train.update(trainData);
        return updatedTrain;
    } catch (error) {
        logger.error('Error updating train: ' + error.message, {
            stack: error.stack,
        });
        throw new Error('Error updating train: ' + error.message);
    }
};

const deleteTrain = async (id) => {
    try {
        if (isNaN(parseInt(id))) {
            const error = new Error('Invalid ID format');
            logger.error(error.message);
            throw error;
        }

        const train = await Train.findByPk(id);
        if (!train) {
            const error = new Error('Train not found');
            logger.error(error.message);
            throw error;
        }

        await train.destroy();
        return { message: 'Train deleted successfully' };
    } catch (error) {
        logger.error('Error deleting train: ' + error.message, {
            stack: error.stack,
        });
        throw new Error('Error deleting train: ' + error.message);
    }
};

module.exports = {
    createTrain,
    getAllTrains,
    getTrainById,
    updateTrain,
    deleteTrain,
};
