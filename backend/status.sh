#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Project Status Check${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

echo -e "${YELLOW}📁 Directory Structure:${NC}"
echo "Root files: $(ls -1 *.sh 2>/dev/null | wc -l) scripts"
echo "Scripts folder: $(ls -1 scripts/*.sh 2>/dev/null | wc -l) files"

echo -e "\n${YELLOW}📦 Backend Status:${NC}"
if [ -d "backend/src" ]; then
    ts_files=$(find backend/src -name "*.ts" 2>/dev/null | wc -l)
    echo "TypeScript files: $ts_files"
else
    echo "src folder not found"
fi

echo -e "\n${YELLOW}🔍 Git Status:${NC}"
git status --short | head -10

echo -e "\n${YELLOW}💡 Available Commands:${NC}"
echo "  ./push-quick.sh        - Push without TypeScript check"
echo "  ./push-to-github.sh    - Push with TypeScript check"
echo "  ./scripts/check-typescript.sh - Check TypeScript errors"
echo "  ./status.sh            - Show this status"
