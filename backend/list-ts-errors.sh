#!/bin/bash

cd backend

echo "Listing all TypeScript errors..."
echo "================================"
echo ""

# Run tsc and format output
npx tsc --noEmit 2>&1 | grep -E "error TS[0-9]+" | while read -r line; do
    # Extract filename
    file=$(echo "$line" | cut -d'(' -f1)
    # Extract error code
    error_code=$(echo "$line" | grep -o "TS[0-9]*")
    # Extract error message
    message=$(echo "$line" | sed 's/.*error '"$error_code"': //')
    
    echo "📄 File: $file"
    echo "🔴 Error: $error_code"
    echo "💬 Message: $message"
    echo "---"
done

# Summary
total_errors=$(npx tsc --noEmit 2>&1 | grep -c "error TS")
echo ""
echo "Total errors: $total_errors"
