'use strict';

const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/user');
const logger = require('../config/winston-config');
const JWT_SECRET = process.env.SECRET_KEY;

const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};

passport.use(
    new JwtStrategy(options, async (jwtPayload, done) => {
        try {
            const user = await User.findByPk(jwtPayload.id);
            if (user) {
                logger.info(`User authenticated: ${user.email}`);
                return done(null, user);
            } else {
                logger.warn(
                    `User authentication failed: Invalid token for user ID ${jwtPayload.id}`
                );
                return done(null, false);
            }
        } catch (error) {
            logger.error('Error during JWT authentication: ', error);
            return done(error, false);
        }
    })
);

const authenticateJwt = passport.authenticate('jwt', { session: false });

module.exports = authenticateJwt;
