
const teacherModel = require('../models/teacher.model');
const studentModel = require('../models/student.model')
const classService = require('../services/class.service');
const fs = require('fs');
const csv = require('csv-parser');
const pLimit = require('p-limit');

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

        // Send the response after all operations succeed
        res.status(201).json({ message: 'Class created successfully', class: newClass });
    } catch (error) {
        console.error("Error creating class:", error.message);
        res.status(500).json({ error: "An error occurred while creating the class." });
    }
};

const createClassesFromCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "Please upload a CSV file." });
    }

    const results = [];
    const errors = [];
    const limit = pLimit(10); // Limit concurrency to 10
    const rows = [];

    try {
        // Read and parse the CSV file
        await new Promise((resolve, reject) => {
            fs.createReadStream(req.file.path)
                .pipe(csv())
                .on('data', (row) => rows.push(row))
                .on('end', resolve)
                .on('error', reject);
        });

        // Validate CSV rows and fetch all unique teacher register numbers
        const uniqueTeacherRegisterNos = Array.from(
            new Set(rows.map((row) => row.teacherRegisterNo))
        );

        // Fetch all teachers in a single query
        const teachers = await teacherModel.find({
            registerNo: { $in: uniqueTeacherRegisterNos },
        }).lean();

        const teacherMap = new Map(
            teachers.map((teacher) => [teacher.registerNo, teacher])
        );

        // Process rows with controlled concurrency
        await Promise.all(
            rows.map((row) =>
                limit(async () => {
                    try {
                        // Validate row data
                        if (!row.className || !row.teacherRegisterNo) {
                            throw new Error(`Invalid data in row: ${JSON.stringify(row)}`);
                        }

                        // Get teacher by register number
                        const teacher = teacherMap.get(row.teacherRegisterNo);
                        if (!teacher) {
                            throw new Error(
                                `Teacher not found with registration number: ${row.teacherRegisterNo}`
                            );
                        }

                        // Create class
                        const newClass = await classService.createClass(
                            row.className,
                            teacher._id
                        );

                        // Update teacher's classes array
                        teacher.classes = teacher.classes || [];
                        teacher.classes.push(newClass._id);
                        await teacherModel.updateOne(
                            { _id: teacher._id },
                            { $set: { classes: teacher.classes } }
                        );

                        results.push({
                            className: row.className,
                            teacherRegisterNo: row.teacherRegisterNo,
                            classId: newClass._id,
                        });
                    } catch (error) {
                        errors.push(
                            `Error processing row ${JSON.stringify(row)}: ${error.message}`
                        );
                    }
                })
            )
        );

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.status(200).json({
            message: 'CSV processing completed',
            successCount: results.length,
            errorCount: errors.length,
            results,
            errors,
        });
    } catch (error) {
        // Clean up uploaded file in case of error
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        console.error("Error processing CSV:", error.message);
        res.status(500).json({ error: "An error occurred while processing the CSV file." });
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

module.exports = {
    createClass,
    addStudentsToClass,
    changeClassTeacher,
    getClassDetails,
    createClassesFromCSV,
};
