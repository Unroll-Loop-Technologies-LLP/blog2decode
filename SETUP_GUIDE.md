# 🚀 Quick Setup Guide

Follow these steps to get your blog platform running.

## Step 1: Run Database Migration

**⚠️ IMPORTANT**: You must run the SQL migration in Supabase before the app will work.

1. Open your Supabase dashboard at [supabase.com](https://supabase.com)
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `SUPABASE_SETUP.sql` in this project
6. Copy the entire contents
7. Paste into the Supabase SQL Editor
8. Click **Run** (or press Cmd/Ctrl + Enter)

You should see a success message. This creates:
- ✅ All database tables
- ✅ Security policies (RLS)
- ✅ Sample categories (Technology, Design, Business)
- ✅ Sample tags (React, TypeScript, etc.)
- ✅ Triggers and functions

## Step 2: Verify Supabase Connection

In Figma Make settings, ensure:
- ✅ Supabase URL is connected
- ✅ Anon Key is connected

If this Supabase database is shared by multiple portals, set `VITE_PORTAL_ID` to a unique value for this portal. Deactivating a user in Admin only changes access for that portal id.

For an existing database, run `PORTAL_ACCESS_MIGRATION.sql` once in the Supabase SQL Editor to add the portal access table safely.

The app will automatically use these credentials.

## Step 3: Create Your First Account

1. Run the app
2. Click **Sign Up**
3. Fill in your details
4. Choose **Author** as account type (to create blogs)
5. Click **Sign Up**

## Step 4: Make Yourself Admin (Optional)

To access the Admin Dashboard:

1. Go to Supabase dashboard
2. Click on **SQL Editor**
3. Run this query (replace with your email):

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```

4. Refresh the app
5. You'll now see the "Admin" button in navigation

## Step 5: Create Your First Blog Post

1. Click **Write** in the navigation
2. Fill in:
   - Title
   - Excerpt (optional)
   - Cover Image URL (optional)
   - Content (supports Markdown)
   - Select categories
   - Select tags
   - Choose Draft or Published
3. Click **Create Blog**

## 🎉 You're Done!

Your blog platform is now fully functional!

### What You Can Do Now

**As an Author:**
- ✍️ Write blog posts
- 📝 Edit and delete your posts
- 📊 View post analytics
- 🎨 Organize with categories and tags

**As an Admin:**
- 👥 Manage user roles
- 📧 View newsletter subscribers
- 🛡️ Moderate content

**As a Reader:**
- 📖 Read published blogs
- 💬 Leave comments
- 📧 Subscribe to newsletter

## 🔍 Troubleshooting

### Issue: "Supabase credentials not found"
**Solution**: Check that Supabase is connected in Figma Make settings

### Issue: Can't log in
**Solution**: Make sure you ran the database migration (Step 1)

### Issue: "Permission denied" errors
**Solution**: Verify the RLS policies were created by the migration

### Issue: No categories or tags showing
**Solution**: The migration includes sample data. If missing, run the migration again.

## 📝 Sample Blog Content

Want to test with sample content? Here's a starter blog post:

**Title**: Getting Started with React and TypeScript

**Excerpt**: Learn the fundamentals of building type-safe React applications

**Content**:
```markdown
# Getting Started with React and TypeScript

TypeScript brings type safety to React development, making your code more robust and maintainable.

## Why TypeScript?

- **Type Safety**: Catch errors at compile time
- **Better IDE Support**: Autocomplete and refactoring
- **Improved Documentation**: Types serve as documentation

## Quick Start

Create a new TypeScript React app:

`npx create-react-app my-app --template typescript`

## Defining Component Props

interface ButtonProps {
  label: string;
  onClick: () => void;
}

const Button = ({ label, onClick }: ButtonProps) => {
  return <button onClick={onClick}>{label}</button>;
};


Happy coding!
```

**Categories**: Technology  
**Tags**: React, TypeScript, Web Development

---

Need help? Check the full README.md or Supabase documentation.
