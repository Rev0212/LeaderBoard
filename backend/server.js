const http = require('http');
const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { createBackup } = require('./utils/backupUtil');
const { restoreBackup } = require('./utils/restoreUtil');

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;

const server = http.createServer(app);

(async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.DB_CONNECT, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('Connected to MongoDB.');

        // Ensure database connection is ready before restoring backup
        mongoose.connection.once('open', async () => {
            await restoreBackup(); // Restore data from backup
            server.listen(port, () => {
                console.log(`Server is running at port ${port}`);
            });
        });
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
    }
})();

// Gracefully handle shutdown
process.on('SIGINT', async () => {
    console.log('SIGINT received. Creating backup before shutdown...');
    await createBackup(); // Backup data on shutdown
    server.close(() => {
        console.log('Server shutting down gracefully.');
        process.exit(0);
    });
});

process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Creating backup before shutdown...');
    // await createBackup(); // Backup data on shutdown
    server.close(() => {
        console.log('Server shutting down gracefully.');
        process.exit(0);
    });
});
