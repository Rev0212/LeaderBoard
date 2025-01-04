const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service:'gmail',
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure:'false',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    async sendPasswordEmail(email, name, password) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Your Teacher Account Credentials',
            html: `
                <h2>Welcome ${name}!</h2>
                <p>Your teacher account has been created successfully.</p>
                <p>Here are your login credentials:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p>Please change your password after your first login.</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }

    async sendStudentEmail(email, name, password) {
        const mailOptions = {
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'Your Student Account Credentials',
            html: `
                <h2>Welcome ${name}!</h2>
                <p>Your student account has been created successfully.</p>
                <p>Here are your login credentials:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p>Please change your password after your first login.</p>
            `
        };

        return this.transporter.sendMail(mailOptions);
    }
}

module.exports = EmailService