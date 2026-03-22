#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Starting AutoLive Automation${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Kill existing processes on ports 5001 and 3000
echo -e "${YELLOW}🔍 Checking for existing processes...${NC}"
lsof -ti:5001 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start backend
echo -e "${YELLOW}🚀 Starting Backend Server on port 5001...${NC}"
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo -e "${GREEN}✅ Backend server is running${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
fi

# Start frontend
echo -e "${YELLOW}🌐 Starting Frontend Server on port 3000...${NC}"
cd backend
npm run frontend &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
sleep 2

echo -e "\n${GREEN}✅ Servers started!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000/login.html${NC}"
echo -e "${GREEN}Backend:  http://localhost:5001${NC}"
echo -e "${GREEN}Health:   http://localhost:5001/api/health${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "\n${YELLOW}💡 Test Accounts:${NC}"
echo -e "  Admin:  rudysetiawan111@gmail.com / @Rs101185"
echo -e "  Pro:    marga.jaya.bird.shop@gmail.com / @Rs101185"
echo -e "  Free:   autolive1.0.0@gmail.com / @Rs101185"
echo -e "\n${YELLOW}Press Ctrl+C to stop all servers${NC}"

# Wait for user to press Ctrl+C
wait $BACKEND_PID $FRONTEND_PID 2>/dev/null
