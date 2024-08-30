'use strict';

const { body } = require('express-validator');

const bookTicketValidation = [
    body('seatNumber').isString(),
    body('username').isString(),
    body('trainNumber').isString(),
    body('coachName').isString(),
    body('status').optional().isString(),
];

module.exports = { bookTicketValidation };
