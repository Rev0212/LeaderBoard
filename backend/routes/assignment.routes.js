const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const assignmentController = require('../controllers/assignment.controller');
const authMiddleware = require('../middlewares/auth.middlewares');

// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, `assignment-${Date.now()}.csv`);
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (path.extname(file.originalname) !== '.csv') {
            return cb(new Error('Only .csv files are allowed'));
        }
        cb(null, true);
    }
});

// Assignment routes (no auth required)
router.post('/students-to-classes', 
    upload.single('file'), 
    assignmentController.assignStudentsToClasses
);

router.post('/faculty-to-classes', 
    upload.single('file'), 
    assignmentController.assignFacultyToClasses
);

router.post('/advisors-to-classes', 
    upload.single('file'), 
    assignmentController.assignAdvisorsToClasses
);

module.exports = router;