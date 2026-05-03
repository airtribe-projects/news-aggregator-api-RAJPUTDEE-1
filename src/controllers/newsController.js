/**
 * News controller - handles news-related HTTP requests
 */

const logger = require('../utils/logger');
const newsService = require('../services/newsService');

const newsController = {
    /**
     * Get personalized news endpoint
     */
    getNews: async (req, res, next) => {
        try {
            const userId = req.userId;

            logger.debug('Get news request', { userId });

            const news = await newsService.getNewsByPreferences(userId);

            res.status(200).json({
                news,
                count: news.length
            });
        } catch (error) {
            next(error);
        }
    },

    /**
     * Search news endpoint
     */
    searchNews: async (req, res, next) => {
        try {
            const { query, lang, sortBy, page } = req.query;

            logger.debug('Search news request', { query, lang, sortBy, page });

            if (!query) {
                return res.status(400).json({
                    error: 'Query parameter is required'
                });
            }

            const news = await newsService.searchNews(query, {
                lang,
                sortBy,
                page
            });

            res.status(200).json({
                news,
                count: news.length
            });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = newsController;
