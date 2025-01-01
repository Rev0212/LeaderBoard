const csv = require('csv-parser');
const fs = require('fs');
const { generateRandomPassword } = require('../utils/passwordGenerator');
const EmailService = require('./mail.services'); 
const studentService = require('./student.service');
const studentModel = require('../models/student.model');
const teacherModel = require('../models/teacher.model');

class StudentBulkService {
    constructor() {
        this.emailService = new EmailService();  // Ensure this is correctly instantiated
    }

    async processCSV(filePath) {
        const results = [];
        const errors = [];

        return new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (data) => results.push(data))
                .on('end', async () => {
                    try {
                        const processedResults = await this.processStudents(results);
                        resolve(processedResults);
                    } catch (error) {
                        reject(error);
                    }
                });
        });
    }

    async processStudents(students) {
        const results = {
            successful: [],
            failed: []
        };

        for (const student of students) {
            try {
                const password = generateRandomPassword();
                const hashedPassword = await teacherModel.hashedPassword(password);

                const newStudent = await studentService.createStudent({
                    name: student.name,
                    email: student.email,
                    registerNo: student.registerNo,
                    password: hashedPassword
                });

                //email
                await this.emailService.sendPasswordEmail(newStudent.email,newStudent.name,password);

                results.successful.push({
                    name: student.name,
                    email: student.email,
                    registerNo: student.registerNo,
                    password: password  // conform ana aprm remove pannu
                });
            } catch (error) {
                results.failed.push({
                    student,
                    error: error.message
                });
            }
        }

        return results;
    }
}

module.exports = StudentBulkService;
