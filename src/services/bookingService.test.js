'use strict';

const {
    bookTicket,
    cancelBooking,
    getUserBookings,
} = require('./bookingService');

const Booking = require('../models/booking');
const User = require('../models/user');
const SeatAvailability = require('../models/seatAvailability');
const Seat = require('../models/seat');
const Train = require('../models/train');
const Coach = require('../models/coach');
const sendBookingConfirmationEmail =
    require('./emailService').sendBookingConfirmationEmail;
const getPrice = require('./pricingService').getPrice;

jest.mock('../models/booking', () => {
    return {
        create: jest.fn(),
        findByPk: jest.fn(),
        findAll: jest.fn(),
    };
});

jest.mock('../models/user', () => {
    return {
        findOne: jest.fn(),
    };
});

jest.mock('../models/seatAvailability', () => {
    return {
        create: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
    };
});

jest.mock('../models/seat', () => {
    return {
        findByPk: jest.fn(),
        save: jest.fn(),
    };
});

jest.mock('../models/train', () => {
    return {
        findOne: jest.fn(),
    };
});

jest.mock('../models/coach', () => {
    return {
        findOne: jest.fn(),
    };
});

jest.mock('./emailService', () => ({
    sendBookingConfirmationEmail: jest.fn(),
}));

jest.mock('./pricingService', () => ({
    getPrice: jest.fn(),
}));

describe('bookTicket', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error for missing required details', async () => {
        await expect(
            bookTicket(
                null,
                '12345',
                'Sleeper',
                'confirmed',
                'A1',
                '2024-08-30'
            )
        ).rejects.toThrow(
            'Missing required details. Seat number is mandatory.'
        );
    });

    test('should throw an error for past journey date', async () => {
        await expect(
            bookTicket(
                'kanish',
                '12345',
                'Sleeper',
                'confirmed',
                'A1',
                '2020-08-30'
            )
        ).rejects.toThrow('Journey date must be in the future.');
    });

    test('should throw an error if sending confirmation email fails', async () => {
        const user = { id: 1, email: 'kanish@example.com' };
        const train = { id: 1 };
        const coach = { id: 1 };
        const seat = { id: 1 };
        const seatAvailability = { id: 1, status: 'available' };
        const booking = {
            id: 1,
            seatId: seat.id,
            userId: user.id,
            username: 'kanish',
            email: user.email,
            trainNumber: '12345',
            coachNumber: '001',
            seatNumber: 'A1',
            coachType: 'Sleeper',
            status: 'confirmed',
            bookingDate: new Date(),
            journeyDate: new Date('2024-08-30'),
            price: 100,
        };

        User.findOne.mockResolvedValue(user);
        Train.findOne.mockResolvedValue(train);
        Coach.findOne.mockResolvedValue(coach);
        Seat.findByPk.mockResolvedValue(seat);
        SeatAvailability.findOne.mockResolvedValue(null);
        SeatAvailability.create.mockResolvedValue(seatAvailability);
        Booking.create.mockResolvedValue(booking);
        getPrice.mockReturnValue(100);
        sendBookingConfirmationEmail.mockRejectedValue(
            new Error('Email service error')
        );

        await expect(
            bookTicket(
                'kanish',
                '12345',
                'Sleeper',
                'confirmed',
                'A1',
                '2024-08-30'
            )
        ).rejects.toThrow('Failed to book ticket. Please try again.');
    });

    test('should throw an error if booking creation fails', async () => {
        const user = { id: 1 };
        const train = { id: 1 };
        const coach = { id: 1 };
        const seat = { id: 1 };
        const seatAvailability = { id: 1, status: 'available' };

        User.findOne.mockResolvedValue(user);
        Train.findOne.mockResolvedValue(train);
        Coach.findOne.mockResolvedValue(coach);
        Seat.findByPk.mockResolvedValue(seat);
        SeatAvailability.findOne.mockResolvedValue(seatAvailability);
        Booking.create.mockRejectedValue(new Error('Database error'));

        await expect(
            bookTicket(
                'kanish',
                '12345',
                'Sleeper',
                'confirmed',
                'A1',
                '2024-08-30'
            )
        ).rejects.toThrow('Failed to book ticket. Please try again.');
    });
});

describe('cancelBooking', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error for missing booking ID or username', async () => {
        await expect(cancelBooking(null, 'kanish')).rejects.toThrow(
            'Booking ID and username are required.'
        );
        await expect(cancelBooking(1, null)).rejects.toThrow(
            'Booking ID and username are required.'
        );
    });

    test('should throw an error if booking does not exist', async () => {
        Booking.findByPk.mockResolvedValue(null);

        await expect(cancelBooking(1, 'kanish')).rejects.toThrow(
            'Failed to cancel booking. Please try again.'
        );
    });

    test('should handle errors during cancellation process', async () => {
        Booking.findByPk.mockResolvedValue({ username: 'kanish', seatId: 1 });
        Seat.findByPk.mockRejectedValue(new Error('Database error'));

        await expect(cancelBooking(1, 'kanish')).rejects.toThrow(
            'Failed to cancel booking. Please try again.'
        );
    });

    test('should throw an error if seat does not exist during cancellation', async () => {
        Booking.findByPk.mockResolvedValue({ username: 'kanish', seatId: 1 });
        Seat.findByPk.mockResolvedValue(null);

        await expect(cancelBooking(1, 'kanish')).rejects.toThrow(
            'Failed to cancel booking. Please try again.'
        );
    });

    test('should throw an error if booking does not exist during cancellation', async () => {
        Booking.findByPk.mockResolvedValue(null);

        await expect(cancelBooking(1, 'kanish')).rejects.toThrow(
            'Failed to cancel booking. Please try again.'
        );
    });
});

describe('getUserBookings', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error for missing username', async () => {
        await expect(getUserBookings(null)).rejects.toThrow(
            'Username is required.'
        );
    });

    test('should return user bookings', async () => {
        const user = { id: 1 };
        const bookings = [
            {
                id: 1,
                train: {
                    trainNumber: '12345',
                    name: 'Express',
                    source: 'City A',
                    destination: 'City B',
                },
                coach: { coachNumber: '001', type: 'Sleeper' },
                seat: { seatNumber: 'A1' },
                seatNumber: 'A1',
                coachType: 'Sleeper',
                status: 'confirmed',
                price: 100,
                createdAt: new Date(),
            },
        ];

        User.findOne.mockResolvedValue(user);
        Booking.findAll.mockResolvedValue(bookings);

        const result = await getUserBookings('kanish');

        expect(result).toEqual([
            {
                bookingId: 1,
                train: bookings[0].train,
                coach: bookings[0].coach,
                seat: bookings[0].seat,
                seatNumber: 'A1',
                coachType: 'Sleeper',
                status: 'confirmed',
                price: 100,
                createdAt: bookings[0].createdAt,
            },
        ]);
    });

    test('should return message if no bookings found', async () => {
        User.findOne.mockResolvedValue({ id: 1 });
        Booking.findAll.mockResolvedValue([]);

        const result = await getUserBookings('kanish');

        expect(result).toEqual({ message: 'No bookings found for this user.' });
    });

    test('should handle errors during fetching bookings', async () => {
        User.findOne.mockResolvedValue({ id: 1 });
        Booking.findAll.mockRejectedValue(new Error('Database error'));

        await expect(getUserBookings('kanish')).rejects.toThrow(
            'Failed to retrieve bookings. Please try again.'
        );
    });

    test('should return multiple bookings for a user', async () => {
        const user = { id: 1 };
        const bookings = [
            {
                id: 1,
                train: { trainNumber: '12345' },
                coach: { coachNumber: '001' },
                seat: { seatNumber: 'A1' },
                seatNumber: 'A1',
                coachType: 'Sleeper',
                status: 'confirmed',
                price: 100,
                createdAt: new Date(),
            },
            {
                id: 2,
                train: { trainNumber: '67890' },
                coach: { coachNumber: '002' },
                seat: { seatNumber: 'B2' },
                seatNumber: 'B2',
                coachType: 'AC',
                status: 'confirmed',
                price: 200,
                createdAt: new Date(),
            },
        ];

        User.findOne.mockResolvedValue(user);
        Booking.findAll.mockResolvedValue(bookings);

        const result = await getUserBookings('kanish');

        expect(result).toEqual(
            bookings.map((booking) => ({
                bookingId: booking.id,
                train: booking.train,
                coach: booking.coach,
                seat: booking.seat,
                seatNumber: booking.seatNumber,
                coachType: booking.coachType,
                status: booking.status,
                price: booking.price,
                createdAt: booking.createdAt,
            }))
        );
    });

    test('should handle database error during fetching bookings', async () => {
        User.findOne.mockResolvedValue({ id: 1 });
        Booking.findAll.mockRejectedValue(new Error('Database error'));
    });
});
