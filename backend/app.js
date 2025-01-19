const dotenv = require('dotenv'); 
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');

// CORS configuration with specific origin and credentials
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
    res.send('Server is running!');
});

// Cookie parser middleware
app.use(cookieParser());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

// Route imports and mounting
const studentRoutes = require('./routes/student.routes');
app.use('/student', studentRoutes);

const teacherRoutes = require('./routes/teacher.routes');
app.use('/teacher', teacherRoutes);

const eventRoutes = require("./routes/event.routes");
app.use('/event', eventRoutes);

const adminRoutes = require("./routes/admin.routes");
app.use('/admin', adminRoutes);

const classRoutes = require('./routes/class.routes');
app.use('/class', classRoutes);

const leaderboardRoutes = require('./routes/leaderboard.routes');
app.use('/leaderboard', leaderboardRoutes);

const eventReports = require('./routes/eventReports.routes');
app.use('/reports', eventReports);

const upcomingEventRoutes = require('./routes/upcomingEvent.routes');
app.use('/upcoming-events', upcomingEventRoutes);

const academicAdvisorRoutes = require('./routes/academicAdvisor.routes');
app.use('/api/advisor', academicAdvisorRoutes);

connectToDb();

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something broke!' });
});

module.exports = app;