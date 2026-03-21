#!/bin/bash

# Load token
source .tokens.env 2>/dev/null || { echo "Run auto_login.sh first"; exit 1; }

BASE_URL="http://localhost:5001"

echo "Quick API Test"
echo "=============="
echo ""

# Test dengan token premium
if [ -n "$TOKEN_PREMIUM" ]; then
    echo "1. Premium User (Admin) - Get Profile"
    curl -s -X GET "$BASE_URL/api/auth/profile" \
        -H "Authorization: Bearer $TOKEN_PREMIUM" | jq '.user | {name, email, role, plan}'
    echo ""
    
    echo "2. Premium User (Admin) - Get All Users"
    curl -s -X GET "$BASE_URL/api/users" \
        -H "Authorization: Bearer $TOKEN_PREMIUM" | jq '.users | length' | xargs echo "Total users:"
    echo ""
fi

# Test dengan token pro
if [ -n "$TOKEN_PRO" ]; then
    echo "3. Pro User - Get Profile"
    curl -s -X GET "$BASE_URL/api/auth/profile" \
        -H "Authorization: Bearer $TOKEN_PRO" | jq '.user | {name, email, role, plan}'
    echo ""
fi

# Test dengan token free
if [ -n "$TOKEN_FREE" ]; then
    echo "4. Free User - Get Profile"
    curl -s -X GET "$BASE_URL/api/auth/profile" \
        -H "Authorization: Bearer $TOKEN_FREE" | jq '.user | {name, email, role, plan}'
    echo ""
fi
