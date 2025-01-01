const dotenv = require('dotenv'); 
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectToDb = require('./db/db');

app.get('/', (req, res) => {
    res.send('Server is running!');
});

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

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


connectToDb();


module.exports = app;