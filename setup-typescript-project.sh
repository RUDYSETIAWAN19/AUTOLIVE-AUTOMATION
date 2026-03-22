#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}════════════════════════════════════════════${NC}"
echo -e "${BLUE}     Setup TypeScript Project${NC}"
echo -e "${BLUE}════════════════════════════════════════════${NC}\n"

# Buat folder src
echo -e "${YELLOW}📁 Creating src folder...${NC}"
mkdir -p backend/src

# Buat file index.ts dasar
echo -e "${YELLOW}📝 Creating base TypeScript file...${NC}"
cat > backend/src/index.ts << 'EOF'
/**
 * AutoLive Automation Backend
 * Main application entry point
 */

import express from 'express';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'AutoLive API is running' });
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});

export default app;
