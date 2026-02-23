# 🚀 New Supabase Project Setup Guide

## ✅ Step 1: Environment Configuration (DONE)

Your `.env` file has been updated with the new project credentials:

```bash
Project ID: dzqtsprnxqhknvqgzybx
URL: https://dzqtsprnxqhknvqgzybx.supabase.co
API Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 📋 Step 2: Run Database Setup

### Option A: Via Supabase Dashboard (Recommended)

1. **Go to SQL Editor:**
   - Visit: https://supabase.com/dashboard/project/dzqtsprnxqhknvqgzybx/sql/new

2. **Copy the SQL:**
   - Open the file: `supabase/NEW_PROJECT_SETUP.sql`
   - Copy ALL the SQL code

3. **Run the SQL:**
   - Paste into the SQL Editor
   - Click **Run** or press `Ctrl+Enter`
   - Wait for "Success" message

4. **Verify Tables Created:**
   - Go to: https://supabase.com/dashboard/project/dzqtsprnxqhknvqgzybx/editor
   - You should see these tables:
     - ✅ profiles
     - ✅ check_ins
     - ✅ communities
     - ✅ community_members
     - ✅ courts

### Option B: Via Supabase CLI

```bash
# Make sure you're in the project directory
cd c:\Users\samue\Desktop\courtava-try

# Link to your new project
supabase link --project-ref dzqtsprnxqhknvqgzybx

# Push migrations
supabase db push
```

## 🔧 Step 3: Configure Authentication Settings

1. **Disable Email Confirmation (for testing):**
   - Go to: https://supabase.com/dashboard/project/dzqtsprnxqhknvqgzybx/auth/settings
   - Scroll to "Email Auth"
   - Toggle **OFF**: "Enable email confirmations"
   - Click **Save**

2. **Configure Email Templates (optional):**
   - Go to: https://supabase.com/dashboard/project/dzqtsprnxqhknvqgzybx/auth/templates
   - Customize confirmation and password reset emails

3. **Set Site URL:**
   - Go to: https://supabase.com/dashboard/project/dzqtsprnxqhknvqgzybx/auth/url-configuration
   - Set Site URL to: `http://localhost:8080`
   - Add Redirect URLs: `http://localhost:8080/**`

## 🎨 Step 4: Restart Your Dev Server

The dev server needs to restart to load the new environment variables:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then run:
npm run dev
```

Or I can restart it for you automatically.

## 🧪 Step 5: Test the Setup

1. **Open your app:**
   - Go to: http://localhost:8080

2. **Test Sign Up:**
   - Navigate to: http://localhost:8080/auth
   - Create a new account
   - You should be able to sign up without email confirmation

3. **Test Profile:**
   - After signing up, go to: http://localhost:8080/profile
   - Click "Edit Profile"
   - Fill in your details
   - Click "Save"
   - Verify data persists

4. **Check Database:**
   - Go to: https://supabase.com/dashboard/project/dzqtsprnxqhknvqgzybx/editor
   - Click on `profiles` table
   - You should see your profile data

## 📊 What's Been Set Up

### Tables Created:

1. **profiles** - User profiles with basketball info
   - display_name, location, bio
   - position, skill_level, height
   - play_styles[], availability[]

2. **check_ins** - Court check-ins (4-hour expiration)
   - Links users to courts
   - Realtime enabled

3. **communities** - Basketball groups/communities
   - Name, description, schedule
   - Linked to courts

4. **community_members** - Community membership
   - Links users to communities

5. **courts** - Basketball court locations
   - Name, address, coordinates
   - Amenities (lights, water, parking)

### Security:

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Policies configured for authenticated users
- ✅ Users can only edit their own data
- ✅ All users can view public data

### Features:

- ✅ Automatic timestamp updates
- ✅ Realtime subscriptions for check-ins
- ✅ Performance indexes
- ✅ Referential integrity with foreign keys

## 🐛 Troubleshooting

### If you get "relation does not exist" errors:

- Make sure you ran the SQL setup script
- Check that all tables were created in the Table Editor

### If authentication doesn't work:

- Verify email confirmation is disabled
- Check Site URL is set to `http://localhost:8080`
- Clear browser localStorage and try again

### If data doesn't save:

- Check browser console for errors
- Verify RLS policies are in place
- Make sure you're authenticated

## ✅ Checklist

- [ ] SQL setup script executed successfully
- [ ] All 5 tables visible in Table Editor
- [ ] Email confirmation disabled
- [ ] Site URL configured
- [ ] Dev server restarted
- [ ] Test sign up works
- [ ] Test profile edit works
- [ ] Data persists in database

## 🎉 Next Steps

Once setup is complete:

1. **Add Courts** - Start adding basketball courts to the database
2. **Create Communities** - Set up basketball communities
3. **Test Check-ins** - Try checking in at courts
4. **Customize** - Adjust settings and features as needed

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the Supabase logs
3. Verify all setup steps were completed
4. Share the specific error message

---

**Your new Supabase project is ready to use!** 🏀
