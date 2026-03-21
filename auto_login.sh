#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:5001"
TOKEN_FILE=".tokens.env"

> "$TOKEN_FILE"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   Auto Login & Token Generator${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

login_and_save() {
    local email=$1
    local password=$2
    local user_type=$3
    
    echo -e "${YELLOW}➜ Logging in as $user_type user...${NC}"
    echo -e "  Email: ${email}"
    
    response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    token=$(echo "$response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    name=$(echo "$response" | grep -o '"name":"[^"]*"' | cut -d'"' -f4)
    role=$(echo "$response" | grep -o '"role":"[^"]*"' | cut -d'"' -f4)
    plan=$(echo "$response" | grep -o '"plan":"[^"]*"' | cut -d'"' -f4)
    
    if [ -n "$token" ] && [ "$token" != "null" ]; then
        echo -e "${GREEN}  ✅ Login successful!${NC}"
        echo -e "  👤 Name: $name"
        echo -e "  🎭 Role: $role"
        echo -e "  💎 Plan: $plan"
        
        echo "# $user_type User" >> "$TOKEN_FILE"
        echo "TOKEN_${user_type}=\"$token\"" >> "$TOKEN_FILE"
        echo "USER_${user_type}_EMAIL=\"$email\"" >> "$TOKEN_FILE"
        echo "USER_${user_type}_NAME=\"$name\"" >> "$TOKEN_FILE"
        echo "USER_${user_type}_ROLE=\"$role\"" >> "$TOKEN_FILE"
        echo "USER_${user_type}_PLAN=\"$plan\"" >> "$TOKEN_FILE"
        echo "" >> "$TOKEN_FILE"
        
        return 0
    else
        echo -e "${RED}  ❌ Login failed!${NC}"
        echo -e "  Response: $response"
        return 1
    fi
}

echo -e "${BLUE}📝 Processing logins...${NC}\n"

login_and_save "rudysetiawan111@gmail.com" "@Rs101185" "PREMIUM"
login_and_save "marga.jaya.bird.shop@gmail.com" "@Rs101185" "PRO"
login_and_save "autolive1.0.0@gmail.com" "@Rs101185" "FREE"

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ All tokens saved to: $TOKEN_FILE${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📄 Token file content:${NC}"
cat "$TOKEN_FILE"

echo -e "\n${GREEN}💡 To use tokens:${NC}"
echo -e "  source $TOKEN_FILE"
echo -e "  curl -H \"Authorization: Bearer \$TOKEN_PREMIUM\" $BASE_URL/api/auth/profile"
