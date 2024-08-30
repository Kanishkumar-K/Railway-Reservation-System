'use strict';

const trainService = require('../services/trainService');

const createTrain = async (req, res) => {
    try {
        const trainData = req.body;
        const newTrain = await trainService.createTrain(trainData);
        res.status(201).json(newTrain);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getAllTrains = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const trains = await trainService.getAllTrains(
            parseInt(page),
            parseInt(limit)
        );
        res.json(trains);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getTrainById = async (req, res) => {
    try {
        const { id } = req.params;
        const train = await trainService.getTrainById(id);
        res.json(train);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const updateTrain = async (req, res) => {
    try {
        const { id } = req.params;
        const trainData = req.body;
        const updatedTrain = await trainService.updateTrain(id, trainData);
        res.json(updatedTrain);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const deleteTrain = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await trainService.deleteTrain(id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createTrain,
    getAllTrains,
    getTrainById,
    updateTrain,
    deleteTrain,
};
