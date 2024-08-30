'use strict';

const coachService = require('../services/coachService');
const { validationResult } = require('express-validator');

const createCoach = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const coachData = req.body;
        const newCoach = await coachService.createCoach(coachData);
        res.status(201).json(newCoach);
    } catch (error) {
        if (error.message === 'Train with given ID does not exist') {
            res.status(404).json({
                error: 'Train with the specified ID does not exist',
            });
        } else {
            res.status(400).json({ error: error.message });
        }
    }
};

const getAllCoaches = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const coaches = await coachService.getAllCoaches(
            parseInt(page),
            parseInt(limit)
        );
        res.json(coaches);
    } catch (error) {
        res.status(500).json({
            error: 'An error occurred while retrieving coaches',
        });
    }
};

const getCoachesByTrainId = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const coaches = await coachService.getCoachesByTrainId(
            req.params.trainId
        );
        res.json(coaches);
    } catch (error) {
        if (error.message === 'No coaches found for the specified Train ID') {
            res.status(404).json({
                error: 'No coaches found for the specified Train ID',
            });
        } else {
            res.status(500).json({
                error: 'An error occurred while retrieving the coaches',
            });
        }
    }
};

const updateCoach = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const updatedCoach = await coachService.updateCoach(
            req.params.id,
            req.body
        );
        res.json(updatedCoach);
    } catch (error) {
        if (error.message === 'Coach not found') {
            res.status(404).json({ error: 'Coach not found' });
        } else if (error.message === 'Invalid coach type') {
            res.status(400).json({
                error: 'Invalid coach type. Allowed values: Sleeper, AC, General',
            });
        } else if (error.message === 'Train with given ID does not exist') {
            res.status(404).json({
                error: 'Train with the specified ID does not exist',
            });
        } else {
            res.status(400).json({
                error: 'An error occurred while updating the coach',
            });
        }
    }
};

const deleteCoach = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        await coachService.deleteCoach(req.params.id);
        res.status(204).end();
    } catch (error) {
        if (error.message === 'Coach not found') {
            res.status(404).json({ error: 'Coach not found' });
        } else {
            res.status(500).json({
                error: 'An error occurred while deleting the coach',
            });
        }
    }
};

module.exports = {
    createCoach,
    getAllCoaches,
    getCoachesByTrainId,
    updateCoach,
    deleteCoach,
};
