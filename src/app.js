'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const logger = require('./config/winston-config');
const helmet = require('helmet');

// Routes
const userRoutes = require('./routes/userRoutes');
const trainRoutes = require('./routes/trainRoutes');
const seatRoutes = require('./routes/seatRoutes');
const coachRoutes = require('./routes/coachRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
    })
);

app.use(passport.initialize());

// API Endpoints
app.use('/api/users', userRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/coaches', coachRoutes);
app.use('/api/seats', seatRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send('<h2>Welcome to the Railway Reservation System</h2>');
});

// Database connection and syncing models
sequelize
    .authenticate()
    .then(() => {
        logger.info('Database connection has been established successfully.');
        return sequelize.sync({ force: false });
    })
    .then(() => {
        logger.info('Database synced successfully');
        app.listen(port, () => {
            logger.info(`Server running at http://localhost:${port}`);
        });
    })
    .catch((error) => {
        logger.error(
            'Error establishing database connection or syncing models:',
            error
        );
    });
