const { Router } = require('express');

const router = Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { catchAsyncErrors } = require('../middleware/errorHandler');

router.get('/preferences', verifyToken, catchAsyncErrors(userController.getPreferences));

router.put('/preferences', verifyToken, catchAsyncErrors(userController.updatePreferences));

router.get('/profile', verifyToken, catchAsyncErrors(userController.getProfile));

module.exports = router;
