'use strict';

const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const authenticateJwt = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/roleMiddleware');
const { bookTicketValidation } = require('../validation/bookingValidation');

// Create booking and payment
router.post(
    '/book',
    authenticateJwt,
    bookTicketValidation,
    bookingController.bookTicket
);

// Cancel Boking
router.delete(
    '/cancel/:bookingId',
    authenticateJwt,
    authorizeRole(['admin', 'user']),
    bookingController.cancelBooking
);

// View my bookings
router.get(
    '/user-bookings',
    authenticateJwt,
    authorizeRole(['admin', 'user']),
    bookingController.fetchUserBookings
);

module.exports = router;
