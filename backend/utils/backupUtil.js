const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const BSON = require('bson');

const backupDir = path.join(__dirname, '../backup');
const backupFilePath = path.join(backupDir, 'backup.bson');

const createBackup = async () => {
    // try {
    //     if (!fs.existsSync(backupDir)) {
    //         fs.mkdirSync(backupDir); // Ensure backup directory exists
    //     }

    //     const db = mongoose.connection.db;

    //     const collections = await db.listCollections().toArray();
    //     const backupData = {};

    //     for (const collection of collections) {
    //         const collectionName = collection.name;
    //         const data = await db.collection(collectionName).find().toArray();
    //         backupData[collectionName] = data;
    //     }

    //     // Write backup data to BSON file
    //     fs.writeFileSync(backupFilePath, BSON.serialize(backupData));
    //     console.log('Database backup created successfully in BSON format.');
    // } catch (err) {
    //     console.error('Error creating database backup:', err);
    // }
};

module.exports = { createBackup };
