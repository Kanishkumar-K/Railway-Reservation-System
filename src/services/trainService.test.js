const bcrypt = require('bcrypt');
const Train = require('../models/train');
const trainService = require('./trainService');

jest.mock('bcrypt');
jest.mock('../models/train');

describe('Train Service Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTrain', () => {
        test('should create a new train successfully', async () => {
            const trainData = {
                trainNumber: '123',
                name: 'Express',
                source: 'CityA',
                destination: 'CityB',
                departureTime: '2024-01-01T10:00:00Z',
                arrivalTime: '2024-01-01T14:00:00Z',
            };
            Train.findOne.mockResolvedValue(null);
            Train.create.mockResolvedValue(trainData);

            const result = await trainService.createTrain(trainData);

            expect(result).toEqual(trainData);
            expect(Train.findOne).toHaveBeenCalledWith({
                where: { trainNumber: '123' },
            });
            expect(Train.create).toHaveBeenCalledWith(trainData);
        });

        test('should throw an error if required fields are missing', async () => {
            const incompleteData = {
                trainNumber: '123',
                name: 'Express',
            };

            await expect(
                trainService.createTrain(incompleteData)
            ).rejects.toThrow(
                'All fields (trainNumber, name, source, destination, departureTime, arrivalTime) are required'
            );
        });

        test('should throw an error if departure time is not before arrival time', async () => {
            const invalidData = {
                trainNumber: '123',
                name: 'Express',
                source: 'CityA',
                destination: 'CityB',
                departureTime: '2024-01-01T14:00:00Z',
                arrivalTime: '2024-01-01T10:00:00Z',
            };

            await expect(trainService.createTrain(invalidData)).rejects.toThrow(
                'Departure time must be before arrival time'
            );
        });

        test('should handle unexpected errors from Train.create', async () => {
            const trainData = {
                trainNumber: '123',
                name: 'Express',
                source: 'CityA',
                destination: 'CityB',
                departureTime: '2024-01-01T10:00:00Z',
                arrivalTime: '2024-01-01T14:00:00Z',
            };
            Train.findOne.mockResolvedValue(null);
            Train.create.mockRejectedValue(new Error('Database error'));

            await expect(trainService.createTrain(trainData)).rejects.toThrow(
                'Error creating train: Database error'
            );
        });

        test('should throw an error if input object is empty', async () => {
            await expect(trainService.createTrain({})).rejects.toThrow(
                'All fields (trainNumber, name, source, destination, departureTime, arrivalTime) are required'
            );
        });
    });

    describe('getAllTrains', () => {
        test('should return a list of trains with pagination', async () => {
            const mockTrains = [
                { trainNumber: '123', name: 'Express' },
                { trainNumber: '456', name: 'Local' },
            ];
            Train.findAll.mockResolvedValue(mockTrains);

            const result = await trainService.getAllTrains(1, 2);

            expect(result).toEqual(mockTrains);
            expect(Train.findAll).toHaveBeenCalledWith({ limit: 2, offset: 0 });
        });

        test('should throw an error if page or limit are invalid', async () => {
            await expect(trainService.getAllTrains(0, 10)).rejects.toThrow(
                'Page and limit must be greater than 0'
            );
            await expect(trainService.getAllTrains(1, -5)).rejects.toThrow(
                'Page and limit must be greater than 0'
            );
        });

        test('should throw an error if no trains are found', async () => {
            Train.findAll.mockResolvedValue([]);

            await expect(trainService.getAllTrains(1, 2)).rejects.toThrow(
                'No trains found'
            );
        });

        test('should handle database errors gracefully', async () => {
            Train.findAll.mockRejectedValue(
                new Error('Database connection error')
            );

            await expect(trainService.getAllTrains(1, 2)).rejects.toThrow(
                'Database connection error'
            );
        });

        test('should correctly calculate the offset based on page and limit', async () => {
            const mockTrains = [{ trainNumber: '789', name: 'Regional' }];
            Train.findAll.mockResolvedValue(mockTrains);

            const result = await trainService.getAllTrains(3, 5);

            expect(result).toEqual(mockTrains);
            expect(Train.findAll).toHaveBeenCalledWith({
                limit: 5,
                offset: 10,
            });
        });

        test('should return trains even if the last page has fewer results than the limit', async () => {
            const mockTrains = [{ trainNumber: '123', name: 'Express' }];
            Train.findAll.mockResolvedValue(mockTrains);

            const result = await trainService.getAllTrains(3, 2);

            expect(result).toEqual(mockTrains);
            expect(Train.findAll).toHaveBeenCalledWith({ limit: 2, offset: 4 });
        });

        test('should throw an error if page number is negative', async () => {
            await expect(trainService.getAllTrains(-1, 5)).rejects.toThrow(
                'Page and limit must be greater than 0'
            );
        });
    });

    describe('getTrainById', () => {
        test('should return a train by ID', async () => {
            const mockTrain = { id: 1, name: 'Express' };
            Train.findByPk.mockResolvedValue(mockTrain);

            const result = await trainService.getTrainById(1);

            expect(result).toEqual(mockTrain);
            expect(Train.findByPk).toHaveBeenCalledWith(1);
        });

        test('should throw an error if the train is not found', async () => {
            Train.findByPk.mockResolvedValue(null);

            await expect(trainService.getTrainById(1)).rejects.toThrow(
                'Train not found'
            );
        });
    });

    describe('updateTrain', () => {
        test('should update a train successfully', async () => {
            const mockTrain = { id: 1, name: 'Express', update: jest.fn() };
            Train.findByPk.mockResolvedValue(mockTrain);
            const updatedData = { name: 'Super Express' };
            mockTrain.update.mockResolvedValue({
                ...mockTrain,
                ...updatedData,
            });

            const result = await trainService.updateTrain(1, updatedData);

            expect(result).toEqual({ ...mockTrain, ...updatedData });
            expect(Train.findByPk).toHaveBeenCalledWith(1);
            expect(mockTrain.update).toHaveBeenCalledWith(updatedData);
        });

        test('should throw an error if the train is not found', async () => {
            Train.findByPk.mockResolvedValue(null);

            await expect(
                trainService.updateTrain(1, { name: 'Super Express' })
            ).rejects.toThrow('Train not found');
        });

        test('should throw an error if departure time is not before arrival time', async () => {
            const mockTrain = { id: 1, name: 'Express', update: jest.fn() };
            Train.findByPk.mockResolvedValue(mockTrain);
            const invalidData = {
                departureTime: '2024-01-01T14:00:00Z',
                arrivalTime: '2024-01-01T10:00:00Z',
            };

            await expect(
                trainService.updateTrain(1, invalidData)
            ).rejects.toThrow('Departure time must be before arrival time');
        });
    });

    describe('deleteTrain', () => {
        test('should delete a train successfully', async () => {
            const mockTrain = { id: 1, destroy: jest.fn() };
            Train.findByPk.mockResolvedValue(mockTrain);

            const result = await trainService.deleteTrain(1);

            expect(result).toEqual({ message: 'Train deleted successfully' });
            expect(Train.findByPk).toHaveBeenCalledWith(1);
            expect(mockTrain.destroy).toHaveBeenCalled();
        });

        test('should throw an error if the train is not found', async () => {
            Train.findByPk.mockResolvedValue(null);

            await expect(trainService.deleteTrain(1)).rejects.toThrow(
                'Train not found'
            );
        });

        test('should throw an error if deletion fails', async () => {
            const mockTrain = {
                id: 1,
                destroy: jest
                    .fn()
                    .mockRejectedValue(new Error('Deletion failed')),
            };
            Train.findByPk.mockResolvedValue(mockTrain);

            await expect(trainService.deleteTrain(1)).rejects.toThrow(
                'Error deleting train: Deletion failed'
            );
        });

        test('should throw an error if ID is invalid', async () => {
            const invalidId = 'abc';

            await expect(trainService.deleteTrain(invalidId)).rejects.toThrow(
                'Invalid ID format'
            );
        });
    });
});
