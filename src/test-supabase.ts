// Supabase Connection Test Script
// Run this to diagnose connection issues

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

console.log('🔍 Supabase Connection Diagnostics');
console.log('=====================================');
console.log('URL:', SUPABASE_URL);
console.log('Key (first 20 chars):', SUPABASE_KEY?.substring(0, 20) + '...');
console.log('Key exists:', !!SUPABASE_KEY);
console.log('URL exists:', !!SUPABASE_URL);
console.log('=====================================\n');

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ ERROR: Missing environment variables!');
    console.error('Make sure .env file has:');
    console.error('- VITE_SUPABASE_URL');
    console.error('- VITE_SUPABASE_PUBLISHABLE_KEY');
} else {
    console.log('✅ Environment variables found');

    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✅ Supabase client created successfully');

        // Test connection
        console.log('\n🔄 Testing connection...');

        supabase.auth.getSession().then(({ data, error }) => {
            if (error) {
                console.error('❌ Auth error:', error.message);
            } else {
                console.log('✅ Auth connection successful');
                console.log('Session:', data.session ? 'Active' : 'No active session');
            }
        });

        // Test database connection
        supabase.from('profiles').select('count').limit(1).then(({ data, error }) => {
            if (error) {
                console.error('❌ Database error:', error.message);
                console.error('Error details:', error);
            } else {
                console.log('✅ Database connection successful');
            }
        });

    } catch (error) {
        console.error('❌ Failed to create Supabase client:', error);
    }
}
