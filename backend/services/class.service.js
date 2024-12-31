const mongoose = require('mongoose');
const classModel = require('../models/class.model');
const teacherModel = require('../models/teacher.model');
const studentModel = require('../models/student.model');

// Utility function to validate ObjectIDs
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Utility function to find a teacher by ID
const findTeacherById = async (teacherId) => {
    if (!isValidObjectId(teacherId)) {
        throw new Error('Invalid Teacher ID');
    }
    const teacher = await teacherModel.findById(teacherId);
    if (!teacher) {
        throw new Error(`Teacher with ID ${teacherId} not found`);
    }
    return teacher;
};

// Utility function to find a class by ID
const findClassById = async (classId) => {
    if (!isValidObjectId(classId)) {
        throw new Error('Invalid Class ID');
    }
    const classDetails = await classModel.findById(classId);
    if (!classDetails) {
        throw new Error(`Class with ID ${classId} not found`);
    }
    return classDetails;
};

// Create a new class
const createClass = async (className, teacherId) => {
    await findTeacherById(teacherId);

    const newClass = new classModel({
        className,
        teacher: teacherId,
    });

    return await newClass.save();
};

// Add students to a class
const addStudentsToClass = async (classId, studentIds) => {
    const classDetails = await findClassById(classId);

    // Validate that all student IDs are valid and exist
    const validStudents = await studentModel.find({ _id: { $in: studentIds } });
    if (validStudents.length !== studentIds.length) {
        throw new Error('One or more students not found');
    }

    // Use $addToSet to avoid duplicates
    const updatedClass = await classModel.findByIdAndUpdate(
        classId,
        { $addToSet: { students: { $each: studentIds } } },
        { new: true } // Return the updated document
    );

    return updatedClass;
};

// Change the teacher of a class
const changeClassTeacher = async (classId, teacherId) => {
    const classDetails = await findClassById(classId);
    await findTeacherById(teacherId);

    classDetails.teacher = teacherId;
    return await classDetails.save();
};

// Get class details with populated teacher and student information
const getClassDetails = async (classId) => {
    const classDetails = await classModel.findById(classId)
    .populate('teacher', 'name email')
    .populate('students', 'name email');
          
    
    if (!classDetails) {
        throw new Error(`Class with ID ${classId} not found`);
    }

    return classDetails;
};

module.exports = {
    createClass,
    addStudentsToClass,
    changeClassTeacher,
    getClassDetails,
};
