#!/bin/bash

BASE_URL="http://localhost:5001"

echo "Setting up all test users..."

# Array of users: email,password,name,role,plan
users=(
    "rudysetiawan111@gmail.com:@Rs101185:Rudy Setiawan:admin:premium"
    "marga.jaya.bird.shop@gmail.com:@Rs101185:Marga Jaya:user:pro"
    "autolive1.0.0@gmail.com:@Rs101185:Auto Live:user:free"
)

for user in "${users[@]}"; do
    IFS=':' read -r email password name role plan <<< "$user"
    
    echo "Creating $role ($plan): $email"
    
    # Try register
    curl -s -X POST "$BASE_URL/api/auth/register" \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$email\",\"password\":\"$password\",\"name\":\"$name\",\"role\":\"$role\",\"plan\":\"$plan\"}" \
        | jq -r '.message // .error // "Created/Exists"'
    
    echo "---"
done

echo "Done! Running auto_login.sh..."
./auto_login.sh
