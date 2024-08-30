'use strict';

const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const {
    createSeatsForCoachValidation,
} = require('../validation/seatValidation');
const authenticateJwt = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/roleMiddleware');

// Bulk create Seats inside a coach
router.post(
    '/',
    authenticateJwt,
    authorizeRole('admin'),
    createSeatsForCoachValidation,
    seatController.createSeatsForCoach
);

// Get all seats
router.get(
    '/',
    authenticateJwt,
    authorizeRole('admin'),
    seatController.getAllSeats
);

// Get seats in a train
router.get(
    '/train/:trainId',
    authenticateJwt,
    authorizeRole('admin'),
    seatController.getSeatsByTrain
);

// Update seat data
router.put(
    '/:id',
    authenticateJwt,
    authorizeRole('admin'),
    seatController.updateSeat
);

module.exports = router;
