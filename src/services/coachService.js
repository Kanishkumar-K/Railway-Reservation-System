'use strict';

const Coach = require('../models/coach');
const Train = require('../models/train');
const logger = require('../config/winston-config');

const createCoach = async (coachData) => {
    try {
        if (!coachData.coachNumber || !coachData.type || !coachData.trainId) {
            const error = new Error(
                'Missing required fields: coachNumber, type, and trainId'
            );
            logger.error(error.message);
            throw error;
        }

        const validTypes = ['Sleeper', 'AC', 'General'];
        if (!validTypes.includes(coachData.type)) {
            const error = new Error(
                'Invalid coach type. Allowed values: Sleeper, AC, General'
            );
            logger.error(error.message);
            throw error;
        }

        const trainExists = await Train.findByPk(coachData.trainId);
        if (!trainExists) {
            const error = new Error('Train with given ID does not exist');
            logger.error(error.message);
            throw error;
        }

        const newCoach = await Coach.create(coachData);
        logger.info(`Coach created successfully: ${newCoach.coachNumber}`);
        return newCoach;
    } catch (error) {
        logger.error('Error creating coach: ', error);
        throw new Error(error.message);
    }
};

const getAllCoaches = async (page = 1, limit = 10) => {
    try {
        if (page < 1 || limit < 1) {
            const error = new Error('Page and limit must be greater than 0');
            logger.error(error.message);
            throw error;
        }

        const offset = (page - 1) * limit;
        const coaches = await Coach.findAll({
            limit: limit,
            offset: offset,
        });

        if (coaches.length === 0) {
            const error = new Error('No coaches found in the system');
            logger.info(error.message);
            throw error;
        }

        logger.info(`Retrieved ${coaches.length} coaches from the system`);
        return coaches;
    } catch (error) {
        logger.error('An error occurred while retrieving coaches: ', error);
        throw new Error(
            'An error occurred while retrieving coaches: ' + error.message
        );
    }
};

const getCoachesByTrainId = async (trainId) => {
    try {
        if (isNaN(trainId)) {
            const error = new Error('Invalid Train ID format');
            logger.error(error.message);
            throw error;
        }

        const coaches = await Coach.findAll({
            where: { trainId },
        });

        if (coaches.length === 0) {
            const error = new Error(
                'No coaches found for the specified Train ID'
            );
            logger.info(error.message);
            throw error;
        }

        logger.info(
            `Retrieved ${coaches.length} coaches for Train ID: ${trainId}`
        );
        return coaches;
    } catch (error) {
        logger.error('Error retrieving coaches: ', error);
        throw new Error(error.message);
    }
};

const updateCoach = async (id, coachData) => {
    try {
        if (isNaN(id)) {
            const error = new Error('Invalid ID format');
            logger.error(error.message);
            throw error;
        }

        const coach = await Coach.findByPk(id);
        if (!coach) {
            const error = new Error('Coach not found');
            logger.error(error.message);
            throw error;
        }

        if (coachData.type) {
            const validTypes = ['Sleeper', 'AC', 'General'];
            if (!validTypes.includes(coachData.type)) {
                const error = new Error(
                    'Invalid coach type. Allowed values: Sleeper, AC, General'
                );
                logger.error(error.message);
                throw error;
            }
        }

        if (coachData.trainId) {
            const trainExists = await Train.findByPk(coachData.trainId);
            if (!trainExists) {
                const error = new Error('Train with given ID does not exist');
                logger.error(error.message);
                throw error;
            }
        }

        const updatedCoach = await coach.update(coachData);
        logger.info(`Coach updated successfully: ${updatedCoach.coachNumber}`);
        return updatedCoach;
    } catch (error) {
        logger.error('Error updating coach: ', error);
        throw new Error(error.message);
    }
};

const deleteCoach = async (id) => {
    try {
        if (isNaN(id)) {
            const error = new Error('Invalid ID format');
            logger.error(error.message);
            throw error;
        }

        const coach = await Coach.findByPk(id);
        if (!coach) {
            const error = new Error('Coach not found');
            logger.error(error.message);
            throw error;
        }

        await coach.destroy();
        logger.info(`Coach deleted successfully: ID ${id}`);
        return { message: 'Coach deleted successfully' };
    } catch (error) {
        logger.error('Error deleting coach: ', error);
        throw new Error(error.message);
    }
};

module.exports = {
    createCoach,
    getAllCoaches,
    getCoachesByTrainId,
    updateCoach,
    deleteCoach,
};
