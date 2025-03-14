const Student = require('../models/student.model');
const Class = require('../models/class.model')

async function promoteStudents() {
    try {
        const students = await Student.find({ isGraduated: false }).populate('class');

        for (let student of students) {
            const graduationYear = student.course === 'MTech' ? 5 : 4;

            if (student.year < graduationYear) {
                // Promote student to next year
                student.year += 1;

                // Assign student to the next year's class with the same className
                const newClass = await Class.findOne({ className: student.class.className, year: student.year });
                if (newClass) {
                    student.class = newClass._id;
                }
            } else {
                // Graduate and archive student
                student.isGraduated = true;
                student.isArchived = true;
                student.class = null; // Remove class association
            }

            await student.save();
        }

        console.log("Students promoted successfully.");
    } catch (error) {
        console.error("Error promoting students:", error);
    }
}

module.exports = promoteStudents;
