'use strict';

const { body, param } = require('express-validator');
const { validationResult } = require('express-validator');

const createSeatsValidation = [
    body('coachId').isInt().withMessage('Coach ID must be an integer'),
    body('trainId').isInt().withMessage('Train ID must be an integer'),
    body('numberOfSeats')
        .isInt()
        .withMessage('Number of seats must be an integer'),
];

const getSeatByIdValidation = [
    param('id').isInt().withMessage('Seat ID must be an integer'),
];

const updateSeatValidation = [
    param('id').isInt().withMessage('Seat ID must be an integer'),
    body('seatNumber')
        .optional()
        .isInt()
        .withMessage('Seat number must be an integer'),
    body('coachId')
        .optional()
        .isInt()
        .withMessage('Coach ID must be an integer'),
    body('trainId')
        .optional()
        .isInt()
        .withMessage('Train ID must be an integer'),
];

const createSeatsForCoachValidation = [
    body('coachId').isInt().withMessage('Coach ID must be an integer.'),
    body('trainId').isInt().withMessage('Train ID must be an integer.'),
    body('numberOfSeats')
        .isInt()
        .optional()
        .withMessage('Number of seats must be an integer if provided.'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
];

module.exports = {
    createSeatsValidation,
    getSeatByIdValidation,
    updateSeatValidation,
    createSeatsForCoachValidation,
};
