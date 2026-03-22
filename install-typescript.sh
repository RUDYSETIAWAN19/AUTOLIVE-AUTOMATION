#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Install TypeScript Dependencies${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Install TypeScript di backend
echo -e "${YELLOW}📦 Installing TypeScript in backend...${NC}"
cd backend

if [ -f "package.json" ]; then
    npm install --save-dev typescript @types/node @types/express
    echo -e "${GREEN}✅ TypeScript installed in backend${NC}"
else
    echo -e "${RED}❌ package.json not found in backend${NC}"
fi

cd ..

# Install TypeScript di root untuk scripts
echo -e "\n${YELLOW}📦 Installing TypeScript in root...${NC}"
npm install --save-dev typescript

echo -e "\n${GREEN}✅ All TypeScript dependencies installed!${NC}"
