#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}⚠️  Skipping TypeScript check...${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Git add
echo -e "${YELLOW}📦 Adding files to git...${NC}"
git add .

# Git commit
echo -e "${YELLOW}💬 Enter commit message:${NC}"
read commit_message

if [ -z "$commit_message" ]; then
    commit_message="Update code (skip TypeScript check)"
fi

git commit -m "$commit_message"

# Git push
echo -e "\n${YELLOW}🚀 Pushing to GitHub...${NC}"
git push

echo -e "\n${GREEN}✅ Successfully pushed to GitHub!${NC}"
