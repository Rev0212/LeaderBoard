const dotenv = require('dotenv'); 
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const mongoose = require('mongoose');
const path = require('path');

// CORS configuration
app.use(cors({
  origin: ["http://10.1.38.23:5173","http://localhost:5173","http://10.1.38.23"], // Or your actual frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

// Ensure this line exists and is using the correct path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const studentRoutes = require('./routes/student.routes');
const teacherRoutes = require('./routes/teacher.routes');
const adminRoutes = require("./routes/admin.routes");
const classRoutes = require('./routes/class.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const eventRoutes = require('./routes/event.routes');
const upcomingEventRoutes = require('./routes/upcomingEvent.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const roleBasedEventReportsRoutes = require('./routes/roleBasedEventReports.routes');
const feedbackRoutes = require('./routes/feedback.routes');

// Mount routes
app.use('/student', studentRoutes);
app.use('/teacher', teacherRoutes);
app.use('/admin', adminRoutes);
app.use('/class', classRoutes);
app.use('/leaderboard', leaderboardRoutes);
app.use('/event', eventRoutes);
app.use('/upcoming-events', upcomingEventRoutes);
app.use('/assignment', assignmentRoutes);
app.use('/reports', roleBasedEventReportsRoutes);
app.use('/feedback', feedbackRoutes);

app.get('/', (req, res) => {
    res.send('Server is running!');
});

module.exports = app;
