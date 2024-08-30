'use strict';

const express = require('express');
const router = express.Router();
const coachController = require('../controllers/coachController');
const authenticateJwt = require('../middlewares/authMiddleware');
const { authorizeRole } = require('../middlewares/roleMiddleware');

const {
    validateCreateCoach,
    validateUpdateCoach,
    validateGetCoachById,
} = require('../validation/coachValidation');

// Create coach
router.post(
    '/',
    authenticateJwt,
    authorizeRole(['admin']),
    validateCreateCoach,
    coachController.createCoach
);

// Get all coaches
router.get('/', coachController.getAllCoaches);

// Get coach by id
router.get('/train/:trainId', coachController.getCoachesByTrainId);

// Update coach
router.put(
    '/:id',
    authenticateJwt,
    authorizeRole(['admin']),
    validateUpdateCoach,
    coachController.updateCoach
);

// Delete coach
router.delete(
    '/:id',
    authenticateJwt,
    authorizeRole(['admin']),
    validateGetCoachById,
    coachController.deleteCoach
);

module.exports = router;
