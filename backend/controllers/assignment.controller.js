const assignmentService = require('../services/assignment.service');
const csv = require('csv-parser');
const fs = require('fs');

class AssignmentController {
    async assignStudentsToClasses(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const assignments = [];
            await new Promise((resolve, reject) => {
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', (data) => assignments.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            const results = await assignmentService.assignStudentsToClasses(assignments);

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            return res.status(200).json({
                message: 'Student assignments completed',
                ...results
            });
        } catch (error) {
            console.error('Error in assignStudentsToClasses:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async assignFacultyToClasses(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const assignments = [];
            await new Promise((resolve, reject) => {
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', (data) => assignments.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            const results = await assignmentService.assignFacultyToClasses(assignments);

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            return res.status(200).json({
                message: 'Faculty assignments completed',
                ...results
            });
        } catch (error) {
            console.error('Error in assignFacultyToClasses:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }

    async assignAdvisorsToClasses(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const assignments = [];
            await new Promise((resolve, reject) => {
                fs.createReadStream(req.file.path)
                    .pipe(csv())
                    .on('data', (data) => assignments.push(data))
                    .on('end', resolve)
                    .on('error', reject);
            });

            const results = await assignmentService.assignAdvisorsToClasses(assignments);

            // Clean up uploaded file
            fs.unlinkSync(req.file.path);

            return res.status(200).json({
                message: 'Advisor assignments completed',
                ...results
            });
        } catch (error) {
            console.error('Error in assignAdvisorsToClasses:', error);
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
}

module.exports = new AssignmentController();