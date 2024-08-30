'use strict';

const bcrypt = require('bcrypt');
const User = require('../models/user');
const logger = require('../config/winston-config');

const saltRounds = 10;

const createUser = async (username, password, email, role = 'user', age) => {
    if (!username || !password || !email) {
        const error = 'Username, password, and email are required.';
        logger.error(error);
        throw new Error(error);
    }
    if (
        typeof username !== 'string' ||
        typeof password !== 'string' ||
        typeof email !== 'string'
    ) {
        const error = 'Username, password, and email must be strings.';
        logger.error(error);
        throw new Error(error);
    }
    if (password.length < 6) {
        const error = 'Password must be at least 6 characters long.';
        logger.error(error);
        throw new Error(error);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        const error = 'Invalid email address.';
        logger.error(error);
        throw new Error(error);
    }

    if (age !== undefined) {
        if (typeof age !== 'number' || age < 0) {
            const error = 'Age must be a positive number if provided.';
            logger.error(error);
            throw new Error(error);
        }
    }

    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const user = await User.create({
            username,
            password: hashedPassword,
            email,
            role,
            ...(age !== undefined && { age }),
        });
        return user;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const message = 'Username or email already exists.';
            logger.error(message);
            throw new Error(message);
        }
        logger.error('Failed to create user: ' + error.message);
        throw new Error('Failed to create user. Please try again later.');
    }
};

const getUsers = async (page = 1, limit = 10) => {
    if (page <= 0 || limit <= 0) {
        const error = 'Page and limit must be positive integers.';
        logger.error(error);
        throw new Error(error);
    }

    try {
        const offset = (page - 1) * limit;
        const users = await User.findAll({ limit, offset });
        return users;
    } catch (error) {
        logger.error('Failed to fetch users: ' + error.message);
        throw new Error('Failed to fetch users. Please try again later.');
    }
};

const getUserById = async (id) => {
    if (!id) {
        const error = 'User ID is required.';
        logger.error(error);
        throw new Error(error);
    }
    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
        const error = 'Invalid user ID.';
        logger.error(error);
        throw new Error(error);
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            const error = 'User not found.';
            logger.error(error);
            throw new Error(error);
        }
        return user;
    } catch (error) {
        logger.error('Failed to fetch user: ' + error.message);
        throw new Error('Failed to fetch user. Please try again later.');
    }
};

const getUserByUsername = async (username) => {
    if (!username) {
        const error = 'Username is required.';
        logger.error(error);
        throw new Error(error);
    }

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            const error = 'User not found.';
            logger.error(error);
            throw new Error(error);
        }
        return user;
    } catch (error) {
        logger.error('Failed to fetch user by username: ' + error.message);
        throw new Error(
            'Failed to fetch user by username. Please try again later.'
        );
    }
};

const updateUser = async (id, username, password) => {
    if (!id) {
        const error = 'User ID is required.';
        logger.error(error);
        throw new Error(error);
    }
    if (!username && !password) {
        const error = 'Username or password is required.';
        logger.error(error);
        throw new Error(error);
    }

    if (username) {
        if (typeof username !== 'string') {
            const error = 'Username must be a string.';
            logger.error(error);
            throw new Error(error);
        }
        if (username.trim().length === 0) {
            const error = 'Username cannot be empty.';
            logger.error(error);
            throw new Error(error);
        }
    }

    if (password) {
        if (typeof password !== 'string') {
            const error = 'Password must be a string.';
            logger.error(error);
            throw new Error(error);
        }
        if (password.length < 6) {
            const error = 'Password must be at least 6 characters long.';
            logger.error(error);
            throw new Error(error);
        }
    }

    const userId = parseInt(id, 10);
    if (isNaN(userId) || userId <= 0) {
        const error = 'Invalid user ID.';
        logger.error(error);
        throw new Error(error);
    }

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            const error = 'User not found.';
            logger.error(error);
            throw new Error(error);
        }

        if (username) {
            user.username = username.trim();
        }

        if (password) {
            user.password = await bcrypt.hash(password, saltRounds);
        }

        await user.save();
        return user;
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            const message = 'Username already exists.';
            logger.error(message);
            throw new Error(message);
        }
        logger.error('Failed to update user: ' + error.message);
        throw new Error('Failed to update user. Please try again later.');
    }
};

const verifyPassword = async (user, password) => {
    if (!user || !password) {
        const error = 'User and password are required.';
        logger.error(error);
        throw new Error(error);
    }

    try {
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const error = 'Incorrect password.';
            logger.error(error);
            throw new Error(error);
        }
        return isMatch;
    } catch (error) {
        logger.error('Failed to validate password: ' + error.message);
        throw new Error('Failed to validate password. Please try again later.');
    }
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    getUserByUsername,
    updateUser,
    verifyPassword,
};
