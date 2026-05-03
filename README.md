# News Aggregator API

A RESTful API for a personalized news aggregator built with Node.js, Express.js, bcrypt, and JWT. This API provides user authentication, preference management, and personalized news aggregation from the NewsCatcher News API.

## Features

- **User Authentication**: Secure signup and login with password hashing using bcrypt
- **JWT Token-Based Security**: Token-based authentication for protected endpoints
- **User Preferences Management**: Users can set and update their news preferences
- **Personalized News Aggregation**: Fetch news articles based on user preferences
- **Input Validation**: Comprehensive validation for all user inputs
- **Error Handling**: Proper error handling and informative error messages
- **RESTful Design**: Clean and intuitive API endpoints

## Technology Stack

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **bcrypt**: Password hashing
- **JWT (jsonwebtoken)**: Token-based authentication
- **axios**: HTTP client for external API calls
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

3. Install additional required packages:
```bash
npm install bcrypt jsonwebtoken axios
```

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
  "preferences": ["technology", "sports", "entertainment"]
}
```
- **Response** (Success - 200):
```json
{
  "message": "User created successfully",
  "user": {
    "email": "john@example.com",
    "name": "John Doe",
    "preferences": ["technology", "sports", "entertainment"]
  }
}
```
- **Response** (Validation Error - 400):
```json
{
  "error": "Validation failed",
  "details": ["Valid email is required"]
}
```
- **Validation Rules**:
  - Name: Required, non-empty string
  - Email: Required, valid email format
  - Password: Required, minimum 8 characters
  - Preferences: Required, must be an array

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
- **Response** (Success - 200):
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
- **Response** (Invalid Credentials - 401):
```json
{
  "error": "Invalid credentials"
}
```

### Protected Endpoints (Require Bearer Token)

#### 3. Get User Preferences
- **Endpoint**: `GET /users/preferences`
- **Description**: Retrieve the user's news preferences
- **Authentication**: Required (Bearer Token)
- **Request Header**:
```
Authorization: Bearer <your-jwt-token>
```
- **Response** (Success - 200):
```json
{
  "preferences": ["technology", "sports", "entertainment"]
}
```
- **Response** (Unauthorized - 401):
```json
{
  "error": "No token provided"
}
```

#### 4. Update User Preferences
- **Endpoint**: `PUT /users/preferences`
- **Description**: Update the user's news preferences
- **Authentication**: Required (Bearer Token)
- **Request Header**:
```
Authorization: Bearer <your-jwt-token>
```
- **Request Body**:
```json
{
  "preferences": ["technology", "business", "health"]
}
```
- **Response** (Success - 200):
```json
{
  "message": "Preferences updated successfully",
  "preferences": ["technology", "business", "health"]
}
```

#### 5. Get Personalized News
- **Endpoint**: `GET /news`
- **Description**: Fetch news articles based on user preferences
- **Authentication**: Required (Bearer Token)
- **Request Header**:
```
Authorization: Bearer <your-jwt-token>
```
- **Response** (Success - 200):
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
- **Response** (No Preferences - 200):
```json
{
  "news": [],
  "message": "No preferences set. Please set your news preferences first."
}
```

## Usage Example

### 1. Signup
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

### 2. Login
```bash
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "clark@superman.com",
    "password": "Krypt()n8"
  }'
```

### 3. Get Preferences (using token from login)
```bash
curl -X GET http://localhost:3000/users/preferences \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 4. Update Preferences
```bash
curl -X PUT http://localhost:3000/users/preferences \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": ["movies", "comics", "games"]
  }'
```

### 5. Get News
```bash
curl -X GET http://localhost:3000/news \
  -H "Authorization: Bearer <your-jwt-token>"
```

## Running Tests

Run the test suite to verify all endpoints:

```bash
npm run test
```

Expected output:
```
✓ POST /users/signup
✓ POST /users/signup with missing email
✓ POST /users/login
✓ POST /users/login with wrong password
✓ GET /users/preferences
✓ GET /users/preferences without token
✓ PUT /users/preferences
✓ Check PUT /users/preferences
✓ GET /news
✓ GET /news without token
...
```

## Starting the Server

```bash
node app.js
```

The server will start on port 3000.

## Project Structure

```
news-aggregrator-api/
├── app.js                 # Main application file with all routes and logic
├── package.json          # Project dependencies
├── package-lock.json     # Locked dependency versions
├── test/
│   └── server.test.js   # Test suite
└── README.md            # This file
```

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with salt rounds of 10
2. **JWT Authentication**: Tokens expire after 24 hours
3. **Input Validation**: All user inputs are validated before processing
4. **Token-Based Access Control**: Protected endpoints require valid JWT tokens
5. **Error Messages**: Generic error messages for security (e.g., "Invalid credentials")

## External API Integration

This API integrates with the **NewsCatcher News API** to fetch real-time news articles based on user preferences.

- **API Endpoint**: `https://api.newscatcherapi.com/v2/search`
- **Authentication**: API key-based authentication
- **Rate Limiting**: Respects API rate limits

## Error Handling

The API provides detailed error responses with appropriate HTTP status codes:

- **400 Bad Request**: Invalid input or validation errors
- **401 Unauthorized**: Missing or invalid token
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server-side errors

## Development Notes

- User data is stored in-memory. For production, integrate a database like MongoDB or PostgreSQL.
- JWT secret key should be stored in environment variables in production.
- Implement rate limiting for production environments.
- Add request logging and monitoring.

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- Email verification
- Password reset functionality
- User profile management
- News article caching
- Advanced filtering and search
- Multiple API provider support
- User subscription plans

## License

ISC

## Author

Airtribe - Backend Engineering Launchpad
