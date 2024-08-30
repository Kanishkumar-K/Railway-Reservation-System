'use strict';

const {
    createCoach,
    getAllCoaches,
    getCoachesByTrainId,
    updateCoach,
    deleteCoach,
} = require('./coachService');
const Train = require('../models/train');
const Coach = require('../models/coach');

jest.mock('../models/coach', () => {
    return {
        findAll: jest.fn(),
        create: jest.fn(),
        findByPk: jest.fn(),
        destroy: jest.fn(),
        update: jest.fn(),
    };
});

jest.mock('../models/train', () => {
    return {
        findByPk: jest.fn(),
    };
});

describe('createCoach', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error when required fields are missing', async () => {
        const coachData = { coachNumber: '123', type: 'Sleeper' };

        await expect(createCoach(coachData)).rejects.toThrow(
            'Missing required fields: coachNumber, type, and trainId'
        );
    });

    test('should throw an error for invalid coach type', async () => {
        const coachData = { coachNumber: '123', type: 'Luxury', trainId: 1 };

        Train.findByPk.mockResolvedValue({ id: 1 });

        await expect(createCoach(coachData)).rejects.toThrow(
            'Invalid coach type. Allowed values: Sleeper, AC, General'
        );
    });

    test('should throw an error if train does not exist', async () => {
        const coachData = { coachNumber: '123', type: 'Sleeper', trainId: 999 };

        Train.findByPk.mockResolvedValue(null);

        await expect(createCoach(coachData)).rejects.toThrow(
            'Train with given ID does not exist'
        );
    });

    test('should create and return a new coach', async () => {
        const coachData = { coachNumber: '123', type: 'Sleeper', trainId: 1 };
        const mockTrain = { id: 1 };

        Train.findByPk.mockResolvedValue(mockTrain);
        Coach.create.mockResolvedValue(coachData);

        const result = await createCoach(coachData);

        expect(Train.findByPk).toHaveBeenCalledWith(coachData.trainId);
        expect(Coach.create).toHaveBeenCalledWith(coachData);
        expect(result).toEqual(coachData);
    });

    test('should throw an error if database operation fails', async () => {
        const coachData = { coachNumber: '123', type: 'Sleeper', trainId: 1 };
        const mockTrain = { id: 1 };

        Train.findByPk.mockResolvedValue(mockTrain);
        Coach.create.mockRejectedValue(new Error('Database error'));

        await expect(createCoach(coachData)).rejects.toThrow('Database error');
    });
});

describe('getAllCoaches', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error if page or limit is less than 1', async () => {
        await expect(getAllCoaches(0, 10)).rejects.toThrow(
            'Page and limit must be greater than 0'
        );
        await expect(getAllCoaches(1, 0)).rejects.toThrow(
            'Page and limit must be greater than 0'
        );
    });

    test('should throw an error if no coaches are found', async () => {
        Coach.findAll.mockResolvedValue([]);

        await expect(getAllCoaches()).rejects.toThrow(
            'No coaches found in the system'
        );
    });

    test('should return a list of coaches', async () => {
        const coaches = [{ coachNumber: '123', type: 'Sleeper', trainId: 1 }];

        Coach.findAll.mockResolvedValue(coaches);

        const result = await getAllCoaches();

        expect(result).toEqual(coaches);
    });

    test('should handle different page and limit values', async () => {
        const coaches = [{ coachNumber: '123', type: 'Sleeper', trainId: 1 }];

        Coach.findAll.mockResolvedValue(coaches);

        const resultPage1 = await getAllCoaches(1, 10);
        const resultPage2 = await getAllCoaches(2, 5);

        expect(resultPage1).toEqual(coaches);
        expect(resultPage2).toEqual(coaches);
    });

    test('should use correct limit and offset values', async () => {
        const coaches = [{ coachNumber: '123', type: 'Sleeper', trainId: 1 }];

        Coach.findAll.mockResolvedValue(coaches);

        await getAllCoaches(2, 5);
        expect(Coach.findAll).toHaveBeenCalledWith({ limit: 5, offset: 5 });
    });
});

describe('getCoachesByTrainId', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error for invalid Train ID format', async () => {
        await expect(getCoachesByTrainId('abc')).rejects.toThrow(
            'Invalid Train ID format'
        );
    });

    test('should return coaches for a specific train', async () => {
        const trainId = 1;
        const coaches = [{ coachNumber: '123', type: 'AC', trainId: 1 }];

        Coach.findAll.mockResolvedValue(coaches);

        const result = await getCoachesByTrainId(trainId);

        expect(Coach.findAll).toHaveBeenCalledWith({ where: { trainId } });
        expect(result).toEqual(coaches);
    });

    test('should throw an error if no coaches are found for the train', async () => {
        const trainId = 1;

        Coach.findAll.mockResolvedValue([]);

        await expect(getCoachesByTrainId(trainId)).rejects.toThrow(
            'No coaches found for the specified Train ID'
        );
    });

    test('should handle database errors', async () => {
        const trainId = 1;

        Coach.findAll.mockRejectedValue(new Error('Database error'));

        await expect(getCoachesByTrainId(trainId)).rejects.toThrow(
            'Database error'
        );
    });

    test('should use correct Train ID in query', async () => {
        const trainId = 2;
        const coaches = [{ coachNumber: '124', type: 'General', trainId: 2 }];

        Coach.findAll.mockResolvedValue(coaches);

        const result = await getCoachesByTrainId(trainId);

        expect(Coach.findAll).toHaveBeenCalledWith({ where: { trainId } });
        expect(result).toEqual(coaches);
    });
});

describe('updateCoach', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error for invalid ID format', async () => {
        const id = 'abc';
        const coachData = { type: 'AC' };

        await expect(updateCoach(id, coachData)).rejects.toThrow(
            'Invalid ID format'
        );
    });

    test('should throw an error if coach is not found', async () => {
        const id = 1;
        const coachData = { type: 'AC' };

        Coach.findByPk.mockResolvedValue(null);

        await expect(updateCoach(id, coachData)).rejects.toThrow(
            'Coach not found'
        );
    });

    test('should throw an error for invalid coach type', async () => {
        const id = 1;
        const coachData = { type: 'Luxury' };

        Coach.findByPk.mockResolvedValue({ update: jest.fn() });

        await expect(updateCoach(id, coachData)).rejects.toThrow(
            'Invalid coach type. Allowed values: Sleeper, AC, General'
        );
    });

    test('should update and return the coach', async () => {
        const id = 1;
        const coachData = { type: 'AC' };
        const updatedCoach = { id, ...coachData };

        Coach.findByPk.mockResolvedValue({
            update: jest.fn().mockResolvedValue(updatedCoach),
        });

        const result = await updateCoach(id, coachData);

        expect(result).toEqual(updatedCoach);
    });

    test('should handle database errors', async () => {
        const id = 1;
        const coachData = { type: 'AC' };

        Coach.findByPk.mockResolvedValue({
            update: jest.fn().mockRejectedValue(new Error('Database error')),
        });

        await expect(updateCoach(id, coachData)).rejects.toThrow(
            'Database error'
        );
    });
});

describe('deleteCoach', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should throw an error for invalid ID format', async () => {
        const id = 'abc';

        await expect(deleteCoach(id)).rejects.toThrow('Invalid ID format');
    });

    test('should throw an error if coach is not found', async () => {
        const id = 1;

        Coach.findByPk.mockResolvedValue(null);

        await expect(deleteCoach(id)).rejects.toThrow('Coach not found');
    });

    test('should delete and return success message', async () => {
        const id = 1;

        Coach.findByPk.mockResolvedValue({
            destroy: jest.fn().mockResolvedValue(true),
        });

        const result = await deleteCoach(id);

        expect(result).toEqual({ message: 'Coach deleted successfully' });
    });

    test('should handle database errors', async () => {
        const id = 1;

        Coach.findByPk.mockResolvedValue({
            destroy: jest.fn().mockRejectedValue(new Error('Database error')),
        });

        await expect(deleteCoach(id)).rejects.toThrow('Database error');
    });

    test('should use correct ID in deletion', async () => {
        const id = 2;

        Coach.findByPk.mockResolvedValue({
            destroy: jest.fn().mockResolvedValue(true),
        });

        await deleteCoach(id);

        expect(Coach.findByPk).toHaveBeenCalledWith(id);
    });
});
