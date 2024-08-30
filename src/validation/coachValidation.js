'use strict';

const { body, param } = require('express-validator');

const validateCreateCoach = [
    body('coachNumber')
        .notEmpty()
        .withMessage('Coach number is required')
        .isString()
        .withMessage('Coach number must be a string'),
    body('type')
        .notEmpty()
        .withMessage('Coach type is required')
        .isIn(['Sleeper', 'AC', 'General'])
        .withMessage(
            'Invalid coach type. Allowed values: Sleeper, AC, General'
        ),
    body('trainId')
        .notEmpty()
        .withMessage('Train ID is required')
        .isInt()
        .withMessage('Train ID must be an integer'),
];

const validateUpdateCoach = [
    param('id').isInt().withMessage('Invalid ID format'),
    body('coachNumber')
        .optional()
        .isString()
        .withMessage('Coach number must be a string'),
    body('type')
        .optional()
        .isIn(['Sleeper', 'AC', 'General'])
        .withMessage(
            'Invalid coach type. Allowed values: Sleeper, AC, General'
        ),
    body('trainId')
        .optional()
        .isInt()
        .withMessage('Train ID must be an integer'),
];

const validateGetCoachById = [
    param('id').isInt().withMessage('Invalid ID format'),
];

module.exports = {
    validateCreateCoach,
    validateUpdateCoach,
    validateGetCoachById,
};
