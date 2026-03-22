#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}          AUTOLIVE AUTOMATION${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Kill existing processes
echo -e "${YELLOW}Stopping existing servers...${NC}"
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend
echo -e "${YELLOW}Starting Backend Server on port 5001...${NC}"
cd backend
node src/index.ts &
BACKEND_PID=$!
cd ..

sleep 2

# Check backend
if curl -s http://localhost:5001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
fi

# Start frontend
echo -e "${YELLOW}Starting Frontend Server on port 3000...${NC}"
cd frontend
python3 -m http.server 3000 &
FRONTEND_PID=$!
cd ..

sleep 2

echo -e "\n${GREEN}════════════════════════════════════════════${NC}"
echo -e "${GREEN}          SERVERS ARE RUNNING!${NC}"
echo -e "${GREEN}════════════════════════════════════════════${NC}"
echo -e "${BLUE}Frontend: http://localhost:3000/login.html${NC}"
echo -e "${BLUE}Backend:  http://localhost:5001${NC}"
echo -e "${BLUE}Health:   http://localhost:5001/api/health${NC}"
echo -e "\n${YELLOW}📱 TEST ACCOUNTS:${NC}"
echo -e "  👑 ADMIN: rudysetiawan111@gmail.com / @Rs101185"
echo -e "  💎 PRO:   marga.jaya.bird.shop@gmail.com / @Rs101185"
echo -e "  🆓 FREE:  autolive1.0.0@gmail.com / @Rs101185"
echo -e "\n${YELLOW}🔧 SOCIAL LOGIN:${NC}"
echo -e "  Google, YouTube, Facebook, Instagram, TikTok"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}"

wait $BACKEND_PID $FRONTEND_PID
