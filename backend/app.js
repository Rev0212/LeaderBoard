const dotenv = require('dotenv'); 
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');
const path = require('path');

// CORS configuration
// app.use(cors({
//   origin: true, // Allow all origins in development
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
app.use(cors({
  origin: ["http://10.1.38.189:5173","http://localhost:5173","http://10.1.38.189"], // Or your actual frontend URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// app.use(cors({
//   origin: "http://localhost:5173", // Or your actual frontend URL
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

// app.use('/uploads', express.static('uploads'));

// Ensure this line exists and is using the correct path
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const studentRoutes = require('./routes/student.routes');
app.use('/student', studentRoutes);

const teacherRoutes = require('./routes/teacher.routes');
app.use('/teacher', teacherRoutes);

const adminRoutes = require("./routes/admin.routes")
app.use('/admin',adminRoutes)

const classRoutes = require('./routes/class.routes')
app.use('/class',classRoutes)

const leaderboardRoutes = require('./routes/leaderboard.routes')
app.use('/leaderboard',leaderboardRoutes)

const eventRoutes = require('./routes/event.routes');
app.use('/event', eventRoutes);

const upcomingEventRoutes = require('./routes/upcomingEvent.routes');
app.use('/upcoming-events', upcomingEventRoutes);

const assignmentRoutes = require('./routes/assignment.routes');
app.use('/assignment', assignmentRoutes);

// Import routes
const roleBasedEventReportsRoutes = require('./routes/roleBasedEventReports.routes');

// Mount API routes
app.use('/reports', roleBasedEventReportsRoutes);

connectToDb();

module.exports = app;