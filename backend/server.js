const http = require('http');
const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running at port ${port}`);
});

// Gracefully handle shutdown
process.on('SIGINT', () => {
    server.close(() => {
        console.log('Server shutting down gracefully.');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Server shutting down gracefully.');
        process.exit(0);
    });
});
