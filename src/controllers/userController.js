'use strict';

const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const {
    validateCreateUser,
    validateLoginUser,
} = require('../validation/userValidation');

const JWT_SECRET = process.env.SECRET_KEY;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

const createUser = [
    validateCreateUser,
    async (req, res) => {
        try {
            const { username, email, password, role, age } = req.body;
            const user = await userService.createUser(
                username,
                password,
                email,
                role,
                age
            );
            res.status(201).json(user);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
];

const getUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const users = await userService.getUsers(
            parseInt(page),
            parseInt(limit)
        );
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(404).json({ error: error.message });
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

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required.' });
        }
        if (typeof username !== 'string' || username.trim().length === 0) {
            return res.status(400).json({ error: 'Invalid username.' });
        }

        const updatedUser = await userService.updateUser(id, username);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const loginUser = [
    validateLoginUser,
    async (req, res) => {
        try {
            const { username, password } = req.body;
            const user = await userService.getUserByUsername(username);

            if (!user) {
                return res
                    .status(401)
                    .json({ error: 'Username is wrong. Try again' });
            }

            const isPasswordValid = await userService.verifyPassword(
                user,
                password
            );
            if (!isPasswordValid) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
                expiresIn: '1h',
            });

            const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
                expiresIn: '7d',
            });

            return res.status(200).json({
                message: 'Login successful',
                accessToken,
                refreshToken,
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
];

const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({ error: 'Refresh token is required' });
    }

    try {
        const payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET);

        const newAccessToken = jwt.sign({ id: payload.id }, JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({
            message: 'Token refreshed successfully',
            accessToken: newAccessToken,
        });
    } catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
};

const logoutUser = (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
};

module.exports = {
    createUser,
    getUsers,
    getUserById,
    getUserByUsername,
    loginUser,
    logoutUser,
    updateUser,
    refreshToken,
};
