const cron = require('node-cron');
const endOfYearProcessing = require('./endOfYearProcessing');

const now = new Date();
const minutes = (now.getMinutes() + 0) % 60; // Run 5 minutes from now
const hours = now.getHours(); // Keep the current hour

cron.schedule(`${minutes} ${hours} * * *`, () => {
    console.log("Running automatic student promotion and archiving...");
    endOfYearProcessing();
});

console.log(`🚀 Cron job scheduled to run at ${hours}:${minutes} today.`);
