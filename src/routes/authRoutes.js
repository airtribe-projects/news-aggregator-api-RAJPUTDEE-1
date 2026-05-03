/**
 * Authentication routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { catchAsyncErrors } = require('../middleware/errorHandler');

/**
 * @route POST /users/signup
 * @description Register a new user
 * @access Public
 */
router.post('/signup', catchAsyncErrors(authController.signup));

/**
 * @route POST /users/login
 * @description Login user and return JWT token
 * @access Public
 */
router.post('/login', catchAsyncErrors(authController.login));

module.exports = router;
