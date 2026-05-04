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
            const {
                query,
                limit,
                context,
                start_date,
                end_date,
                mode
            } = req.query;

            logger.debug('Search news request', { query, limit, context, start_date, end_date, mode });

            if (!query) {
                return res.status(400).json({
                    error: 'Query parameter is required'
                });
            }

            const numericLimit = limit ? Number(limit) : undefined;
            if (limit && (Number.isNaN(numericLimit) || numericLimit <= 0)) {
                return res.status(400).json({
                    error: 'limit must be a positive number'
                });
            }

            // Submit job and return job id immediately (async workflow)
            const jobId = await newsService.submitSearchJob(query, {
                limit: numericLimit,
                context,
                start_date,
                end_date,
                mode
            });

            return res.status(202).json({
                job_id: jobId,
                status_url: `/news/job/${jobId}`
            });
        } catch (error) {
            next(error);
        }
    }
,
    /**
     * Get job results (async)
     */
    getJob: async (req, res, next) => {
        try {
            const jobId = req.params.jobId;
            logger.debug('Get job request', { jobId });

            const result = await newsService.fetchJobIfReady(jobId);

            if (result.ready) {
                return res.status(200).json({
                    news: result.articles,
                    count: result.articles.length,
                    status: result.status
                });
            }

            return res.status(202).json({ status: result.status });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = newsController;
