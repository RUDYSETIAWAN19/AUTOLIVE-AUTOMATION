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

# Buat file index.ts
echo -e "${YELLOW}📝 Creating TypeScript file...${NC}"
cat > backend/src/index.ts << 'END'
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
END

# Buat tsconfig.json
echo -e "${YELLOW}⚙️  Creating tsconfig.json...${NC}"
cat > backend/tsconfig.json << 'END'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
END

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
cd backend

if [ ! -f "package.json" ]; then
    npm init -y
fi

npm install express
npm install --save-dev typescript @types/node @types/express

cd ..

echo -e "\n${GREEN}✅ TypeScript project setup complete!${NC}"
echo -e "\n${YELLOW}Files created:${NC}"
ls -la backend/src/
echo ""
ls -la backend/tsconfig.json
