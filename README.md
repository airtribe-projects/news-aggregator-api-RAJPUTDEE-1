# News Aggregator API

A RESTful API for a personalized news aggregator built with Node.js, Express.js, bcrypt, and JWT. This API provides user authentication, preference management, and personalized news aggregation from the NewsCatcher News API.

## Features

- **User Authentication**: Secure signup and login with password hashing using bcrypt
- **JWT Token-Based Security**: Token-based authentication for protected endpoints
- **User Preferences Management**: Users can set and update their news preferences
- **Personalized News Aggregation**: Fetch news articles based on user preferences
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Proper error handling with custom error classes
- **Logging System**: Structured logging for better debugging and monitoring
- **Modular Architecture**: Clean separation of concerns with controllers, services, and routes
- **Environment Configuration**: Secure configuration management with .env files
- **RESTful Design**: Clean and intuitive API endpoints

## Technology Stack

- **Node.js**: Runtime environment (>= 18.0.0)
- **Express.js**: Web framework
- **bcrypt**: Password hashing
- **JWT (jsonwebtoken)**: Token-based authentication
- **axios**: HTTP client for external API calls
- **dotenv**: Environment variable management
- **tap**: Testing framework
- **supertest**: HTTP assertion library

## Prerequisites

- Node.js >= 18.0.0
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd news-aggregrator-api
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000

JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h

NEWSCATCHER_API_KEY=your-api-key-here
NEWSCATCHER_API_URL=https://api.newscatcherapi.com/v2/search

LOG_LEVEL=debug
```

## Project Structure

```
news-aggregrator-api/
├── src/
│   ├── config/
│   │   └── constants.js          # Configuration and constants
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification
│   │   ├── errorHandler.js       # Global error handling
│   │   └── requestLogger.js      # Request logging
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── userRoutes.js         # User preference endpoints
│   │   └── newsRoutes.js         # News endpoints
│   ├── controllers/
│   │   ├── authController.js     # Auth request handlers
│   │   ├── userController.js     # User request handlers
│   │   └── newsController.js     # News request handlers
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   ├── userService.js        # User business logic
│   │   └── newsService.js        # News business logic
│   ├── utils/
│   │   ├── logger.js             # Logging utility
│   │   ├── validators.js         # Input validators
│   │   └── errors.js             # Custom error classes
│   └── index.js                  # Express app configuration
├── test/
│   └── server.test.js            # Test suite
├── app.js                        # Server entry point
├── package.json                  # Dependencies
├── .env                          # Environment variables
├── .env.example                  # Environment example
└── README.md                     # This file
```

## Architecture Overview

### Layers

1. **Controller Layer**: Handles HTTP requests/responses
2. **Service Layer**: Contains business logic
3. **Middleware Layer**: Handles cross-cutting concerns (auth, logging, errors)
4. **Routes Layer**: Defines API endpoints
5. **Utils Layer**: Shared utilities (validators, logger, errors)

### Error Handling

The application uses custom error classes for consistent error handling:
- `AppError`: Base error class
- `ValidationError`: Input validation errors (400)
- `AuthenticationError`: Authentication failures (401)
- `AuthorizationError`: Authorization failures (403)
- `NotFoundError`: Resource not found (404)
- `ConflictError`: Conflict errors (409)

### Logging

Structured logging system with multiple levels:
- ERROR: Error messages
- WARN: Warning messages
- INFO: Informational messages
- DEBUG: Debug messages

Configure log level via `LOG_LEVEL` environment variable.

## API Endpoints

### Authentication Endpoints

#### 1. User Signup
- **Endpoint**: `POST /users/signup`
- **Description**: Create a new user account
- **Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "preferences": ["technology", "sports"]
}
```
- **Response** (200):
```json
{
  "message": "User created successfully",
  "user": {
    "email": "john@example.com",
    "name": "John Doe",
    "preferences": ["technology", "sports"]
  }
}
```

#### 2. User Login
- **Endpoint**: `POST /users/login`
- **Description**: Authenticate user and get JWT token
- **Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```
- **Response** (200):
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

### Protected Endpoints (Require Bearer Token)

#### 3. Get User Preferences
- **Endpoint**: `GET /users/preferences`
- **Authentication**: Required (Bearer Token)
- **Response** (200):
```json
{
  "preferences": ["technology", "sports"]
}
```

#### 4. Update User Preferences
- **Endpoint**: `PUT /users/preferences`
- **Authentication**: Required (Bearer Token)
- **Request Body**:
```json
{
  "preferences": ["technology", "business", "health"]
}
```
- **Response** (200):
```json
{
  "message": "Preferences updated successfully",
  "preferences": ["technology", "business", "health"]
}
```

#### 5. Get User Profile
- **Endpoint**: `GET /users/profile`
- **Authentication**: Required (Bearer Token)
- **Response** (200):
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "preferences": ["technology", "sports"]
}
```

#### 6. Get Personalized News
- **Endpoint**: `GET /news`
- **Authentication**: Required (Bearer Token)
- **Response** (200):
```json
{
  "news": [
    {
      "title": "Latest Technology News",
      "description": "...",
      "link": "...",
      "author": "...",
      "published_date": "...",
      "...": "..."
    }
  ],
  "count": 10
}
```

#### 7. Search News
- **Endpoint**: `GET /news/search?query=technology&lang=en&sortBy=relevancy&page=1`
- **Authentication**: Required (Bearer Token)
- **Query Parameters**:
  - `query` (required): Search query
  - `lang` (optional): Language code (default: en)
  - `sortBy` (optional): Sort by (default: relevancy)
  - `page` (optional): Page number (default: 1)
- **Response** (200):
```json
{
  "news": [...],
  "count": 10
}
```

### Utility Endpoints

#### 8. Health Check
- **Endpoint**: `GET /health`
- **Response** (200):
```json
{
  "status": "OK",
  "message": "Server is healthy"
}
```

## Usage Examples

### 1. Start the server
```bash
node app.js
# or
npm start
```

### 2. Signup
```bash
curl -X POST http://localhost:3000/users/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Clark Kent",
    "email": "clark@superman.com",
    "password": "Krypt()n8",
    "preferences": ["movies", "comics"]
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "clark@superman.com",
    "password": "Krypt()n8"
  }'
```

### 4. Get Preferences
```bash
curl -X GET http://localhost:3000/users/preferences \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 5. Update Preferences
```bash
curl -X PUT http://localhost:3000/users/preferences \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": ["movies", "comics", "games"]
  }'
```

### 6. Get News
```bash
curl -X GET http://localhost:3000/news \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 7. Search News
```bash
curl -X GET "http://localhost:3000/news/search?query=technology" \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Running Tests

Run the complete test suite:

```bash
npm run test
```

Expected output: All tests pass ✓

Test coverage includes:
- User signup validation
- User login with valid/invalid credentials
- Preferences management
- News aggregation
- Token-based authentication
- Authorization checks

## Best Practices Implemented

### 1. **Separation of Concerns**
   - Controllers: Handle HTTP requests/responses
   - Services: Contain business logic
   - Middleware: Cross-cutting concerns
   - Routes: Define endpoints

### 2. **Error Handling**
   - Custom error classes for different error types
   - Centralized error handler middleware
   - Async error wrapper for try-catch
   - Proper HTTP status codes

### 3. **Input Validation**
   - Centralized validation utilities
   - Validation throws custom errors
   - Comprehensive error messages
   - Type checking

### 4. **Logging**
   - Structured logging at different levels
   - Timestamps and context information
   - Easy to configure log levels
   - Helpful for debugging and monitoring

### 5. **Security**
   - Password hashing with bcrypt (10 rounds)
   - JWT tokens with 24h expiry
   - Bearer token extraction and validation
   - Environment variables for secrets
   - Generic error messages (no information leakage)

### 6. **Configuration Management**
   - Environment-based configuration
   - .env and .env.example files
   - Centralized constants
   - Easy to switch between environments

### 7. **Code Organization**
   - Modular file structure
   - Clear naming conventions
   - JSDoc comments for functions
   - Middleware chain approach

### 8. **Request Logging**
   - Log all requests with method, path, status, duration
   - Help with API usage tracking
   - Useful for performance monitoring

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# JWT Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRY=24h

# External API Configuration
NEWSCATCHER_API_KEY=your-newscatcher-api-key
NEWSCATCHER_API_URL=https://api.newscatcherapi.com/v2/search

# Logging Configuration
LOG_LEVEL=debug
```

## Security Notes

1. **Never commit `.env` file** to version control
2. **Change JWT_SECRET** in production
3. **Use HTTPS** in production
4. **Implement rate limiting** in production
5. **Add request size limits** for file uploads
6. **Use CORS** if needed
7. **Add input sanitization** for XSS prevention
8. **Implement CSRF protection** if using cookies

## Production Deployment

For production deployment, consider:

1. **Database Integration**
   - Replace in-memory storage with MongoDB/PostgreSQL
   - Implement data persistence

2. **Caching**
   - Add Redis for caching news articles
   - Cache user preferences

3. **Monitoring**
   - Add APM tools (New Relic, DataDog)
   - Implement health checks
   - Monitor error rates

4. **API Gateway**
   - Add API Gateway for rate limiting
   - Implement request validation at gateway level

5. **Load Balancing**
   - Deploy multiple instances
   - Use load balancer

6. **Environment Management**
   - Use separate environments (staging, production)
   - Different configurations for each environment

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Email verification
- [ ] Password reset functionality
- [ ] User profile management
- [ ] News article caching
- [ ] Advanced filtering and search
- [ ] Multiple news API providers
- [ ] User subscription plans
- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] Unit tests
- [ ] Integration tests

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```
   Change PORT in .env file
   ```

2. **API Key not working**
   ```
   Verify NEWSCATCHER_API_KEY in .env
   ```

3. **JWT validation fails**
   ```
   Check JWT_SECRET is set correctly
   ```

4. **Tests failing**
   ```
   npm run test
   Check for missing dependencies
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

ISC

## Author

Airtribe - Backend Engineering Launchpad

## Support

For issues, questions, or suggestions, please create an issue in the repository.

