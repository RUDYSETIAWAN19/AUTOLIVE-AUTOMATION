#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Testing API Endpoints${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Test health endpoint
echo -e "${YELLOW}1. Testing Health Check...${NC}"
curl -s http://localhost:5001/api/health | jq '.'
echo ""

# Test login
echo -e "${YELLOW}2. Testing Login (Admin)...${NC}"
curl -s -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"rudysetiawan111@gmail.com","password":"@Rs101185"}' | jq '.'
echo ""

# Test users endpoint
echo -e "${YELLOW}3. Testing Users Endpoint...${NC}"
curl -s http://localhost:5001/api/users | jq '.'
echo ""

echo -e "${GREEN}✅ API Test Complete${NC}"
