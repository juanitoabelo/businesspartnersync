#!/bin/bash
cd /Volumes/Drive\ Uone/Abelo\ Creative/goose-ai-projects/partnersync

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 20 > /dev/null 2>&1

source .env

echo "Starting server on port 5001..."
node test-api.mjs &
SERVER_PID=$!

sleep 3

if curl -s http://localhost:5001/api/health | grep -q "ok"; then
  echo "✓ Server running!"
  echo ""
  echo "Testing registration..."
  
  RESULT=$(curl -s -X POST http://localhost:5001/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123","role":"provider","profile":{"firstName":"Test","companyName":"TestCo"}}')
  
  if echo "$RESULT" | grep -q "token"; then
    echo "✓ Registration works!"
    TOKEN=$(echo "$RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo "Token: ${TOKEN:0:20}..."
    
    echo ""
    echo "Testing /auth/me..."
    ME=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5001/api/auth/me)
    if echo "$ME" | grep -q "test@example.com"; then
      echo "✓ GET /auth/me works!"
    else
      echo "✗ GET /auth/me failed: $ME"
    fi
    
  else
    echo "✗ Registration failed: $RESULT"
  fi
else
  echo "✗ Server not responding"
fi

echo ""
echo "Killing test server..."
kill $SERVER_PID 2>/dev/null