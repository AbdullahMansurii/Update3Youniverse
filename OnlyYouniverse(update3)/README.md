# Youniverse - Student Connection Platform

A platform connecting Indian students in India with those studying abroad for peer-to-peer guidance.

## 🚀 Quick Setup

### 1. Supabase Database Setup

1. **Create a Supabase Project**:
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: "youniverse"
   - Set a strong database password
   - Select a region close to your users

2. **Get Your Project Credentials**:
   - Go to Project Settings → API
   - Copy your `Project URL`
   - Copy your `anon/public` key

3. **Update Environment Variables**:
   - Rename `.env.local` to match your actual values
   - Replace `your_supabase_project_url_here` with your Project URL
   - Replace `your_supabase_anon_key_here` with your anon key

4. **Run Database Migration**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy and paste the SQL from `supabase/migrations/create_initial_schema.sql`
   - Click "Run" to create all tables and security policies

### 2. Authentication Setup

1. **Enable Google OAuth** (Optional):
   - Go to Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials

2. **Configure Email Settings**:
   - Go to Authentication → Settings
   - Configure your SMTP settings for email verification

### 3. Row Level Security

The migration automatically sets up RLS policies for:
- ✅ Users can only edit their own profiles
- ✅ Users can view all public profiles
- ✅ Messages are private between sender/receiver
- ✅ Connection requests work bidirectionally
- ✅ Posts are public but users can only edit their own

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 📊 Database Schema

### Tables Created:
- **profiles** - User profiles and academic information
- **connections** - Friend requests and connections
- **messages** - Real-time messaging system
- **posts** - Community posts and content
- **post_likes** - Post engagement tracking
- **notifications** - Real-time notification system

### Key Features:
- 🔐 Row Level Security for data protection
- 🔄 Real-time subscriptions for messaging
- 📱 Responsive design with dark/light mode
- 🎯 Advanced search and filtering
- 💬 Instagram-style messaging
- 🤝 LinkedIn-style connections

## 🎨 Design System

- **Primary**: Pastel Blue (#4A90E2)
- **Secondary**: Soft Orange (#FFA552)
- **Typography**: Inter font family
- **Spacing**: 8px grid system
- **Components**: shadcn/ui with Tailwind CSS

## 🚀 Deployment

Ready for deployment on Vercel, Netlify, or any Next.js hosting platform.

## 📝 Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```