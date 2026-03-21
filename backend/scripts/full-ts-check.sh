#!/bin/bash

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

check_directory() {
    local dir=$1
    local name=$2
    
    if [ -d "$dir" ]; then
        echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}📁 Checking $name...${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
        
        cd "$dir"
        
        if [ -f "tsconfig.json" ]; then
            # Run TypeScript check
            output=$(npx tsc --noEmit --pretty false 2>&1)
            exit_code=$?
            
            if [ $exit_code -eq 0 ]; then
                echo -e "${GREEN}✅ No TypeScript errors found in $name${NC}"
            else
                echo -e "${RED}❌ TypeScript errors found in $name:${NC}\n"
                echo "$output" | while IFS= read -r line; do
                    if [[ $line == *"error"* ]]; then
                        echo -e "${RED}  $line${NC}"
                    elif [[ $line == *"warning"* ]]; then
                        echo -e "${YELLOW}  $line${NC}"
                    else
                        echo "  $line"
                    fi
                done
                
                # Summary
                error_count=$(echo "$output" | grep -c "error TS")
                file_count=$(echo "$output" | grep -E "\.ts\([0-9]+,[0-9]+\)" | cut -d'(' -f1 | sort -u | wc -l)
                
                echo -e "\n${RED}📊 Summary:${NC}"
                echo -e "  Total errors: ${RED}$error_count${NC}"
                echo -e "  Files with errors: ${RED}$file_count${NC}"
            fi
        else
            echo -e "${RED}❌ tsconfig.json not found in $name${NC}"
        fi
        
        cd ..
    fi
}

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Full TypeScript Error Checker${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}"

# Check backend
check_directory "backend" "Backend"

# Check frontend if exists
if [ -d "frontend" ]; then
    check_directory "frontend" "Frontend"
fi

# Check shared if exists
if [ -d "shared" ]; then
    check_directory "shared" "Shared"
fi

echo -e "\n${BLUE}════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TypeScript check completed!${NC}"
