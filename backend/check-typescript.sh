#!/bin/bash

echo "Checking TypeScript in backend..."

if [ -d "backend/node_modules/typescript" ]; then
    echo "✅ TypeScript found in backend"
    cd backend && npx tsc --noEmit
else
    echo "❌ TypeScript not installed in backend"
    echo "Installing TypeScript in backend..."
    cd backend && npm install --save-dev typescript
    echo "✅ TypeScript installed"
    npx tsc --noEmit
fi
