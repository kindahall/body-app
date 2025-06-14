# Fix for .env.local Environment Variables

## Issue
The Supabase anon key in your `.env.local` file is broken across multiple lines, causing the "Failed to fetch" error.

## Solution
Replace the content of your `.env.local` file with the following (all on single lines):

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xrvafxvowvoxpxcefktx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydmFmeHZvd3ZveHB4Y2Vma3R4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4OTM0NDcsImV4cCI6MjA2NDQ2OTQ0N30.csExHypkgXkunwLYH0srhPlfeUx3FAHMX3avkkQiRdc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhydmFmeHZvd3ZveHB4Y2Vma3R4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODg5MzQ0NywiZXhwIjoyMDY0NDY5NDQ3fQ.7mol1kdQuokUUPhVhO0zqQunL2ByP8MQsfDmt9gpfBE

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Steps to Fix:
1. Open your `.env.local` file in a text editor
2. Replace the entire content with the above
3. Make sure each variable is on a SINGLE line (no line breaks)
4. Save the file
5. Restart your development server: `npm run dev`

## Why This Fixes It:
Environment variables cannot contain line breaks. When the JWT token was split across multiple lines, Next.js couldn't read it properly, causing the Supabase client to fail with "Failed to fetch" errors. 