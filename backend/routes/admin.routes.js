const express = require('express');
const router = express.Router();
const { body } = require("express-validator");
const adminController = require('../controllers/admin.controller');
const { authAdmin, requireSuperAdmin } = require('../middlewares/auth.middlewares');
const adminModel = require('../models/admin.model');
const classController = require('../controllers/class.controller');
const eventController = require('../controllers/event.controller');
const Feedback = require('../models/feedback.model');
const impactAnalysisController = require('../controllers/impactAnalysis.controller');
const FormFieldConfig = require('../models/formFieldConfig.model'); // Assuming this model exists

// Password validation regex pattern
const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Registration route with validation
router.post('/register', [
    body('email')
        .isEmail()
        .withMessage('Invalid Email')
        .normalizeEmail(),
    body('name')
        .trim()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),
    body('password')
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
        .matches(passwordRegex)
        .withMessage('Password must contain at least one uppercase letter, one number, and one special character (@$!%*?&)')
],
adminController.registeradmin);

// Login route with validation
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Invalid Email')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters long")
],
adminController.loginadmin);

// Profile route with authentication middleware
router.get('/profile', authAdmin, adminController.getAdminProfile);

// Update dashboard routes - make sure there are no references to missing controller functions
router.get('/dashboard', authAdmin, (req, res) => {
    res.json({ message: 'Dashboard data endpoint - implementation pending' });
});

// Logout route (commented out but available if needed)
// router.get('/logout', authMiddleware.authAdmin, adminController.logoutadmin);

// DEBUG ONLY - Remove in production
if (process.env.NODE_ENV !== 'production') {
    router.get('/debug/admins', async (req, res) => {
        try {
            const admins = await adminModel.find({}).select('+password +rawPassword');
            console.log('All admins:', admins);
            res.json(admins.map(admin => ({
                email: admin.email,
                hashedPasswordLength: admin.password?.length,
                rawPasswordLength: admin.rawPassword?.length,
                hasPassword: !!admin.password,
                hasRawPassword: !!admin.rawPassword
            })));
        } catch (error) {
            console.error('Debug route error:', error);
            res.status(500).json({ error: 'Debug route error' });
        }
    });
}

router.get('/feedback', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedbacks' });
    }
});

router.post('/points/impact-analysis', requireSuperAdmin, impactAnalysisController.analyzePointsChange);

router.put('/config/form-fields/:category', authAdmin, async (req, res) => {
    try {
        const { category } = req.params;
        const {
            requiredFields,
            optionalFields,
            conditionalFields,
            proofConfig,
            customQuestions
        } = req.body;

        // Validate proofConfig
        const validatedProofConfig = {
            requireCertificateImage: Boolean(proofConfig?.requireCertificateImage),
            requirePdfProof: Boolean(proofConfig?.requirePdfProof),
            maxCertificateSize: Number(proofConfig?.maxCertificateSize) || 5,
            maxPdfSize: Number(proofConfig?.maxPdfSize) || 10,
            allowMultipleCertificates: Boolean(proofConfig?.allowMultipleCertificates)
        };

        // Validate customQuestions
        const validatedCustomQuestions = (customQuestions || []).map(q => ({
            id: q.id,
            text: q.text,
            type: q.type,
            required: Boolean(q.required),
            options: Array.isArray(q.options) ? q.options.filter(opt => opt.trim() !== '') : []
        }));

        const formFieldConfig = await FormFieldConfig.findOneAndUpdate(
            { category },
            {
                requiredFields,
                optionalFields,
                conditionalFields,
                proofConfig: validatedProofConfig,
                customQuestions: validatedCustomQuestions
            },
            { new: true, upsert: true }
        );

        res.json({
            success: true,
            data: formFieldConfig,
            message: 'Configuration updated successfully'
        });
    } catch (error) {
        console.error('Error updating form fields:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update form fields configuration'
        });
    }
});

module.exports = router;