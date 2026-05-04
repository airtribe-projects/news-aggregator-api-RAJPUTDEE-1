/**
 * News service - handles news aggregation business logic
 * Uses NewsCatcher CatchAll API with job-based workflow
 */

const axios = require('axios');
const config = require('../config/constants');
const logger = require('../utils/logger');
const { NotFoundError } = require('../utils/errors');
const userService = require('./userService');

// Create axios instance for NewsCatcher API
const newscatcherClient = axios.create({
    baseURL: config.NEWSCATCHER_BASE_URL,
    headers: {
        'x-api-key': config.NEWSCATCHER_API_KEY,
        'Content-Type': 'application/json'
    },
    timeout: config.NEWSCATCHER_REQUEST_TIMEOUT
});

// Status constants to avoid magic strings and support OCP
const STATUS_COMPLETED = new Set(['completed', 'done']);
const STATUS_FAILED = 'failed';

// Only pass known CatchAll submit fields to avoid leaking unsupported query params
const ALLOWED_SUBMIT_OPTION_KEYS = new Set([
    'limit',
    'context',
    'start_date',
    'end_date',
    'mode',
    'validators',
    'enrichments'
]);

const sanitizeSubmitOptions = (options = {}) => {
    const sanitized = {};

    for (const [key, value] of Object.entries(options)) {
        if (value === undefined || value === null || value === '') {
            continue;
        }

        if (ALLOWED_SUBMIT_OPTION_KEYS.has(key)) {
            sanitized[key] = value;
        }
    }

    return sanitized;
};

const normalizeCatchAllRecord = (record) => {
    const firstCitation = Array.isArray(record?.citations) ? record.citations[0] : undefined;
    const link = firstCitation?.link || null;

    let source = null;
    if (link) {
        try {
            source = new URL(link).hostname;
        } catch (error) {
            source = null;
        }
    }

    return {
        title: firstCitation?.title || record?.record_title || null,
        description: record?.record_title || null,
        link,
        source,
        published: firstCitation?.published_date || null,
        summary: record?.record_title || null,
        enrichment: record?.enrichment || {},
        citations: Array.isArray(record?.citations) ? record.citations : []
    };
};

const normalizePullResponse = (data = {}) => {
    if (Array.isArray(data.articles)) {
        return data.articles;
    }

    if (Array.isArray(data.all_records)) {
        return data.all_records.map(normalizeCatchAllRecord);
    }

    if (Array.isArray(data.records)) {
        return data.records.map(normalizeCatchAllRecord);
    }

    return [];
};

/**
 * Generic API request wrapper to centralize logging and error handling
 * Extracts detailed error messages from NewsCatcher API responses
 */
const apiRequest = async (method, url, data = null) => {
    try {
        if (method === 'get') return await newscatcherClient.get(url);
        if (method === 'post') return await newscatcherClient.post(url, data);
        throw new Error(`Unsupported method: ${method}`);
    } catch (error) {
        // Extract detailed error info from NewsCatcher API response
        const errorData = error.response?.data || {};
        const statusCode = error.response?.status;
        const errorMessage = errorData.detail || errorData.message || error.message || 'Unknown error';
        
        logger.error('NewsCatcher API request failed', { 
            method, 
            url, 
            statusCode: statusCode ?? 'unknown',
            message: errorMessage,
            errorResponse: errorData,
            code: error.code 
        });
        
        // Create a more informative error
        const apiError = new Error(`NewsCatcher API (${statusCode ?? 'unknown'}): ${errorMessage}`);
        apiError.statusCode = statusCode;
        apiError.errorResponse = errorData;
        apiError.code = error.code;
        apiError.originalMessage = error.message;
        throw apiError;
    }
};

/**
 * Initialize API to validate connection and get suggestions
 */
const initializeAPI = async () => {
    try {
        logger.debug('Initializing NewsCatcher API');

        const response = await apiRequest('post', config.NEWSCATCHER_INITIALIZE_ENDPOINT, {});

        logger.info('NewsCatcher API initialized successfully');

        return response.data;
    } catch (error) {
        logger.error('Error initializing NewsCatcher API', { error: error.message });
        throw error;
    }
};

/**
 * Submit a search job to NewsCatcher API
 */
const submitSearchJob = async (query, options = {}) => {
    try {
        logger.debug('Submitting search job to NewsCatcher', { query });

        // Validate query
        if (!query || query.trim().length === 0) {
            throw new Error('Query cannot be empty');
        }

        // Warn if query is too short (less than 3 words or under 10 characters)
        const wordCount = query.trim().split(/\s+/).length;
        const charCount = query.trim().length;
        
        if (wordCount === 1 || charCount < 10) {
            logger.warn('Query appears too short - may not produce results', { 
                query, 
                wordCount, 
                charCount,
                suggestion: 'Try using descriptive multi-word phrases like "AI company acquisitions"'
            });
        }

        const submitOptions = sanitizeSubmitOptions(options);

        const payload = {
            query,
            limit: submitOptions.limit || config.DEFAULT_PAGE_SIZE,
            ...submitOptions
        };

        logger.debug('Sending request to NewsCatcher', { 
            endpoint: config.NEWSCATCHER_SUBMIT_ENDPOINT,
            payload 
        });

        // Retry on concurrency errors (plan limits) with exponential backoff
        const maxRetries = 3;
        let attempt = 0;
        let response;
        while (attempt <= maxRetries) {
            try {
                response = await apiRequest('post', config.NEWSCATCHER_SUBMIT_ENDPOINT, payload);
                break;
            } catch (err) {
                attempt += 1;
                const isConcurrency = err.statusCode === 403 && String(err.errorResponse?.detail || '').includes('Jobs_Concurrency');
                if (!isConcurrency || attempt > maxRetries) {
                    throw err;
                }
                const backoffMs = 1000 * Math.pow(2, attempt);
                logger.warn('Submit concurrency limit hit, retrying', { query, attempt, backoffMs });
                await new Promise(r => setTimeout(r, backoffMs));
            }
        }

        const jobId = response.data?.job_id;

        if (!jobId) {
            const errMsg = 'No job ID returned from submit endpoint';
            logger.error(errMsg, { query, response: response.data });
            throw new Error(errMsg);
        }

        logger.info('Search job submitted successfully', { jobId, query });
        return jobId;
    } catch (error) {
        logger.error('Error submitting search job', { query, error: error.message });
        throw error; // Propagate error for proper error handling
    }
};

/**
 * Poll job status until completion
 */
const pollJobStatus = async (jobId, maxPolls = config.NEWSCATCHER_JOB_MAX_POLLS) => {
    logger.debug('Starting job status polling', { jobId, maxPolls });

    for (let i = 0; i < maxPolls; i++) {
        try {
            const statusUrl = `${config.NEWSCATCHER_STATUS_ENDPOINT}/${jobId}`;
            const response = await apiRequest('get', statusUrl);

            const status = response.data?.status;
            const validRecords = Number(response.data?.valid_records || 0);
            const progressValidated = Number(response.data?.progress_validated || 0);

            logger.debug('Job status check', { jobId, status, pollNumber: i + 1 });

            // If job is fully completed, finish polling
            if (STATUS_COMPLETED.has(status)) {
                logger.info('Job completed', { jobId, totalPolls: i + 1 });
                return true;
            }

            // If job is still enriching but there are validated/valid records,
            // consider returning partial results early to avoid long waits.
            if (!STATUS_COMPLETED.has(status) && (validRecords > 0 || progressValidated > 0)) {
                logger.info('Job has partial results available, returning early', { jobId, status, validRecords, progressValidated, pollNumber: i + 1 });
                return true;
            }

            if (status === STATUS_FAILED) {
                const error = response.data?.error || 'Unknown error';
                logger.error('Job failed at API', { jobId, error });
                throw new Error(`Job failed: ${error}`);
            }

            // Wait before next poll (except on last iteration)
            if (i < maxPolls - 1) {
                await new Promise(resolve => 
                    setTimeout(resolve, config.NEWSCATCHER_JOB_POLL_INTERVAL)
                );
            }
        } catch (error) {
            // Handle timeout errors more gracefully
            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                logger.warn('Request timeout during polling', { jobId, poll: i + 1 });
                // If it's a timeout on later polls, consider it a temporary issue
                if (i < maxPolls - 1) {
                    continue; // Try again
                }
            }
            
            if (error.message?.includes('Job failed')) {
                throw error; // Re-throw job failure errors
            }
            
            logger.error('Error checking job status', { jobId, error: error.message, poll: i + 1 });
            throw error;
        }
    }

    const totalSeconds = Math.round((maxPolls * config.NEWSCATCHER_JOB_POLL_INTERVAL) / 1000);
    logger.error('Job polling timeout', { jobId, maxPolls, pollIntervalMs: config.NEWSCATCHER_JOB_POLL_INTERVAL, totalSeconds });
    throw new Error(`Job ${jobId} did not complete within ${totalSeconds} seconds`);
};

/**
 * Retrieve job results after completion
 */
const getJobResults = async (jobId) => {
    try {
        logger.debug('Retrieving job results', { jobId });

        const pullUrl = `${config.NEWSCATCHER_PULL_ENDPOINT}/${jobId}`;
        const response = await apiRequest('get', pullUrl);
        const articles = normalizePullResponse(response.data);

        logger.info('Job results retrieved successfully', { jobId, articleCount: articles.length });

        return articles;
    } catch (error) {
        logger.error('Error retrieving job results', { jobId, error: error.message });
        throw error; // Propagate error for proper error handling
    }
};

const newsService = {
    /**
     * Initialize NewsCatcher API connection
     */
    initializeAPI,

    /**
     * Fetch news based on user preferences using job-based API
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

            logger.debug('User preferences found', { userId, count: preferences.length, preferences });

            // Submit jobs for each preference in parallel
            const jobPromises = [];

            for (const preference of preferences) {
                const jobPromise = (async () => {
                    try {
                        logger.debug('Processing preference', { preference });

                        // Submit job
                        const jobId = await submitSearchJob(preference);

                        // Poll until completion
                        await pollJobStatus(jobId);

                        // Get results
                        const articles = await getJobResults(jobId);

                        logger.info('Preference processed successfully', { 
                            preference, 
                            articleCount: articles.length 
                        });

                        return articles;
                    } catch (preferenceError) {
                        logger.error('Error processing preference', { 
                            preference, 
                            error: preferenceError.message 
                        });
                        throw preferenceError; // Propagate error instead of returning empty array
                    }
                })();

                jobPromises.push(jobPromise);
            }

            // Wait for all preference jobs to complete (even if some fail)
            const allResults = await Promise.allSettled(jobPromises);

            // Extract successful results and log failures
            const allNews = allResults.reduce((acc, result) => {
                if (result.status === 'fulfilled') {
                    return [...acc, ...result.value];
                } else {
                    // Log failed preference but continue
                    logger.warn('Preference processing failed', { 
                        reason: result.reason?.message || 'Unknown error'
                    });
                    return acc;
                }
            }, []);

            logger.info('All news fetched successfully', { 
                userId, 
                totalArticles: allNews.length,
                preferencesProcessed: preferences.length
            });

            return allNews;
        } catch (error) {
            if (error instanceof NotFoundError) {
                throw error;
            }
            logger.error('Error fetching news by preferences', { userId, error: error.message });
            throw error;
        }
    },

    /**
     * Search news by custom query using job-based API
     */
    searchNews: async (query, options = {}) => {
        logger.debug('Searching news', { query, options });

        try {
            if (!query) {
                logger.warn('Search query is empty');
                throw new Error('Search query is required');
            }

            // Submit search job
            const jobId = await submitSearchJob(query, options);

            logger.debug('Waiting for search job to complete', { jobId });

            // Poll until job completes
            await pollJobStatus(jobId);

            // Get results
            const articles = await getJobResults(jobId);

            logger.info('News search completed successfully', { 
                query, 
                articleCount: articles.length 
            });

            return articles;
        } catch (error) {
            logger.error('Error searching news', { query, error: error.message });
            throw error; // Propagate error for proper error handling
        }
    }
};

// Expose lower-level functions for async workflows (submit job, pull results)
newsService.submitSearchJob = submitSearchJob;
newsService.getJobResults = getJobResults;

/**
 * Check job status and return results if available (partial or completed)
 */
newsService.fetchJobIfReady = async (jobId) => {
    try {
        const statusUrl = `${config.NEWSCATCHER_STATUS_ENDPOINT}/${jobId}`;
        const statusResp = await apiRequest('get', statusUrl);
        const statusData = statusResp.data || {};

        const validRecords = Number(statusData?.valid_records || 0);
        const progressValidated = Number(statusData?.progress_validated || 0);

        if (STATUS_COMPLETED.has(statusData?.status) || validRecords > 0 || progressValidated > 0) {
            const articles = await getJobResults(jobId);
            return { ready: true, status: statusData?.status, articles };
        }

        return { ready: false, status: statusData?.status };
    } catch (error) {
        throw error;
    }
};

module.exports = newsService;
