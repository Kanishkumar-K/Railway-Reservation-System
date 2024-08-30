'use strict';

const express = require('express');
const userController = require('../controllers/userController');
const authenticateJwt = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/roleMiddleware');

const router = express.Router();

// Create user
router.post('/', userController.createUser);

// Login user
router.post('/login', userController.loginUser);

// Get all users
router.get(
    '/',
    authenticateJwt,
    authorizeRole(['admin']),
    userController.getUsers
);

// Get user by id
router.get(
    '/:id',
    authenticateJwt,
    authorizeRole(['admin', 'user']),
    userController.getUserById
);

// Get user by username
router.get(
    '/:username',
    authenticateJwt,
    authorizeRole(['admin']),
    userController.getUserByUsername
);

// Update user
router.put(
    '/:id',
    authenticateJwt,
    authorizeRole(['admin', 'user']),
    userController.updateUser
);

// Logout user
router.post('/logout', authenticateJwt, userController.logoutUser);

router.post('/refresh-token', userController.refreshToken);

module.exports = router;
