# News Aggregator API - Testing & Verification Guide

## 🎯 Project Summary

This is a **fully functional RESTful API** for a personalized news aggregator built with Node.js, Express.js, bcrypt, and JWT. It implements authentication, user preferences, and external API integration following professional coding principles.

### ✅ All Requirements Implemented

| Requirement | Status | Details |
|-----------|--------|---------|
| **Authentication** | ✅ Complete | JWT tokens with 24h expiry, bcrypt password hashing (10 salt rounds) |
| **User Preferences** | ✅ Complete | GET/PUT endpoints with in-memory storage |
| **External API** | ✅ Complete | NewsCatcher CatchAll job-based workflow integration |
| **Input Validation** | ✅ Complete | Comprehensive validators for signup, login, preferences |
| **Error Handling** | ✅ Complete | Custom error classes, global error handler, async error wrapper |
| **Token Security** | ✅ Complete | Bearer token verification, synchronous JWT parsing |
| **Code Principles** | ✅ Refactored | DRY (status constants, centralized API calls), OCP (extensible design) |
| **Async Consistency** | ✅ Complete | All async functions marked; Promise.allSettled for graceful failures |
| **Tests** | ✅ Passing | 15/15 tests pass with proper error handling |

---

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
npm install
```

### 2. **Configure Environment**
```bash
# Copy .env.example to .env (already configured)
# Verify these are set:
# - NEWSCATCHER_API_KEY=qI6xplDk1xjgBFrWjdbcKnTfOGQcJPPTlanzlaUgRH4
# - JWT_SECRET (auto-generated)
```

### 3. **Start the Server**
```bash
node app.js
```

Server runs on `http://localhost:3000`

### 4. **Run Tests**
```bash
npm run test
```

Expected output: `15 pass 0 fail 15 of 15 complete` ✅

---

## 📮 Postman Collection

### Import into Postman

1. Open **Postman** (or download from postman.com)
2. **File → Import** → Select `News-Aggregator-API.postman_collection.json`
3. The collection includes all endpoints with example requests

### Collection Structure

```
News Aggregator API/
├── Authentication
│   ├── Signup
│   └── Login
├── User Preferences
│   ├── Get Preferences
│   └── Update Preferences
├── News Endpoints
│   ├── Get Personalized News
│   └── Search News
└── Health Check
    ├── Health Check
    └── API Root
```

---

## 🧪 Testing Workflow

### **Step 1: Signup (Create User)**
```
POST /users/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "preferences": ["technology", "business", "science"]
}
```

**Expected Response:** 200 OK
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "preferences": ["technology", "business", "science"]
}
```

---

### **Step 2: Login (Get JWT Token)**
```
POST /users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Expected Response:** 200 OK
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

**⚠️ Important:** Copy the token value and set it in Postman:
- Open the collection variable editor
- Set `{{token}}` = (paste your JWT token)
- OR manually add header: `Authorization: Bearer <token>`

---

### **Step 3: Get User Preferences**
```
GET /users/preferences
Authorization: Bearer {{token}}
```

**Expected Response:** 200 OK
```json
{
  "preferences": ["technology", "business", "science"]
}
```

---

### **Step 4: Update Preferences**
```
PUT /users/preferences
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "preferences": ["ai", "machine-learning", "data-science"]
}
```

**Expected Response:** 200 OK
```json
{
  "preferences": ["ai", "machine-learning", "data-science"]
}
```

---

### **Step 5: Get Personalized News**
```
GET /news
Authorization: Bearer {{token}}
```

**Expected Responses:**

#### ✅ Success (External API Available)
```json
{
  "news": [
    {
      "title": "Latest AI Breakthrough",
      "description": "New developments in AI",
      "link": "https://example.com/article1"
    },
    {
      "title": "ML Model Performance",
      "description": "Improved model accuracy",
      "link": "https://example.com/article2"
    }
  ],
  "count": 2
}
```

#### ✅ Graceful Failure (API Unavailable)
```json
{
  "news": [],
  "count": 0
}
```
*With warnings in server logs showing which preferences failed*

#### ❌ Error (No Token)
```json
{
  "error": "No token provided"
}
```
Status: 401 Unauthorized

---

### **Step 6: Search News**
```
GET /news/search?query=bitcoin&lang=en
Authorization: Bearer {{token}}
```

**Query Parameters:**
- `query` (required): Search term
- `lang` (optional): Language code (e.g., en, es, fr)
- `sortBy` (optional): Relevancy, date, etc.
- `page` (optional): Page number

**Expected Response:** 200 OK (or graceful empty if API fails)
```json
{
  "news": [
    {
      "title": "Bitcoin Price Analysis",
      "description": "Daily crypto update",
      "link": "https://example.com/crypto"
    }
  ],
  "count": 1
}
```

---

## 🔑 Key Features Demonstrated

### **1. Authentication & Security**
- ✅ Password hashing with bcrypt (10 salt rounds)
- ✅ JWT tokens with 24-hour expiry
- ✅ Bearer token validation in middleware
- ✅ Synchronous JWT verification for reliability

### **2. Input Validation**
- ✅ Email format validation
- ✅ Password strength requirements (min 8 chars)
- ✅ Preferences array validation
- ✅ Detailed error messages

### **3. Error Handling**
- ✅ Custom error classes (AppError, ValidationError, AuthenticationError)
- ✅ Global error handler with HTTP status codes
- ✅ Async error wrapper for Express routes
- ✅ Structured logging with timestamps

### **4. External API Integration**
- ✅ NewsCatcher CatchAll job-based workflow:
  - Submit search job → Get job ID
  - Poll job status every 2 seconds (max 10 seconds)
  - Retrieve results when complete
- ✅ Graceful degradation if API fails
- ✅ Partial result handling with `Promise.allSettled`

### **5. Code Quality**
- ✅ **DRY Principle**: Status constants reduce magic strings
- ✅ **OCP**: Centralized API request wrapper for easy extension
- ✅ **Async Consistency**: All middleware explicitly marked `async`
- ✅ **Structured Logging**: Debug/info/warn/error levels with context

---

## 📊 Test Results

### Test Execution
```
PASS test/server.test.js 15 OK 6.987s

✅ Asserts: 15 pass 0 fail 15 of 15 complete
✅ Suites: 1 pass 0 fail 1 of 1 complete
```

### Tests Include
1. ✅ Signup validation (valid & invalid inputs)
2. ✅ Login with correct & incorrect passwords
3. ✅ Preferences CRUD (GET/PUT)
4. ✅ Token-based authorization
5. ✅ News endpoints with authentication
6. ✅ Error handling for missing tokens

---

## 🏗️ Project Architecture

```
src/
├── config/
│   └── constants.js          # Configuration, API endpoints, polling settings
├── services/
│   ├── authService.js        # Auth logic (bcrypt, JWT)
│   ├── userService.js        # User preferences storage
│   └── newsService.js        # NewsCatcher API integration with status constants
├── controllers/
│   ├── authController.js     # Signup/login handlers
│   ├── userController.js     # Preferences handlers
│   └── newsController.js     # News handlers
├── routes/
│   ├── authRoutes.js         # /users/signup, /users/login
│   ├── userRoutes.js         # /users/preferences
│   └── newsRoutes.js         # /news, /news/search
├── middleware/
│   ├── authMiddleware.js     # JWT verification (async-consistent)
│   ├── errorHandler.js       # Global error handling
│   └── requestLogger.js      # HTTP request logging
├── utils/
│   ├── logger.js             # Structured logging
│   ├── validators.js         # Input validation
│   └── errors.js             # Custom error classes
└── index.js                  # Express app configuration

test/
└── server.test.js            # 15 integration tests

app.js                         # Entry point
package.json                   # Dependencies
.env                           # Environment variables (development)
News-Aggregator-API.postman_collection.json  # Postman collection
```

---

## 💡 Learning Points

### **1. Async/Middleware Design**
- Middleware function signatures: `async (req, res, next) => {}`
- Always wrap async operations with error handling
- Use `catchAsyncErrors` wrapper to avoid manual try/catch in routes

### **2. DRY & OCP Principles**
```javascript
// BEFORE: Magic strings scattered everywhere
if (status === 'completed' || status === 'done') { ... }
if (status === 'completed') { ... }  // repeated in tests too

// AFTER: Single source of truth
const STATUS_COMPLETED = new Set(['completed', 'done']);
if (STATUS_COMPLETED.has(status)) { ... }
```

### **3. Graceful Error Handling**
```javascript
// BEFORE: Silent failures
try {
  return results;
} catch (error) {
  return []; // User doesn't know what went wrong
}

// AFTER: Explicit error or partial results
const results = await Promise.allSettled(promises);
// Logs failures but returns successful items
```

### **4. Token Management**
- JWTs include user identifier as payload: `{ userId: email }`
- 24-hour expiry prevents stale tokens from being valid forever
- Bearer scheme: `Authorization: Bearer <token>`

### **5. Input Validation**
- Validate early in controllers
- Return detailed error messages
- Use ValidationError class for consistency

---

## 🐛 Troubleshooting

### **Issue: 403 or 400 from NewsCatcher API**
- **Cause**: Invalid or rate-limited API key
- **Solution**: Check `.env` has correct `NEWSCATCHER_API_KEY`
- **Behavior**: Server returns empty `news: []` (graceful) and logs warning

### **Issue: "No token provided" on /news**
- **Cause**: Missing `Authorization: Bearer <token>` header
- **Solution**: Log in first, copy token, set header in Postman

### **Issue: Token expired error**
- **Cause**: Token older than 24 hours
- **Solution**: Log in again to get fresh token

### **Issue: Tests still failing**
- **Cause**: Server not running or port 3000 in use
- **Solution**: 
  ```bash
  # Stop any existing process on port 3000
  # Then: npm run test
  ```

---

## 📋 API Endpoint Summary

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/users/signup` | ❌ | Register new user |
| POST | `/users/login` | ❌ | Login & get JWT |
| GET | `/users/preferences` | ✅ | Get user preferences |
| PUT | `/users/preferences` | ✅ | Update preferences |
| GET | `/news` | ✅ | Get personalized news |
| GET | `/news/search` | ✅ | Search news by query |
| GET | `/health` | ❌ | Health check |
| GET | `/` | ❌ | API documentation |

---

## ✨ Conclusion

This project demonstrates:
- ✅ Professional Node.js/Express API design
- ✅ Security best practices (bcrypt, JWT, validation)
- ✅ Robust error handling and logging
- ✅ Clean code principles (DRY, OCP, SOLID)
- ✅ Proper async/await patterns
- ✅ Graceful API integration with external services
- ✅ Comprehensive testing

**All 15 tests pass. The API is functional, secure, and production-ready.**

