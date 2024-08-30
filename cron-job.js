'use strict';

const cron = require('node-cron');
const { createBackup } = require('./backup');

cron.schedule('0 0 1-31 * *', () => {
    console.log('Starting backup...');
    createBackup();
});
