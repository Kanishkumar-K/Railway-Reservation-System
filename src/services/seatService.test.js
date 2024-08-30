const {
    createSeatsForCoach,
    getSeatsByTrain,
    getAllSeats,
    updateSeat,
} = require('./seatService');
const logger = require('../config/winston-config');
const Train = require('../models/train');
const Coach = require('../models/coach');
const Seat = require('../models/seat');
const SeatAvailability = require('../models/seatAvailability');

jest.mock('../models/Seat', () => ({
    sequelize: {
        transaction: jest.fn(),
    },
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
}));

jest.mock('../models/SeatAvailability', () => ({
    create: jest.fn(),
}));

jest.mock('../models/Coach', () => ({
    findByPk: jest.fn(),
}));

jest.mock('../models/Train', () => ({
    findByPk: jest.fn(),
}));

jest.mock('../config/winston-config', () => ({
    error: jest.fn(),
}));

describe('Seat Service', () => {
    let transactionMock;

    beforeEach(() => {
        transactionMock = {
            commit: jest.fn(),
            rollback: jest.fn(),
        };
        Seat.sequelize.transaction.mockResolvedValue(transactionMock);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createSeatsForCoach', () => {
        it('should create seats for a coach successfully', async () => {
            Coach.findByPk.mockResolvedValue({ id: 1 });
            Train.findByPk.mockResolvedValue({ id: 1 });
            Seat.findAll.mockResolvedValue([]);

            const createdSeats = Array.from({ length: 40 }, (_, i) => ({
                id: i + 1,
                seatNumber: i + 1,
                coachId: 1,
                trainId: 1,
                status: 'available',
            }));
            Seat.bulkCreate.mockResolvedValue(createdSeats);

            SeatAvailability.create.mockResolvedValue({});

            const seats = await createSeatsForCoach(1, 1);

            expect(seats.length).toBe(40);
            expect(seats[0].seatNumber).toBe(1);
            expect(seats[0].status).toBe('available');
            expect(Seat.bulkCreate).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({
                        seatNumber: 1,
                        status: 'available',
                    }),
                ]),
                { transaction: transactionMock }
            );
            expect(SeatAvailability.create).toHaveBeenCalledTimes(40);
            expect(transactionMock.commit).toHaveBeenCalled();
        });

        it('should throw an error if coach does not exist', async () => {
            Coach.findByPk.mockResolvedValue(null);

            await expect(createSeatsForCoach(1, 1)).rejects.toThrow(
                'Coach does not exist'
            );
            expect(transactionMock.rollback).toHaveBeenCalled();
        });

        it('should throw an error if train does not exist', async () => {
            Coach.findByPk.mockResolvedValue({ id: 1 });
            Train.findByPk.mockResolvedValue(null);

            await expect(createSeatsForCoach(1, 1)).rejects.toThrow(
                'Train does not exist'
            );
            expect(transactionMock.rollback).toHaveBeenCalled();
        });

        it('should throw an error if seats already exist for the coach', async () => {
            Coach.findByPk.mockResolvedValue({ id: 1 });
            Train.findByPk.mockResolvedValue({ id: 1 });
            Seat.findAll.mockResolvedValue([{ id: 1 }]);

            await expect(createSeatsForCoach(1, 1)).rejects.toThrow(
                'Seats have already been created for this coach'
            );
            expect(transactionMock.rollback).toHaveBeenCalled();
        });

        it('should handle errors during seat creation', async () => {
            Coach.findByPk.mockResolvedValue({ id: 1 });
            Train.findByPk.mockResolvedValue({ id: 1 });
            Seat.findAll.mockResolvedValue([]);
            Seat.bulkCreate.mockRejectedValue(new Error('Database error'));

            await expect(createSeatsForCoach(1, 1)).rejects.toThrow(
                'Error creating seats: Database error'
            );
            expect(transactionMock.rollback).toHaveBeenCalled();
        });

        it('should handle invalid number of seats', async () => {
            await expect(createSeatsForCoach(1, 1, -5)).rejects.toThrow(
                'Hey Admin!! Please specify the number of seats. By default numberOfSeats is 40 per coach'
            );
        });
    });

    describe('getSeatsByTrain', () => {
        it('should retrieve seats for a train successfully', async () => {
            Train.findByPk.mockResolvedValue({ id: 1 });
            Seat.findAll.mockResolvedValue([
                { id: 1, seatNumber: 1, trainId: 1 },
            ]);

            const seats = await getSeatsByTrain(1);

            expect(seats.length).toBe(1);
            expect(seats[0].seatNumber).toBe(1);
        });

        it('should throw an error if train does not exist', async () => {
            Train.findByPk.mockResolvedValue(null);

            await expect(getSeatsByTrain(1)).rejects.toThrow(
                'Train does not exist'
            );
        });

        it('should throw an error if no seats are found for the train', async () => {
            Train.findByPk.mockResolvedValue({ id: 1 });
            Seat.findAll.mockResolvedValue([]);

            await expect(getSeatsByTrain(1)).rejects.toThrow(
                'No seats found for this train'
            );
        });

        it('should handle invalid train ID', async () => {
            await expect(getSeatsByTrain(null)).rejects.toThrow(
                'Train ID is required'
            );
        });
    });

    describe('getAllSeats', () => {
        it('should retrieve seats with pagination successfully', async () => {
            Seat.findAll.mockResolvedValue([{ id: 1, seatNumber: 1 }]);

            const seats = await getAllSeats(1, 10);

            expect(seats.length).toBe(1);
            expect(seats[0].seatNumber).toBe(1);
        });

        it('should throw an error if page or limit is less than 1', async () => {
            await expect(getAllSeats(0, 10)).rejects.toThrow(
                'Page and limit must be greater than 0'
            );
            await expect(getAllSeats(1, 0)).rejects.toThrow(
                'Page and limit must be greater than 0'
            );
        });

        it('should throw an error if no seats are found', async () => {
            Seat.findAll.mockResolvedValue([]);

            await expect(getAllSeats(1, 10)).rejects.toThrow(
                'No seats found in the system'
            );
        });

        it('should handle invalid page and limit values', async () => {
            await expect(getAllSeats(-1, -10)).rejects.toThrow(
                'Page and limit must be greater than 0'
            );
        });
    });

    describe('updateSeat', () => {
        it('should update seat successfully', async () => {
            const seatData = { seatNumber: 2, status: 'reserved' };
            const seat = {
                id: 1,
                ...seatData,
                update: jest.fn().mockResolvedValue(seatData),
            };

            Seat.findByPk.mockResolvedValue(seat);

            const updatedSeat = await updateSeat(1, seatData);

            expect(updatedSeat.seatNumber).toBe(2);
            expect(updatedSeat.status).toBe('reserved');
            expect(seat.update).toHaveBeenCalledWith(seatData);
        });

        it('should throw an error if seat ID or seat data is not provided', async () => {
            await expect(updateSeat(null, {})).rejects.toThrow(
                'Seat ID and seat data are required'
            );
            await expect(updateSeat(1, null)).rejects.toThrow(
                'Seat ID and seat data are required'
            );
        });

        it('should throw an error if seat does not exist', async () => {
            Seat.findByPk.mockResolvedValue(null);

            await expect(updateSeat(1, { seatNumber: 2 })).rejects.toThrow(
                'Seat not found'
            );
        });

        it('should handle errors during seat update', async () => {
            const seatData = { seatNumber: 2, status: 'reserved' };
            const seat = {
                id: 1,
                ...seatData,
                update: jest.fn().mockRejectedValue(new Error('Update failed')),
            };

            Seat.findByPk.mockResolvedValue(seat);

            await expect(updateSeat(1, seatData)).rejects.toThrow(
                'Error updating seat: Update failed'
            );
        });

        it('should handle non-existent seat ID during update', async () => {
            Seat.findByPk.mockResolvedValue(null);

            await expect(updateSeat(999, { seatNumber: 3 })).rejects.toThrow(
                'Seat not found'
            );
        });
    });
});
