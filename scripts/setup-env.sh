#!/bin/bash

# Check if .env exists
if [ -f .env ]; then
    echo ".env file already exists. Please remove it first if you want to create a new one."
    exit 1
fi

# Create .env file
cat > .env << EOL
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aianonymizer"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Groq API Keys (JSON array of keys)
GROQ_API_KEYS='["your-groq-api-key-here"]'

# Admin User (for initial setup)
ADMIN_EMAIL=admin@aianonymizer.com
ADMIN_PASSWORD=admin123-change-me

# Rate Limiting
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX_REQUESTS=60
EOL

echo "Created .env file with default values"
echo "Please edit .env and update the values before continuing"
