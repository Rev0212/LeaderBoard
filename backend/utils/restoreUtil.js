const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const BSON = require('bson');

const backupFilePath = path.join(__dirname, '../backup/backup.bson');

const getUniqueCriteria = (collectionName, doc) => {
    switch (collectionName) {
        case 'admins':
        case 'students':
        case 'teachers':
            return { email: doc.email }; // Use email as unique identifier
        case 'classes':
            return { className: doc.className }; // Use className as unique identifier
        case 'blacklisttokens':
            return { token: doc.token }; // Use token as unique identifier
        case 'events':
            return { eventName: doc.eventName, proofUrl: doc.proofUrl }; // Use eventName + proofUrl as unique identifier
        default:
            return { _id: doc._id }; // Default: Use _id as unique identifier
    }
};

const restoreBackup = async () => {
    // try {
    //     // Check if the backup file exists
    //     if (!fs.existsSync(backupFilePath)) {
    //         console.log('No backup file found. Skipping restore.');
    //         return;
    //     }

    //     // Read and deserialize BSON file
    //     const fileContent = fs.readFileSync(backupFilePath);
    //     const backupData = BSON.deserialize(fileContent);

    //     const db = mongoose.connection.db;

    //     // Process each collection in the backup data
    //     for (const [collectionName, documents] of Object.entries(backupData)) {
    //         if (documents.length > 0) {
    //             const collection = db.collection(collectionName);
    //             for (const doc of documents) {
    //                 // Get unique criteria for the collection
    //                 const uniqueCriteria = getUniqueCriteria(collectionName, doc);

    //                 // Remove _id from the update payload to avoid modifying immutable fields
    //                 const { _id, ...dataWithoutId } = doc;

    //                 // Perform upsert based on unique criteria
    //                 await collection.updateOne(
    //                     uniqueCriteria,
    //                     { $set: dataWithoutId },
    //                     { upsert: true }
    //                 );
    //             }
    //         }
    //     }

    //     console.log('Database restored successfully from BSON backup.');
    // } catch (err) {
    //     console.error('Error restoring database from backup:', err);
    // }
};

module.exports = { restoreBackup };
