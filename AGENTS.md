# PartnerSync - Agent Instructions

## Quick Start

```bash
cd partnersync
npm run dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

## Key Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Runs both server (8080) and vite client (5173) |
| `npm run server` | Runs only the backend |
| `npm run client` | Runs only the frontend |
| `npm run build` | Builds for production |

## Architecture

- **Frontend**: React 19 + Vite + React Router (port 5173)
- **Backend**: Express + Mongoose + MongoDB Atlas (port 8080)
- **Auth**: JWT tokens with bcrypt password hashing
- **API Proxy**: Vite proxies `/api` requests to `http://127.0.0.1:8080`

## MongoDB Atlas Setup

- Connection string in `.env` - uses MongoDB Atlas cloud
- Models auto-create collections on first document save
- If connection fails, check IP whitelist in MongoDB Atlas dashboard

## Common Issues & Fixes

### Server won't start (ECONNREFUSED 127.0.0.1:8080)
The server may fail silently. Use this to start reliably:
```bash
nohup node server/index.js > /tmp/server.log 2>&1 &
```
Then verify: `curl http://127.0.0.1:8080/api/health`

### MongoDB SSL/TLS errors with Node v24
If you get SSL errors, add these options to mongoose.connect():
```javascript
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 15000,
})
```

### Frontend API calls fail
- Ensure server is running on port 8080
- Check browser console for specific API errors
- Vite proxy must be enabled (default in vite.config.js)

## Important Files

| File | Purpose |
|------|---------|
| `server/index.js` | Express server, all API routes, MongoDB models |
| `src/context/AuthContext.jsx` | Auth state management |
| `src/pages/*.jsx` | Page components (Dashboard, Discover, Messages, etc.) |
| `.env` | MongoDB URI, JWT secret, port |

## Data Models (Mongoose)

- **User**: email, password, role (provider/seeker), profile, providerDetails, seekerDetails
- **Connection**: requesterId, recipientId, status (pending/accepted/declined)
- **Conversation**: participants, lastMessage, lastMessageAt
- **Message**: conversationId, senderId, content
- **Deal**: providerId, seekerId, status, terms

## API Endpoints

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/users`, `GET /api/users/:id`, `GET /api/users/matches`
- `POST /api/connections`, `GET /api/connections`, `PUT /api/connections/:id`
- `GET/POST /api/messages/conversations`, `GET/POST /api/messages/conversations/:id/messages`
- `GET/POST/PUT /api/deals`
- `GET /api/analytics/dashboard`

## Auth Middleware

All protected routes use `auth` middleware that expects:
```
Authorization: Bearer <jwt_token>
```

## Development Notes

- JWT secret: `partnersync-secret-key-2024` (change in production)
- User roles: `provider` (service provider) or `seeker` (business owner)
- MongoDB automatically creates indexes on first query
