#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${BLUE}   TypeScript Error Checker${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}\n"

# Cek di backend
if [ -d "backend" ]; then
    echo -e "${YELLOW}📁 Checking backend...${NC}"
    cd backend
    
    if [ -f "tsconfig.json" ]; then
        echo -e "${BLUE}→ Running tsc --noEmit${NC}\n"
        
        # Run tsc and capture output
        error_output=$(npx tsc --noEmit 2>&1)
        exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            echo -e "${GREEN}✅ No TypeScript errors found in backend!${NC}"
        else
            echo -e "${RED}❌ TypeScript errors found in backend:${NC}\n"
            echo "$error_output" | while IFS= read -r line; do
                if [[ $line == *"error"* ]]; then
                    echo -e "${RED}$line${NC}"
                else
                    echo "$line"
                fi
            done
            
            # Count errors
            error_count=$(echo "$error_output" | grep -c "error TS")
            echo -e "\n${RED}Total errors: $error_count${NC}"
        fi
    else
        echo -e "${RED}❌ tsconfig.json not found in backend${NC}"
    fi
    
    cd ..
else
    echo -e "${RED}❌ backend folder not found${NC}"
fi

echo -e "\n${BLUE}════════════════════════════════════════${NC}"
