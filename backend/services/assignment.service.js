const studentModel = require('../models/student.model');
const teacherModel = require('../models/teacher.model');
const classModel = require('../models/class.model');
const bcrypt = require('bcrypt');

class AssignmentService {
    async assignStudentsToClasses(assignments) {
        const results = {
            successful: [],
            failed: []
        };

        for (const assign of assignments) {
            try {
                const student = await studentModel.findOne({ registerNo: assign.studentRegNo });
                const classData = await classModel.findOne({ className: assign.className });

                if (!student || !classData) {
                    results.failed.push({
                        data: assign,
                        error: !student ? 'Student not found' : 'Class not found'
                    });
                    continue;
                }

                // Update student's class
                student.currentClass = {
                    year: classData.year,
                    section: classData.section,
                    ref: classData._id
                };
                await student.save();

                // Add student to class
                classData.students.addToSet(student._id);
                await classData.save();

                results.successful.push({
                    student: student.registerNo,
                    class: classData.className
                });
            } catch (error) {
                results.failed.push({
                    data: assign,
                    error: error.message
                });
            }
        }
        return results;
    }

    async assignFacultyToClasses(assignments) {
        const results = {
            successful: [],
            failed: []
        };

        for (const assign of assignments) {
            try {
                // Find faculty and class
                const faculty = await teacherModel.findOne({ 
                    registerNo: assign.facultyRegNo,
                    role: 'Faculty'
                });
                const classData = await classModel.findOne({ className: assign.className });

                if (!faculty || !classData) {
                    results.failed.push({
                        assignment: assign,
                        error: !faculty ? 'Faculty not found' : 'Class not found'
                    });
                    continue;
                }

                // Update class with faculty
                if (!classData.facultyAssigned.includes(faculty._id)) {
                    classData.facultyAssigned.push(faculty._id);
                    await classData.save();
                }

                // Update faculty with class
                if (!faculty.classes.includes(classData._id)) {
                    faculty.classes.push(classData._id);
                    await faculty.save();
                }

                results.successful.push({
                    faculty: faculty.registerNo,
                    class: classData.className
                });
            } catch (error) {
                console.error('Error assigning faculty:', error);
                results.failed.push({
                    assignment: assign,
                    error: error.message
                });
            }
        }
        return results;
    }

    async assignAdvisorsToClasses(assignments) {
        const results = {
            successful: [],
            failed: []
        };

        for (const assign of assignments) {
            try {
                // Find advisor and class
                const advisor = await teacherModel.findOne({ 
                    registerNo: assign.advisorRegNo,
                    role: 'Academic Advisor'
                });
                const classData = await classModel.findOne({ className: assign.className });

                if (!advisor || !classData) {
                    results.failed.push({
                        assignment: assign,
                        error: !advisor ? 'Academic Advisor not found' : 'Class not found'
                    });
                    continue;
                }

                // Update class with advisor
                if (!classData.academicAdvisors.includes(advisor._id)) {
                    classData.academicAdvisors.push(advisor._id);
                    await classData.save();
                }

                // Update advisor with class
                if (!advisor.classes.includes(classData._id)) {
                    advisor.classes.push(classData._id);
                    await advisor.save();
                }

                results.successful.push({
                    advisor: advisor.registerNo,
                    class: classData.className
                });
            } catch (error) {
                console.error('Error assigning advisor:', error);
                results.failed.push({
                    assignment: assign,
                    error: error.message
                });
            }
        }
        return results;
    }
}

module.exports = new AssignmentService();