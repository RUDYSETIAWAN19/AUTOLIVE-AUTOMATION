#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     TypeScript Error Checker${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

# Cek backend
if [ -d "backend" ]; then
    echo -e "\n${YELLOW}📁 Checking Backend...${NC}"
    cd backend
    
    if [ -f "tsconfig.json" ]; then
        echo -e "${BLUE}→ Running tsc --noEmit${NC}\n"
        
        # Jalankan TypeScript check
        if npx tsc --noEmit 2>&1; then
            echo -e "\n${GREEN}✅ No TypeScript errors found in backend!${NC}"
            cd ..
            exit 0
        else
            echo -e "\n${RED}❌ TypeScript errors found in backend!${NC}"
            cd ..
            exit 1
        fi
    else
        echo -e "${RED}❌ tsconfig.json not found in backend${NC}"
        cd ..
        exit 1
    fi
else
    echo -e "${RED}❌ backend folder not found${NC}"
    exit 1
fi
