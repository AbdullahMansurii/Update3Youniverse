# Supabase Setup Guide for Youniverse

## Step-by-Step Setup Instructions

### 1. Create Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Click "New Project"
3. Select your organization (create one if needed)
4. Fill in project details:
   - **Name**: `youniverse`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your target users
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### 2. Get Project Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public key** (long string starting with `eyJ`)

### 3. Configure Environment Variables

1. In your project, update `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Run Database Migration

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `supabase/migrations/create_initial_schema.sql`
3. Paste it into the SQL Editor
4. Click **Run** to execute

This will create:
- All necessary tables (profiles, connections, messages, posts, etc.)
- Row Level Security policies
- Database functions and triggers
- Proper indexes for performance

### 5. Enable Authentication Providers

#### Email/Password (Already enabled by default)
- Users can sign up with email/password
- Email confirmation is disabled for easier testing

#### Google OAuth (Optional)
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
4. Add authorized redirect URLs

### 6. Test Your Setup

1. Start your development server: `npm run dev`
2. Try creating an account
3. Check if data appears in your Supabase dashboard under **Table Editor**

### 7. Security Configuration

The migration sets up these security rules:
- ✅ Users can only edit their own profiles
- ✅ Users can view all student profiles for discovery
- ✅ Messages are private between participants
- ✅ Connection requests work bidirectionally
- ✅ Posts are public but users can only edit their own

### Troubleshooting

**Issue**: "Invalid API key"
- **Solution**: Double-check your environment variables

**Issue**: "Row Level Security policy violation"
- **Solution**: Ensure the migration ran completely

**Issue**: "Table doesn't exist"
- **Solution**: Re-run the migration SQL

**Issue**: Authentication not working
- **Solution**: Check if email confirmation is disabled in Auth settings

### Next Steps

Once setup is complete:
1. Test user registration and login
2. Create test profiles with different roles
3. Test the connection and messaging features
4. Deploy to production when ready

Your Youniverse platform will now have a fully functional database backend with real-time capabilities!