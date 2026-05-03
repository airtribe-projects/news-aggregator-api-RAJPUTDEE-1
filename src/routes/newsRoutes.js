/**
 * News routes
 */

const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken } = require('../middleware/authMiddleware');
const { catchAsyncErrors } = require('../middleware/errorHandler');

/**
 * @route GET /news
 * @description Get personalized news based on user preferences
 * @access Private
 */
router.get('/', verifyToken, catchAsyncErrors(newsController.getNews));

/**
 * @route GET /news/search
 * @description Search news by query
 * @access Private
 */
router.get('/search', verifyToken, catchAsyncErrors(newsController.searchNews));

module.exports = router;
