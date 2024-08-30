'use strict';

const seatService = require('../services/seatService');
const { validationResult } = require('express-validator');

const createSeatsForCoach = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { coachId, trainId, numberOfSeats } = req.body;
        const seats = await seatService.createSeatsForCoach(
            coachId,
            trainId,
            numberOfSeats
        );
        res.status(201).json(seats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllSeats = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const seats = await seatService.getAllSeats(
            parseInt(page),
            parseInt(limit)
        );
        res.json(seats);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while retrieving seats',
        });
    }
};

const getSeatsByTrain = async (req, res) => {
    try {
        const seats = await seatService.getSeatsByTrain(req.params.trainId);
        res.json(seats);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while retrieving seats for the train',
        });
    }
};

const updateSeat = async (req, res) => {
    try {
        const updatedSeat = await seatService.updateSeat(
            req.params.id,
            req.body
        );
        res.json(updatedSeat);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    createSeatsForCoach,
    getAllSeats,
    getSeatsByTrain,
    updateSeat,
};
