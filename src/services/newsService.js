/**
 * News service - handles news aggregation business logic
 */

const axios = require('axios');
const config = require('../config/constants');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');
const userService = require('./userService');

const newsService = {
    /**
     * Fetch news based on user preferences
     */
    getNewsByPreferences: async (userId) => {
        logger.debug('Fetching news by preferences', { userId });

        try {
            // Get user preferences
            const preferences = userService.getPreferences(userId);

            if (preferences.length === 0) {
                logger.info('No preferences set for user', { userId });
                return [];
            }

            // Fetch news for each preference
            const newsResults = [];

            for (const preference of preferences) {
                try {
                    logger.debug('Fetching news for preference', { preference });

                    const response = await axios.get(config.NEWSCATCHER_API_URL, {
                        params: {
                            q: preference,
                            lang: 'en',
                            sort_by: 'relevancy',
                            page: 1
                        },
                        headers: {
                            'x-api-key': config.NEWSCATCHER_API_KEY
                        }
                    });

                    if (response.data && response.data.articles) {
                        newsResults.push(...response.data.articles);
                        logger.info('News fetched successfully', {
                            preference,
                            articlesCount: response.data.articles.length
                        });
                    }
                } catch (apiError) {
                    logger.warn(`Error fetching news for preference: ${preference}`, {
                        error: apiError.message
                    });
                    // Continue with next preference if one fails
                }
            }

            logger.info('News fetch completed', { userId, totalArticles: newsResults.length });

            return newsResults;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error('Error fetching news', { userId, error: error.message });
            throw error;
        }
    },

    /**
     * Search news by query
     */
    searchNews: async (query, options = {}) => {
        logger.debug('Searching news', { query, options });

        try {
            const response = await axios.get(config.NEWSCATCHER_API_URL, {
                params: {
                    q: query,
                    lang: options.lang || 'en',
                    sort_by: options.sortBy || 'relevancy',
                    page: options.page || 1
                },
                headers: {
                    'x-api-key': config.NEWSCATCHER_API_KEY
                }
            });

            if (response.data && response.data.articles) {
                logger.info('News search completed', { query, articlesCount: response.data.articles.length });
                return response.data.articles;
            }

            return [];
        } catch (error) {
            logger.error('Error searching news', { query, error: error.message });
            throw error;
        }
    }
};

module.exports = newsService;
