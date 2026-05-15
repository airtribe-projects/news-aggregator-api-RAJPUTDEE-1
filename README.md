# News Aggregator API 🚀

![node](https://img.shields.io/badge/node-%3E=_18-brightgreen) ![express](https://img.shields.io/badge/express-4.18.x-blue) ![language](https://img.shields.io/badge/language-JavaScript-yellow) ![status](https://img.shields.io/badge/status-WIP-orange)

Objective
---------
A small, production-minded REST API that aggregates personalized news using the NewsCatcher CatchAll integration. Key features:

- Authentication (JWT) and password hashing (bcrypt) 🔒
- Preference-driven feeds and user preferences
- Asynchronous NewsCatcher job workflow (submit → poll → pull) 🧩
- Layered structure: controllers → services → middleware → utils

Quick repo map
--------------
```
.                     repo root
|-- app.js            # app entry
|-- package.json      # metadata & scripts
|-- .env.example      # required env vars
|-- News-Aggregator-API.postman_collection.json  # Postman collection
|-- README.md         # docs
|
|-- src/              # application source
|   |-- index.js      # express app bootstrap
+|   |-- config/       # constants and config
|   |-- routes/       # route definitions (auth, user, news)
|   |-- controllers/  # handlers for routes
|   |-- services/     # business + external API integration
|   |-- middleware/   # auth, error handling, logging
|   `-- utils/        # helpers & validators
`
`-- test/             # tests (tap + supertest)
```

Getting started
---------------

Prerequisites
- Node 18+ and npm

Install
```
npm install
```

Environment
1. Copy `.env.example` to `.env` and set values.
2. Important env vars:
   - `PORT` (default: 3000)
   - `JWT_SECRET` (used to sign tokens)
   - `NEWSCATCHER_API_KEY` (for NewsCatcher calls)
   - `NODE_ENV`

Run
```
npm start
```

Developer scripts
```
npm test        # run integration & unit tests (tap + supertest)
npm run lint    # (if configured) lint the code
```

Testing notes 🧪
- The test suite uses `tap` + `supertest`. Tests are designed to run offline where possible — external NewsCatcher calls are stubbed/mocked in tests. If you want end-to-end tests against the live NewsCatcher API, set `NEWSCATCHER_API_KEY` in `.env` and run `npm test`, but be mindful of rate / job concurrency limits.
- The `news` endpoints use an asynchronous job workflow. Tests expect a 202 Accepted response from `/news/search` with a `{ job_id, status_url }` payload. Use `GET /news/job/:jobId` to poll for partial/complete results.

API overview 🔎
- POST /auth/signup — create user (body: { email, password })
- POST /auth/login — login (returns `access_token`)
- GET /news/search?query=... — submit a NewsCatcher job (returns 202 + job_id)
- GET /news/job/:jobId — poll job status & pull results (may return partial results)

Example: submit search and poll (curl)
```
# 1. login
curl -s -X POST http://localhost:3000/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"dev@example.com","password":"password"}'

# 2. submit search (use token from login response)
curl -s -X GET 'http://localhost:3000/news/search?query=space%20exploration' \
  -H 'Authorization: Bearer <TOKEN>'

# 3. poll job results
curl -s -X GET http://localhost:3000/news/job/<JOB_ID> -H 'Authorization: Bearer <TOKEN>'
```

Postman
- Import `News-Aggregator-API.postman_collection.json` into Postman.
- Authenticate with `/auth/login` first and set `Authorization: Bearer {{token}}` in the collection environment.

Design notes & gotchas
----------------------
- NewsCatcher workflow is asynchronous to avoid long HTTP timeouts — the API returns 202 on search submit. Clients should poll `/news/job/:jobId`.
- Query validation: the server validates queries (minimum length/words) to avoid trivial upstream calls.
- Upstream errors: the service extracts `error.response.data` from axios errors and surfaces helpful messages/status codes.
- Jobs_Concurrency (403) is retried with backoff in `newsService` (max retry attempts configured).

Contributing
------------
- Fork → branch → PR. Keep changes focused and add tests for new behavior.
- Run `npm test` before submitting a PR.

Troubleshooting
---------------
- If live NewsCatcher calls fail with 403 concurrency errors, check `NEWSCATCHER_API_KEY` usage and reduce parallel requests.
- If tokens fail, ensure `JWT_SECRET` matches between `.env` and running process.

License & contact
-----------------
This repository is provided as-is. Add a license file if you intend to open-source it.

Maintainer: engineering@airtribe.example (replace with real contact)

Thanks for using the News Aggregator API — contributions welcome! ✨
