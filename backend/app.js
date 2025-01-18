const dotenv = require('dotenv'); 
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');

// CORS configuration
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

app.use('/uploads', express.static('uploads'));

const studentRoutes = require('./routes/student.routes');
app.use('/student', studentRoutes);

const teacherRoutes = require('./routes/teacher.routes');
app.use('/teacher', teacherRoutes);

const eventRoutes = require("./routes/event.routes")
app.use('/event',eventRoutes)

const adminRoutes = require("./routes/admin.routes")
app.use('/admin',adminRoutes)

const classRoutes = require('./routes/class.routes')
app.use('/class',classRoutes)

const leaderboardRoutes = require('./routes/leaderboard.routes')
app.use('/leaderboard',leaderboardRoutes)

const eventReports = require('./routes/eventReports.routes');
app.use('/reports', eventReports);

const upcomingEventRoutes = require('./routes/upcomingEvent.routes');

app.use('/upcoming-events', upcomingEventRoutes);

// console.log('Mounted upcoming events routes at /upcoming-events');

connectToDb();


module.exports = app;