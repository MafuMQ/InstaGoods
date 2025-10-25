# Database Setup Instructions

Follow these steps to connect this project to your own Supabase account:

## Step 1: Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New project"
4. Choose your organization
5. Give it a name (e.g., "InstaGoods")
6. Set a database password (save this!)
7. Choose a region close to you
8. Click "Create new project"

## Step 2: Get Your Project Credentials

1. Once your project is created, go to **Settings → API**
2. Copy the **Project URL** (looks like: `https://abcdefgh.supabase.co`)
3. Copy the **anon public** key (long string starting with `eyJ...`)

## Step 3: Update Environment Variables

1. Open the `.env.template` file in this project
2. Replace `YOUR_PROJECT_REF` with your Project URL
3. Replace `YOUR_ANON_PUBLIC_KEY` with your anon public key
4. Save the file as `.env` (remove the `.template` extension)

## Step 4: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Run the SQL files in this order:
   - `database-setup-1-tables.sql` (Creates all tables)
   - `database-setup-2-policies.sql` (Sets up security policies)
   - `database-setup-3-triggers.sql` (Sets up automatic triggers)

## Step 5: Test the Application

1. Start the development server: `npm run dev`
2. Go to the Auth page and create a new account
3. The system should automatically:
   - Create your user profile
   - Set up your supplier account
   - Assign you the supplier role

## What This Sets Up

- **User authentication** via Supabase Auth
- **Automatic supplier profile creation** when users sign up
- **Product management** for suppliers
- **Order tracking** system
- **Expense management** for suppliers
- **Row Level Security** to protect user data

## Troubleshooting

If you encounter any issues:

1. Check the browser console for errors
2. Verify your environment variables are correct
3. Make sure all three SQL scripts ran successfully
4. Check the Supabase logs in your dashboard

## Next Steps

After setup, you can:
- Add products through the supplier interface
- Customize the business information
- Track orders and expenses
- Manage your product inventory

The "Create Product" button should now work properly once you've completed the database setup!