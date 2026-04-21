# PartnerSync Setup Guide

## Quick Start

```bash
# 1. Navigate to project
cd partnersync

# 2. Make sure MongoDB is running
brew services start mongodb-community

# 3. Install dependencies (first time only)
npm install

# 4. Start the app (runs both backend and frontend)
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## MongoDB Atlas Connection

To use MongoDB Atlas (cloud) instead of local:

1. Create account at https://cloud.mongodb.com
2. Create free cluster
3. Create database user (username/password)
4. Click "Connect" → "Drivers"
5. Copy connection string like:
   ```
   mongodb+srv://myuser:mypassword@cluster0.xxx.mongodb.net/partnersync?retryWrites=true&w=majority
   ```

6. Update `.env` file:
   ```
   MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.xxx.mongodb.net/partnersync?retryWrites=true&w=majority
   ```

## Schema Creation

Mongoose automatically creates collections and indexes when you save documents. No manual setup needed.

The first time you register a user:
- `users` collection is created
- Indexes are auto-created

Then when you use features:
- `connections` collection
- `conversations` collection  
- `messages` collection
- `deals` collection

## Testing Registration

Start server, then test with curl:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","role":"provider","profile":{"firstName":"John","lastName":"Doe","companyName":"Test Co"}}'
```

Should return:
```json
{"token":"...","user":{...},"message":"Registration successful"}
```