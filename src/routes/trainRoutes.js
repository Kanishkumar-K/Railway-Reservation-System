'use strict';

const express = require('express');
const trainController = require('../controllers/trainController');
const authenticateJwt = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Get all trains
router.get('/', trainController.getAllTrains);

// Get train by id
router.get('/:id', trainController.getTrainById);

// Create train data
router.post(
    '/',
    authenticateJwt,
    authorizeRole(['admin']),
    trainController.createTrain
);

// Update train details
router.put(
    '/:id',
    authenticateJwt,
    authorizeRole(['admin']),
    trainController.updateTrain
);

// Delete train data
router.delete(
    '/:id',
    authenticateJwt,
    authorizeRole(['admin']),
    trainController.deleteTrain
);

module.exports = router;
