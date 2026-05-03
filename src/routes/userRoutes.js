/**
 * User routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');
const { catchAsyncErrors } = require('../middleware/errorHandler');

/**
 * @route GET /users/preferences
 * @description Get user preferences
 * @access Private
 */
router.get('/preferences', verifyToken, catchAsyncErrors(userController.getPreferences));

/**
 * @route PUT /users/preferences
 * @description Update user preferences
 * @access Private
 */
router.put('/preferences', verifyToken, catchAsyncErrors(userController.updatePreferences));

/**
 * @route GET /users/profile
 * @description Get user profile
 * @access Private
 */
router.get('/profile', verifyToken, catchAsyncErrors(userController.getProfile));

module.exports = router;
