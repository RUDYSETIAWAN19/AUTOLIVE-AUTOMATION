#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Push to GitHub with TypeScript Check${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Jalankan TypeScript check
echo -e "${YELLOW}🔍 Running TypeScript check...${NC}\n"

if ./scripts/check-typescript.sh; then
    echo -e "\n${GREEN}✅ TypeScript check passed!${NC}"
    
    # Git add
    echo -e "\n${YELLOW}📦 Adding files to git...${NC}"
    git add .
    
    # Git commit
    echo -e "\n${YELLOW}💬 Enter commit message (default: Update code):${NC}"
    read commit_message
    
    if [ -z "$commit_message" ]; then
        commit_message="Update code"
    fi
    
    git commit -m "$commit_message"
    
    # Git push
    echo -e "\n${YELLOW}🚀 Pushing to GitHub...${NC}"
    git push
    
    echo -e "\n${GREEN}✅ Successfully pushed to GitHub!${NC}"
else
    echo -e "\n${RED}❌ TypeScript check failed! Please fix errors before pushing.${NC}"
    exit 1
fi
