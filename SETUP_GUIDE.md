# EasyPG Local Setup Guide

## Quick Setup Steps

### 1. Prerequisites
- Node.js 18+ installed
- Supabase account created

### 2. Project Setup
\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

### 3. Supabase Configuration

#### A. Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project: "EasyPG"
3. Wait for setup to complete

#### B. Get Credentials
1. Go to Settings → API
2. Copy:
   - Project URL
   - anon public key

#### C. Configure Environment
Create `.env.local` file:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. Database Setup

#### A. Disable Email Confirmation
1. Supabase Dashboard → Authentication → Settings
2. Turn OFF "Enable email confirmations"
3. Save changes

#### B. Run Database Script
1. Copy content from `scripts/fix-database-setup.sql`
2. Paste in Supabase SQL Editor
3. Execute script

### 5. Access Admin Panel
1. Go to: `http://localhost:3000/admin-login`
2. Enter: `admin@easypg.com`
3. Click "Access Admin Panel"

## Troubleshooting

### "Admin user not found"
- Make sure you ran the database script
- Check Supabase SQL Editor for errors
- Verify the admin user exists in the users table

### "Auth state errors"
- These are normal during development
- Admin login bypasses regular authentication
- Check browser console for detailed logs

### "Failed to fetch"
- Verify .env.local has correct Supabase credentials
- Check if Supabase project is active (not paused)

## Test Users
After setup, you can test with:
- student1@test.com
- owner1@test.com
- admin@easypg.com (admin access)

## Features Available
- ✅ User Management
- ✅ Property Management  
- ✅ Admin Dashboard
- ✅ Registration System
- ✅ Search & Filter
