#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Complete TypeScript Setup${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Step 1: Install TypeScript
echo -e "${YELLOW}Step 1: Installing TypeScript...${NC}"
./install-typescript.sh

# Step 2: Check if scripts exist
echo -e "\n${YELLOW}Step 2: Checking scripts...${NC}"
if [ ! -f "scripts/check-typescript.sh" ]; then
    echo -e "${RED}Script not found! Please create scripts first${NC}"
    exit 1
fi

# Step 3: Make scripts executable
echo -e "\n${YELLOW}Step 3: Making scripts executable...${NC}"
chmod +x scripts/*.sh
chmod +x *.sh 2>/dev/null

# Step 4: Test TypeScript check
echo -e "\n${YELLOW}Step 4: Testing TypeScript check...${NC}"
./scripts/check-typescript.sh

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ Setup complete! TypeScript check passed.${NC}"
    echo -e "\n${GREEN}Available commands:${NC}"
    echo "  ./scripts/check-typescript.sh  # Check TypeScript errors"
    echo "  ./push-to-github.sh            # Push with auto-check"
    echo "  npm run type-check             # Run check via npm"
else
    echo -e "\n${RED}⚠️  Setup complete but TypeScript errors found.${NC}"
    echo "Please fix errors before pushing to GitHub."
fi

echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
