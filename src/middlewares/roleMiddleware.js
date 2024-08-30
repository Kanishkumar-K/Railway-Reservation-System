'use strict';

const logger = require('../config/winston-config');

const authorizeRole = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            logger.warn(
                `Access denied for user ${req.user.email} with role ${req.user.role}`
            );
            return res.status(403).json({ error: 'Access denied' });
        }
        logger.info(
            `Access granted for user ${req.user.email} with role ${req.user.role}`
        );
        next();
    };
};

module.exports = { authorizeRole };
