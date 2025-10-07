#!/bin/bash

# EasyPG Local Setup Script
# Run this script to set up the project locally

echo "🚀 Setting up EasyPG locally..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  Creating .env.local file..."
    cat > .env.local << EOL
# Supabase Configuration
# Replace these with your actual Supabase project credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Instructions:
# 1. Go to https://supabase.com/dashboard
# 2. Create a new project
# 3. Go to Settings > API
# 4. Copy your Project URL and anon public key
# 5. Replace the values above
EOL
    echo "📝 Created .env.local file. Please update it with your Supabase credentials."
else
    echo "✅ .env.local file already exists"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Run the database setup scripts in Supabase SQL Editor"
echo "3. Make yourself an admin user"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📖 See README.md for detailed instructions"
