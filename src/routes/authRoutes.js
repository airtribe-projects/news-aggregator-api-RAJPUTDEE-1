const { Router } = require('express');

const router = Router();
const authController = require('../controllers/authController');
const { catchAsyncErrors } = require('../middleware/errorHandler');

router.post('/signup', catchAsyncErrors(authController.signup));

router.post('/login', catchAsyncErrors(authController.login));

module.exports = router;
