const promoteStudents = require('./promoteStudents');
const archiveGraduatedStudents = require('./archiveGraduatedStudents');

async function endOfYearProcessing() {
    console.log("Starting end-of-year student promotions...");
    await promoteStudents();

    console.log("Archiving graduated students...");
    await archiveGraduatedStudents();

    console.log("End-of-year processing completed!");
}

// Run manually if needed
//endOfYearProcessing();

module.exports = endOfYearProcessing;
