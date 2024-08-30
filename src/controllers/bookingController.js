'use strict';

const bookingService = require('../services/bookingService.js');

const bookTicket = async (req, res) => {
    const {
        username,
        trainNumber,
        coachType,
        status,
        seatNumber,
        journeyDate,
    } = req.body;

    try {
        const booking = await bookingService.bookTicket(
            username,
            trainNumber,
            coachType,
            status,
            seatNumber,
            journeyDate
        );
        res.status(201).json(booking);
    } catch (error) {
        console.error('Error booking ticket:', error);
        res.status(500).json({ error: error.message });
    }
};

const cancelBooking = async (req, res) => {
    const { bookingId } = req.params;
    const username = req.user.username;

    try {
        const result = await bookingService.cancelBooking(bookingId, username);
        res.status(200).json(result);
    } catch (error) {
        console.error(
            `Error canceling booking (ID: ${bookingId}, User: ${username}):`,
            error.message
        );

        if (error.message.includes('not authorized')) {
            res.status(403).json({ error: error.message });
        } else if (error.message.includes('not found')) {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({
                error: 'An unexpected error occurred. Please try again later.',
            });
        }
    }
};

const fetchUserBookings = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }

        const userBookings = await bookingService.getUserBookings(username);
        res.status(200).json(userBookings);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

module.exports = {
    bookTicket,
    cancelBooking,
    fetchUserBookings,
};
