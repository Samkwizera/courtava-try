# Supabase Authentication Troubleshooting Guide

## 🔍 Current Status

Your app is running at: **http://localhost:8082**

## ✅ What's Configured:

- ✅ Project ID: `bbgwtqruaevqrmmqhtlh`
- ✅ Project URL: `https://bbgwtqruaevqrmmqhtlh.supabase.co`
- ✅ API Key: Configured (JWT format)
- ✅ Supabase client: Properly initialized

## 🐛 Common Authentication Issues & Solutions:

### Issue 1: "Invalid API Key" or "401 Unauthorized"

**Solution:**
1. Go to: https://supabase.com/dashboard/project/bbgwtqruaevqrmmqhtlh/settings/api
2. Copy the **anon/public** key (NOT the service_role key)
3. Make sure it's the long JWT token starting with `eyJ`
4. Update `.env` file
5. Restart dev server

### Issue 2: "Project not found" or "404"

**Solution:**
1. Verify your project is active in Supabase dashboard
2. Check the project URL matches: `https://bbgwtqruaevqrmmqhtlh.supabase.co`
3. Make sure project hasn't been paused (free tier projects pause after inactivity)

### Issue 3: Email confirmation required

**Solution:**
1. Go to: https://supabase.com/dashboard/project/bbgwtqruaevqrmmqhtlh/auth/users
2. Check if users need email confirmation
3. Disable email confirmation for testing:
   - Go to Authentication → Settings → Email Auth
   - Toggle "Enable email confirmations" OFF

### Issue 4: RLS (Row Level Security) blocking access

**Solution:**
1. Go to: https://supabase.com/dashboard/project/bbgwtqruaevqrmmqhtlh/editor
2. Check if RLS is enabled on tables
3. Verify policies allow authenticated users to read/write
4. Check the migration files in `supabase/migrations/` for policies

### Issue 5: CORS errors

**Solution:**
1. Make sure you're accessing from `localhost` (not 127.0.0.1)
2. Check Supabase project settings for allowed origins
3. Restart dev server after any .env changes

## 🧪 How to Test Connection:

### Method 1: Browser Console

1. Open http://localhost:8082
2. Open browser console (F12)
3. Type:
```javascript
// Check if Supabase is loaded
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.substring(0, 20));
```

### Method 2: Test Sign Up

1. Go to http://localhost:8082/auth
2. Try to create a new account
3. Check browser console for errors
4. Check Network tab for failed requests

### Method 3: Check Supabase Dashboard

1. Go to: https://supabase.com/dashboard/project/bbgwtqruaevqrmmqhtlh/auth/users
2. Try to sign up in your app
3. See if user appears in dashboard
4. Check for any error messages

## 📋 Checklist:

- [ ] .env file exists and has correct values
- [ ] Dev server restarted after .env changes
- [ ] Supabase project is active (not paused)
- [ ] API key is the anon/public key (JWT format)
- [ ] Email confirmation is disabled (for testing)
- [ ] RLS policies are configured correctly
- [ ] Browser console shows no CORS errors

## 🔑 Correct .env Format:

```bash
VITE_SUPABASE_PROJECT_ID="bbgwtqruaevqrmmqhtlh"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJiZ3d0cXJ1YWV2cXJtbXFodGxoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwMTgzMzcsImV4cCI6MjA4NTU5NDMzN30.s3CqT4xRvC3XPpo4LjHPiN5dNQjeUzvTD7O6tJCuw0c"
VITE_SUPABASE_URL="https://bbgwtqruaevqrmmqhtlh.supabase.co"
```

## 🆘 Still Having Issues?

Please provide:
1. The exact error message you're seeing
2. Where you see it (browser console, network tab, UI)
3. What action triggers it (sign up, sign in, page load)
4. Screenshot if possible

## 🔧 Quick Fixes:

### Clear browser cache and localStorage:
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Restart everything:
```bash
# Stop dev server (Ctrl+C)
# Then run:
npm run dev
```

### Verify Supabase is reachable:
Open in browser: https://bbgwtqruaevqrmmqhtlh.supabase.co/rest/v1/

You should see a JSON response (not an error page).
