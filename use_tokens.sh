#!/bin/bash

# Warna untuk output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Load token dari file
if [ -f ".tokens.env" ]; then
    source .tokens.env
else
    echo -e "${RED}❌ Token file not found! Run auto_login.sh first${NC}"
    exit 1
fi

BASE_URL="http://localhost:5001"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Testing with Saved Tokens${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Fungsi untuk test endpoint
test_endpoint() {
    local token=$1
    local user_type=$2
    local endpoint=$3
    
    echo -e "${YELLOW}➜ Testing $endpoint as $user_type user...${NC}"
    
    response=$(curl -s -X GET "$BASE_URL$endpoint" \
        -H "Authorization: Bearer $token")
    
    # Cek apakah response valid
    if echo "$response" | grep -q '"message"'; then
        echo -e "${GREEN}  ✅ Response received${NC}"
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
    else
        echo -e "${RED}  ❌ Error: $response${NC}"
    fi
    echo ""
}

# Test profile endpoint untuk setiap user
echo -e "${BLUE}📋 Testing Profile Endpoints:${NC}\n"

if [ -n "$TOKEN_PREMIUM" ]; then
    test_endpoint "$TOKEN_PREMIUM" "PREMIUM" "/api/auth/profile"
fi

if [ -n "$TOKEN_PRO" ]; then
    test_endpoint "$TOKEN_PRO" "PRO" "/api/auth/profile"
fi

if [ -n "$TOKEN_FREE" ]; then
    test_endpoint "$TOKEN_FREE" "FREE" "/api/auth/profile"
fi

# Test endpoint yang memerlukan role tertentu (hanya admin)
if [ -n "$TOKEN_PREMIUM" ]; then
    echo -e "${BLUE}📋 Testing Admin-Only Endpoint:${NC}\n"
    test_endpoint "$TOKEN_PREMIUM" "PREMIUM" "/api/users"
fi

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Testing completed${NC}"
