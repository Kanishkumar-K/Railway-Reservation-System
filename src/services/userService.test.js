const bcrypt = require('bcrypt');
const User = require('../models/user');
const userService = require('./userService');

jest.mock('bcrypt');
jest.mock('../models/user');

describe('User Service Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createUser', () => {
        test('should create a user successfully', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
            };
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.create.mockResolvedValue(mockUser);

            const result = await userService.createUser(
                'testuser',
                'password123',
                'test@test.com'
            );

            expect(result).toEqual(mockUser);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(User.create).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'hashedPassword',
                email: 'test@test.com',
                role: 'user',
            });
        });

        test('should throw an error if username, password, or email is missing', async () => {
            await expect(
                userService.createUser('', 'password123', 'test@test.com')
            ).rejects.toThrow('Username, password, and email are required.');
            await expect(
                userService.createUser('testuser', '', 'test@test.com')
            ).rejects.toThrow('Username, password, and email are required.');
            await expect(
                userService.createUser('testuser', 'password123', '')
            ).rejects.toThrow('Username, password, and email are required.');
            await expect(
                userService.createUser('testuser', '', '')
            ).rejects.toThrow('Username, password, and email are required.');
            await expect(
                userService.createUser('', 'password123', '')
            ).rejects.toThrow('Username, password, and email are required.');
            await expect(
                userService.createUser('', '', 'test@test.com')
            ).rejects.toThrow('Username, password, and email are required.');
            await expect(userService.createUser('', '', '')).rejects.toThrow(
                'Username, password, and email are required.'
            );
        });

        test('should throw an error for invalid email format', async () => {
            await expect(
                userService.createUser(
                    'testuser',
                    'password123',
                    'invalid-email'
                )
            ).rejects.toThrow('Invalid email address.');
        });

        test('should throw an error if password is less than 6 characters', async () => {
            await expect(
                userService.createUser('testuser', '123', 'test@test.com')
            ).rejects.toThrow('Password must be at least 6 characters long.');
            await expect(
                userService.createUser('testuser', '12345', 'test@test.com')
            ).rejects.toThrow('Password must be at least 6 characters long.');
        });

        test('should handle SequelizeUniqueConstraintError correctly', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.create.mockRejectedValue({
                name: 'SequelizeUniqueConstraintError',
            });

            await expect(
                userService.createUser(
                    'testuser',
                    'password123',
                    'test@test.com'
                )
            ).rejects.toThrow('Username or email already exists.');
        });

        test('should handle duplicate username error', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.create.mockRejectedValue({
                name: 'SequelizeUniqueConstraintError',
                errors: [{ path: 'username' }],
            });

            await expect(
                userService.createUser(
                    'existinguser',
                    'password123',
                    'test@test.com'
                )
            ).rejects.toThrow('Username or email already exists.');
        });

        test('should handle duplicate email error', async () => {
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.create.mockRejectedValue({
                name: 'SequelizeUniqueConstraintError',
                errors: [{ path: 'email' }],
            });

            await expect(
                userService.createUser(
                    'testuser',
                    'password123',
                    'existing@test.com'
                )
            ).rejects.toThrow('Username or email already exists.');
        });

        test('should create a user with default role', async () => {
            const mockUser = {
                id: 1,
                username: 'testuser',
                email: 'test@test.com',
                role: 'user',
            };
            bcrypt.hash.mockResolvedValue('hashedPassword');
            User.create.mockResolvedValue(mockUser);

            const result = await userService.createUser(
                'testuser',
                'password123',
                'test@test.com'
            );

            expect(result).toEqual(mockUser);
            expect(User.create).toHaveBeenCalledWith({
                username: 'testuser',
                password: 'hashedPassword',
                email: 'test@test.com',
                role: 'user',
            });
        });
    });

    describe('getUsers', () => {
        test('should fetch users successfully with pagination', async () => {
            const mockUsers = [
                { id: 1, username: 'user1' },
                { id: 2, username: 'user2' },
            ];
            User.findAll.mockResolvedValue(mockUsers);

            const result = await userService.getUsers(1, 2);

            expect(result).toEqual(mockUsers);
            expect(User.findAll).toHaveBeenCalledWith({ limit: 2, offset: 0 });
        });

        test('should throw an error if page or limit is not positive', async () => {
            await expect(userService.getUsers(0, 10)).rejects.toThrow(
                'Page and limit must be positive integers.'
            );
            await expect(userService.getUsers(1, -5)).rejects.toThrow(
                'Page and limit must be positive integers.'
            );
            await expect(userService.getUsers(-1, 2)).rejects.toThrow(
                'Page and limit must be positive integers.'
            );
        });

        test('should use default values if page or limit are not provided', async () => {
            const mockUsers = [
                { id: 1, username: 'user1' },
                { id: 2, username: 'user2' },
            ];
            User.findAll.mockResolvedValue(mockUsers);

            const result = await userService.getUsers();

            expect(result).toEqual(mockUsers);
            expect(User.findAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
        });

        test('should return an empty list if no users are found', async () => {
            User.findAll.mockResolvedValue([]);

            const result = await userService.getUsers(1, 10);

            expect(result).toEqual([]);
            expect(User.findAll).toHaveBeenCalledWith({ limit: 10, offset: 0 });
        });
    });

    describe('getUserById', () => {
        test('should fetch user by ID successfully', async () => {
            const mockUser = { id: 1, username: 'testuser' };
            User.findByPk.mockResolvedValue(mockUser);

            const result = await userService.getUserById(1);

            expect(result).toEqual(mockUser);
            expect(User.findByPk).toHaveBeenCalledWith(1);
        });

        test('should throw an error if user ID is not provided or invalid', async () => {
            await expect(userService.getUserById()).rejects.toThrow(
                'User ID is required.'
            );
            await expect(userService.getUserById('')).rejects.toThrow(
                'User ID is required.'
            );
            await expect(userService.getUserById(0)).rejects.toThrow(
                'User ID is required'
            );
            await expect(userService.getUserById('abc')).rejects.toThrow(
                'Invalid user ID.'
            );
            await expect(userService.getUserById(-5)).rejects.toThrow(
                'Invalid user ID.'
            );
        });

        test('should handle unexpected errors correctly', async () => {
            User.findByPk.mockRejectedValue(new Error('Database error'));

            await expect(userService.getUserById(1)).rejects.toThrow(
                'Failed to fetch user. Please try again later.'
            );
        });

        test('should throw an error if user ID is undefined', async () => {
            await expect(userService.getUserById(undefined)).rejects.toThrow(
                'User ID is required.'
            );
        });
    });

    describe('getUserByUsername', () => {
        test('should fetch user by username successfully', async () => {
            const mockUser = { id: 1, username: 'testuser' };
            User.findOne.mockResolvedValue(mockUser);

            const result = await userService.getUserByUsername('testuser');

            expect(result).toEqual(mockUser);
            expect(User.findOne).toHaveBeenCalledWith({
                where: { username: 'testuser' },
            });
        });

        test('should throw an error if user not found', async () => {
            User.findOne.mockResolvedValue(null);

            await expect(
                userService.getUserByUsername('nonexistent')
            ).rejects.toThrow(
                'Failed to fetch user by username. Please try again later.'
            );
        });

        test('should handle unexpected errors gracefully', async () => {
            User.findOne.mockRejectedValue(new Error('Unexpected error'));

            await expect(
                userService.getUserByUsername('testuser')
            ).rejects.toThrow(
                'Failed to fetch user by username. Please try again later.'
            );
        });
    });

    describe('updateUser', () => {
        test('should update user username and/or password successfully', async () => {
            const mockUser = { id: 1, username: 'olduser', save: jest.fn() };
            User.findByPk.mockResolvedValue(mockUser);
            bcrypt.hash.mockResolvedValue('newhashedPassword');

            const result = await userService.updateUser(
                1,
                'newuser',
                'newpassword'
            );

            expect(mockUser.username).toEqual('newuser');
            expect(mockUser.password).toEqual('newhashedPassword');
            expect(mockUser.save).toHaveBeenCalled();
        });

        test('should throw an error if no username or password is provided for update', async () => {
            await expect(userService.updateUser(1)).rejects.toThrow(
                'Username or password is required.'
            );
        });

        test('should throw an error if invalid user ID is provided', async () => {
            await expect(
                userService.updateUser('abc', 'newuser')
            ).rejects.toThrow('Invalid user ID.');
        });
    });

    describe('verifyPassword', () => {
        test('should verify password successfully', async () => {
            const mockUser = { password: 'hashedPassword' };
            bcrypt.compare.mockResolvedValue(true);

            const result = await userService.verifyPassword(
                mockUser,
                'password123'
            );

            expect(result).toBe(true);
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'password123',
                'hashedPassword'
            );
        });

        test('should throw an error if user or password is not provided', async () => {
            await expect(
                userService.verifyPassword(null, 'password123')
            ).rejects.toThrow('User and password are required.');
            await expect(
                userService.verifyPassword({ password: 'hashedPassword' }, null)
            ).rejects.toThrow('User and password are required.');
        });

        test('should handle user not found during password verification', async () => {
            const nonExistentUser = null;

            await expect(
                userService.verifyPassword(nonExistentUser, 'password123')
            ).rejects.toThrow('User and password are required.');
        });
    });
});
