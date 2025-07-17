# Authentication Flow Troubleshooting Guide

## Issue Description
After successful login or signup, users should be redirected to the dashboard/home page but remain on the landing page instead.

## Expected vs Current Behavior

### Expected Behavior
1. **Login Flow:**
   - User enters credentials on landing page
   - Clicks "Sign In" button
   - Authentication succeeds
   - User is automatically redirected to dashboard (`/` with authenticated state)
   - Dashboard component renders instead of landing page

2. **Signup Flow:**
   - User enters details on landing page
   - Clicks "Create Account" button
   - Account creation succeeds
   - User profile is created in database
   - User is automatically redirected to dashboard
   - Dashboard component renders

### Current Behavior
- Authentication appears successful (no error messages)
- Modal closes after login/signup
- User remains on landing page
- Dashboard does not render

## Authentication Implementation Details

### Authentication Method
- **Provider:** Supabase Auth
- **Method:** JWT-based authentication with session management
- **Storage:** Browser localStorage/sessionStorage via Supabase client
- **Session Persistence:** Automatic via Supabase auth state management

### Client-Side Routing
- **Framework:** Next.js 13+ with App Router
- **Routing Type:** File-based routing with conditional rendering
- **Main Route:** `/` (app/page.tsx) conditionally renders LandingPage or Dashboard based on auth state

## Code Analysis

### Current Authentication Context (`contexts/auth-context.tsx`)

```typescript
// Auth state management
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(true);

// Session initialization
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      loadUserProfile(session.user);
    }
    setIsLoading(false);
  });

  // Auth state listener
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }
  );

  return () => subscription.unsubscribe();
}, []);
```

### Login Handler
```typescript
const login = async (email: string, password: string) => {
  setIsLoading(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    // No explicit redirect - relies on auth state change
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### Signup Handler
```typescript
const register = async (email: string, password: string, name: string) => {
  setIsLoading(true);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          email,
          name,
          role: 'student_in_india',
          country: 'India',
        });
      
      if (profileError) throw profileError;
    }
    // No explicit redirect - relies on auth state change
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

### Main Page Component (`app/page.tsx`)
```typescript
export default function Home() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return user ? <Dashboard /> : <LandingPage />;
}
```

## Potential Issues & Debugging Steps

### 1. Profile Loading Issues

**Issue:** User authentication succeeds but profile loading fails, causing `user` to remain `null`.

**Debug Steps:**
```javascript
// Add to loadUserProfile function
const loadUserProfile = async (supabaseUser: SupabaseUser) => {
  console.log('🔍 Loading profile for user:', supabaseUser.id);
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    console.log('📊 Profile query result:', { profile, error });

    if (error && error.code !== 'PGRST116') {
      console.error('❌ Profile loading error:', error);
      return;
    }

    if (profile) {
      console.log('✅ Profile loaded successfully:', profile);
      setUser({...}); // existing user mapping
    } else {
      console.log('⚠️ No profile found for user');
    }
  } catch (error) {
    console.error('💥 Profile loading exception:', error);
  }
};
```

### 2. Auth State Change Timing

**Issue:** Auth state changes but component doesn't re-render properly.

**Debug Steps:**
```javascript
// Add to auth context useEffect
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  async (event, session) => {
    console.log('🔄 Auth state change:', event, session?.user?.id);
    
    if (session?.user) {
      console.log('👤 User session found, loading profile...');
      await loadUserProfile(session.user);
    } else {
      console.log('🚪 No user session, clearing user state');
      setUser(null);
    }
    setIsLoading(false);
  }
);
```

### 3. Database Profile Creation

**Issue:** Profile creation fails during signup, preventing proper user state.

**Debug Steps:**
```javascript
// Add to register function
if (data.user) {
  console.log('👤 Creating profile for user:', data.user.id);
  
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: data.user.id,
      email,
      name,
      role: 'student_in_india',
      country: 'India',
    });
  
  console.log('📝 Profile creation result:', profileError);
  
  if (profileError) {
    console.error('❌ Profile creation failed:', profileError);
    throw profileError;
  }
  
  console.log('✅ Profile created successfully');
}
```

### 4. Modal State Management

**Issue:** Modal closes but auth state hasn't updated yet.

**Debug Steps:**
```javascript
// In AuthModal component
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (mode === "login") {
      console.log('🔐 Attempting login...');
      await login(email, password);
      console.log('✅ Login successful');
      toast.success("Welcome back!");
    } else {
      console.log('📝 Attempting signup...');
      await register(email, password, name);
      console.log('✅ Signup successful');
      toast.success("Account created successfully!");
    }
    
    // Don't close modal immediately - wait for auth state
    console.log('⏳ Waiting for auth state update...');
    
    // Optional: Add a small delay to ensure auth state propagates
    setTimeout(() => {
      onOpenChange(false);
    }, 500);
    
  } catch (error) {
    console.error('❌ Auth error:', error);
    toast.error("Something went wrong. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

## Browser Console Debugging Checklist

When testing authentication, check for these console logs:

### During Login/Signup:
- [ ] `🔐 Attempting login...` or `📝 Attempting signup...`
- [ ] `✅ Login successful` or `✅ Signup successful`
- [ ] `🔄 Auth state change: SIGNED_IN`
- [ ] `👤 User session found, loading profile...`
- [ ] `🔍 Loading profile for user: [user-id]`
- [ ] `📊 Profile query result: { profile: {...}, error: null }`
- [ ] `✅ Profile loaded successfully`

### Expected Network Requests:
- [ ] POST to Supabase auth endpoint (login/signup)
- [ ] GET to profiles table (profile loading)
- [ ] WebSocket connection for real-time subscriptions

### Common Error Patterns:
- [ ] `❌ Profile loading error: {...}` - Database/RLS issues
- [ ] `⚠️ No profile found for user` - Profile not created
- [ ] `💥 Profile loading exception` - Network/connection issues
- [ ] Auth state change events not firing - Supabase client issues

## Quick Fixes to Try

### 1. Add Explicit Redirect Logic
```typescript
// In AuthModal after successful auth
const handleSubmit = async (e: React.FormEvent) => {
  // ... existing code ...
  
  try {
    if (mode === "login") {
      await login(email, password);
      // Wait for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Welcome back!");
    }
    // ... rest of code
  }
};
```

### 2. Force Re-render After Auth
```typescript
// In main page component
const [authKey, setAuthKey] = useState(0);

useEffect(() => {
  if (user) {
    setAuthKey(prev => prev + 1);
  }
}, [user]);

return (
  <div key={authKey}>
    {user ? <Dashboard /> : <LandingPage />}
  </div>
);
```

### 3. Check Supabase Configuration
- Verify `.env.local` has correct Supabase URL and anon key
- Ensure RLS policies allow profile reading
- Check if email confirmation is disabled in Supabase settings

## Next Steps

1. **Add Debug Logging:** Implement the console.log statements above
2. **Test Authentication:** Try login/signup and monitor browser console
3. **Check Database:** Verify profiles are being created in Supabase dashboard
4. **Verify RLS Policies:** Ensure authenticated users can read their profiles
5. **Test Network:** Check if API calls are succeeding in Network tab

If issues persist after debugging, the problem is likely in:
- Database RLS policies preventing profile access
- Supabase client configuration
- Profile creation logic during signup
- Auth state synchronization timing