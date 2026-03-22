#!/bin/bash

echo "Setting up TypeScript check system..."

# Buat folder scripts
mkdir -p scripts

# Install husky untuk pre-commit
npm install --save-dev husky
npx husky install

# Buat pre-commit hook
npx husky add .husky/pre-commit "npm run type-check"

# Install TypeScript di backend
cd backend
npm install --save-dev typescript @types/node
cd ..

# Install TypeScript di frontend jika ada
if [ -d "frontend" ]; then
    cd frontend
    npm install --save-dev typescript @types/react
    cd ..
fi

echo "✅ TypeScript check system setup complete!"
echo ""
echo "To use:"
echo "  ./scripts/check-typescript.sh  # Manual check"
echo "  ./push-to-github.sh            # Auto check before push"
