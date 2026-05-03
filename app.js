const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

const app = express();
const port = 3000;

// In-memory user storage
const users = new Map();

// JWT secret key
const JWT_SECRET = 'your-secret-key-change-this-in-production';

// NewsCatcher API configuration
const NEWSCATCHER_API_KEY = 'qI6xplDk1xjgBFrWjdbcKnTfOGQcJPPTlanzlaUgRH4';
const NEWSCATCHER_API_URL = 'https://api.newscatcherapi.com/v2/search';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.userId = decoded.userId;
        next();
    });
};

// INPUT VALIDATION FUNCTIONS
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    return password && password.length >= 8;
};

const validateSignupInput = (data) => {
    const errors = [];
    
    if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        errors.push('Name is required and must be a non-empty string');
    }
    
    if (!data.email || !validateEmail(data.email)) {
        errors.push('Valid email is required');
    }
    
    if (!data.password || !validatePassword(data.password)) {
        errors.push('Password must be at least 8 characters');
    }
    
    if (!Array.isArray(data.preferences)) {
        errors.push('Preferences must be an array');
    }
    
    return { valid: errors.length === 0, errors };
};

// SIGNUP ROUTE
app.post('/users/signup', async (req, res) => {
    try {
        const { name, email, password, preferences } = req.body;
        
        // Input validation
        const validation = validateSignupInput(req.body);
        if (!validation.valid) {
            return res.status(400).json({ 
                error: 'Validation failed',
                details: validation.errors 
            });
        }
        
        // Check if user already exists
        if (users.has(email)) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Store user
        users.set(email, {
            email,
            name,
            password: hashedPassword,
            preferences: preferences || []
        });
        
        res.status(200).json({ 
            message: 'User created successfully',
            user: { email, name, preferences }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// LOGIN ROUTE
app.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Input validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
        
        // Find user
        const user = users.get(email);
        
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ 
            message: 'Login successful',
            token,
            user: { email: user.email, name: user.name }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET USER PREFERENCES ROUTE
app.get('/users/preferences', verifyToken, (req, res) => {
    try {
        const user = users.get(req.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.status(200).json({ 
            preferences: user.preferences 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// UPDATE USER PREFERENCES ROUTE
app.put('/users/preferences', verifyToken, (req, res) => {
    try {
        const { preferences } = req.body;
        
        // Input validation
        if (!Array.isArray(preferences)) {
            return res.status(400).json({ error: 'Preferences must be an array' });
        }
        
        const user = users.get(req.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update preferences
        user.preferences = preferences;
        
        res.status(200).json({ 
            message: 'Preferences updated successfully',
            preferences: user.preferences 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET NEWS ROUTE
app.get('/news', verifyToken, async (req, res) => {
    try {
        const user = users.get(req.userId);
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (user.preferences.length === 0) {
            return res.status(200).json({ 
                news: [],
                message: 'No preferences set. Please set your news preferences first.'
            });
        }
        
        // Fetch news for each preference
        const newsResults = [];
        
        for (const preference of user.preferences) {
            try {
                const response = await axios.get(NEWSCATCHER_API_URL, {
                    params: {
                        q: preference,
                        lang: 'en',
                        sort_by: 'relevancy',
                        page: 1
                    },
                    headers: {
                        'x-api-key': NEWSCATCHER_API_KEY
                    }
                });
                
                if (response.data && response.data.articles) {
                    newsResults.push(...response.data.articles);
                }
            } catch (apiError) {
                console.error(`Error fetching news for ${preference}:`, apiError.message);
                // Continue with next preference if one fails
            }
        }
        
        res.status(200).json({ 
            news: newsResults,
            count: newsResults.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

if (require.main === module) {
    app.listen(port, (err) => {
        if (err) {
            return console.log('Something bad happened', err);
        }
        console.log(`Server is listening on ${port}`);
    });
}

module.exports = app;