const { Router } = require('express');

const router = Router();
const newsController = require('../controllers/newsController');
const { verifyToken } = require('../middleware/authMiddleware');
const { catchAsyncErrors } = require('../middleware/errorHandler');

router.get('/', verifyToken, catchAsyncErrors(newsController.getNews));

router.get('/search', verifyToken, catchAsyncErrors(newsController.searchNews));

router.get('/job/:jobId', verifyToken, catchAsyncErrors(newsController.getJob));

module.exports = router;
