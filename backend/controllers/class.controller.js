const teacherModel = require('../models/teacher.model');
const studentModel = require('../models/student.model')
const classService = require('../services/class.service');
const fs = require('fs');
const csv = require('csv-parser');
const createClass = async (req, res) => {
    const { className, teacherId } = req.body;

    // Validate input
    if (!className || !teacherId) {
        return res.status(400).json({ error: "className and teacherId are required." });
    }

    try {
        // Create a new class
        const newClass = await classService.createClass(className, teacherId);

        // Find the teacher by ID
        const teacher = await teacherModel.findById(teacherId);

        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found." });
        }

        // Ensure `classes` is initialized as an array
        if (!Array.isArray(teacher.classes)) {
            teacher.classes = [];
        }

        // Add the class ID to the teacher's classes
        teacher.classes.push(newClass.id);
        await teacher.save();

        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
        console.error("Error creating class:", error.message);
        res.status(500).json({ error: "An error occurred while creating the class." });
    }
};

const addStudentsToClass = async (req, res) => {
    const { classId, studentIds } = req.body;

    if (!classId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ error: "classId and an array of studentIds are required." });
    }

    try {
        // Update the class with the new students
        const updatedClass = await classService.addStudentsToClass(classId, studentIds);

        // Update the `class` field for all students in a single query
        const result = await studentModel.updateMany(
            { _id: { $in: studentIds } }, // Match students by IDs
            { $set: { class: classId } } // Set the `class` field
        );

        // Check if any student IDs were not updated (optional validation step)
        if (result.matchedCount !== studentIds.length) {
            console.warn(
                `${studentIds.length - result.matchedCount} students were not found during update.`
            );
        }

        res.status(200).json({
            message: 'Students added successfully and updated in student models',
            class: updatedClass,
            modifiedCount: result.modifiedCount, // Number of students updated
        });
    } catch (error) {
        console.error("Error adding students to class:", error.message);
        res.status(500).json({ error: "An error occurred while adding students to the class." });
    }
};


const changeClassTeacher = async (req, res) => {
    const { classId, teacherId } = req.body;

    try {
        const updatedClass = await classService.changeClassTeacher(classId, teacherId);
        res.status(200).json({ message: 'Class teacher updated successfully', class: updatedClass });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const getClassDetails = async (req, res) => {
    const { classId } = req.params;
    

    try {
        const classDetails = await classService.getClassDetails(classId);
        res.status(200).json({ class: classDetails });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

const createClassesInBulk = async (req, res) => {
    const csvFilePath = req.file.path;
  
    try {
      const result = await classService.createClassesInBulk(csvFilePath);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating classes in bulk:", error.message);
      res.status(500).json({ error: "An error occurred while creating classes in bulk." });
    } finally {
      fs.unlinkSync(csvFilePath); // Remove the uploaded file after processing
    }
  };

const addStudentsToClassInBulk = async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: "CSV file is required." });
  }

  const csvFilePath = req.file.path;

  try {
    const result = await classService.addStudentsToClassInBulk(csvFilePath);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error adding students to class in bulk:", error);
    res.status(500).json({
      error: "An error occurred while adding students to the class in bulk.",
    });
  } finally {
    fs.unlink(csvFilePath, (err) => {
      if (err) {
        console.error("Error deleting the uploaded CSV file:", err.message);
      }
    });
  }
};

module.exports = {
    createClass,
    addStudentsToClass,
    changeClassTeacher,
    getClassDetails,
    createClassesInBulk,
    addStudentsToClassInBulk,
    
};
