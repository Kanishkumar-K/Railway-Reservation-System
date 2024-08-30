'use strict';

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME;
const DB_PASSWORD = process.env.DB_PASSWORD;
const BACKUP_DIR = path.join(__dirname, './backups');

if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

function createBackup() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);

    const command = `"C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqldump.exe" -u root -p${DB_PASSWORD} ${DB_NAME} users trains > ${backupFile}`;

    console.log(`Running command: ${command}`);

    exec(command, (error, stderr) => {
        if (error) {
            console.error(`Error creating backup: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`Backup created successfully at ${backupFile}`);
    });
}

createBackup();
