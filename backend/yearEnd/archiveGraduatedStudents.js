const Student = require('../models/student.model');
const Class = require('../models/class.model')


async function archiveGraduatedStudents() {
    try {
        // Find students who have reached their graduation year but are not archived yet
        const students = await Student.find({ isGraduated: true, isArchived: false });

        for (let student of students) {
            student.isArchived = true;
            student.class = null; // Remove class association
            await student.save();
            console.log(`Student ${student.name} (Reg No: ${student.registerNo}) has been archived.`);
        }
    } catch (error) {
        console.error("Error archiving graduated students:", error);
    }
}

module.exports = archiveGraduatedStudents;
