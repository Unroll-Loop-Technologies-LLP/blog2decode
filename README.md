
# Full-Stack Blog Platform

A production-ready blog platform built with React, Supabase, and Tailwind CSS. Features include user authentication, role-based access control, rich text editing, comments, and newsletter subscriptions.

## 🚀 Features

### Public Features
- 📖 Browse published blog posts
- 🏷️ Filter by categories (Technology, Design, Business)
- 💬 Comment on articles (requires login)
- 📧 Newsletter subscription
- 📱 Fully responsive design

### Author Features
- ✍️ Rich Markdown editor
- 📝 Create, edit, and delete blog posts
- 🎨 Add categories and tags
- 📊 View post analytics (views, comments)
- 🔄 Draft and publish workflow
- 🖼️ Cover image support

### Admin Features
- 👥 User management and role assignment
- 📧 View newsletter subscriptions
- 🛡️ Content moderation capabilities

## 🔧 Setup Instructions

### 1. Supabase Configuration

**In Figma Make:**
1. Open your project settings
2. Navigate to the Supabase integration section
3. Enter your Supabase credentials:
   - **Project URL**: Your Supabase project URL
   - **Anon Key**: Your Supabase anonymous/public key
   - (Optional) **Service Role Key**: For admin operations

**Find your credentials:**
- Go to [supabase.com](https://supabase.com)
- Open your project
- Navigate to Settings > API
- Copy the Project URL and anon public key

### 2. Database Setup

Run the SQL migration in your Supabase SQL Editor:

1. Go to your Supabase dashboard
2. Click on "SQL Editor" in the left sidebar
3. Create a new query
4. Copy and paste the contents of `SUPABASE_SETUP.sql`
5. Click "Run" to execute

This will create:
- All required tables (users, portal_user_access, blogs, categories, tags, comments, subscriptions)
- Row Level Security (RLS) policies
- Database indexes for performance
- Triggers for automatic user profile creation
- Sample seed data (categories and tags)

### 3. Environment Variables

The Supabase integration in Figma Make automatically provides:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

Optional when sharing one Supabase database across multiple portals:
- `VITE_PORTAL_ID` - Unique id for this portal, used for portal-scoped activation/deactivation. Defaults to `cybersphere-blog`.

For an existing database, run `PORTAL_ACCESS_MIGRATION.sql` once instead of rerunning the full setup file.

These are configured automatically when you connect Supabase in the settings.

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation with auth state
│   │   ├── BlogCard.tsx         # Blog preview card
│   │   ├── RichTextEditor.tsx   # Markdown editor
│   │   └── NewsletterSubscribe.tsx
│   ├── pages/
│   │   ├── Home.tsx             # Public homepage
│   │   ├── BlogPost.tsx         # Individual blog view
│   │   ├── Category.tsx         # Category filter view
│   │   ├── Login.tsx            # Login page
│   │   ├── Signup.tsx           # Registration page
│   │   ├── AuthorDashboard.tsx  # Author content management
│   │   └── AdminDashboard.tsx   # Admin panel
│   └── App.tsx                  # Main app with routing
├── contexts/
│   └── AuthContext.tsx          # Authentication state
├── services/
│   ├── blog.service.ts          # Blog CRUD operations
│   ├── comment.service.ts       # Comment operations
│   └── subscription.service.ts  # Newsletter operations
├── lib/
│   └── supabase.ts              # Supabase client setup
└── types/
    ├── database.ts              # Database type definitions
    └── index.ts                 # Shared types
```

## 🎯 User Roles

### Reader (Default)
- View published blogs
- Comment on posts
- Subscribe to newsletter

### Author
- All Reader permissions
- Create and edit own blog posts
- Manage own content (draft/publish)
- Add categories and tags

### Admin
- All Author permissions
- Manage all users and their roles
- View newsletter subscriptions
- Manage all content across the platform

## 🔐 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Role-based permissions**: Different capabilities per user role
- **Secure authentication**: Powered by Supabase Auth
- **Input validation**: Client and server-side validation
- **XSS protection**: Safe content rendering

## 🚦 Getting Started

### Create Your First Account

1. Click "Sign Up" in the navigation
2. Enter your details
3. Choose account type:
   - **Reader**: To read and comment
   - **Author**: To write and publish

### For Authors

1. Sign up with "Author" role
2. Click "Write" in the navigation
3. Create your first blog post
4. Choose categories and tags
5. Save as Draft or Publish immediately

### For Admins

1. Sign up normally
2. Run this SQL in Supabase to make yourself admin:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';
```
3. Access Admin Dashboard from the navigation

## 📝 Content Creation

### Using the Rich Text Editor

The editor supports Markdown formatting:

- **Headings**: `# Heading 1`, `## Heading 2`
- **Bold**: `**bold text**`
- **Italic**: `_italic text_`
- **Lists**: `- bullet` or `1. numbered`
- **Links**: `[text](url)`
- **Images**: `![alt](image-url)`
- **Code**: `` `code` ``
- **Quotes**: `> quote`

### Adding Images

1. Upload your image to a hosting service (Imgur, Cloudinary, etc.)
2. Copy the direct image URL
3. Use in Cover Image field or Markdown: `![alt](url)`

## 🎨 Customization

### Adding New Categories

Run in Supabase SQL Editor:
```sql
INSERT INTO categories (name, slug, description)
VALUES ('Category Name', 'category-slug', 'Description');
```

### Adding New Tags

Authors can create tags directly in the blog editor, or run:
```sql
INSERT INTO tags (name, slug)
VALUES ('Tag Name', 'tag-slug');
```

## 📊 Database Schema

### Key Tables

- **users**: User profiles and roles
- **blogs**: Blog posts with metadata
- **categories**: Content categories
- **tags**: Content tags
- **blog_categories**: Blog-category relationships
- **blog_tags**: Blog-tag relationships
- **comments**: User comments on blogs
- **subscriptions**: Newsletter emails

### Relationships

- Blogs belong to Authors (users)
- Blogs have many Categories (many-to-many)
- Blogs have many Tags (many-to-many)
- Comments belong to Blogs and Users

## 🔍 Troubleshooting

### "Supabase credentials not found"
- Check that Supabase is connected in Figma Make settings
- Verify your Project URL and Anon Key are correct

### "Permission denied" errors
- Ensure you've run the `SUPABASE_SETUP.sql` migration
- Check Row Level Security policies are enabled
- Verify you're signed in with the correct role

### Comments not showing
- Make sure you're logged in
- Check that the blog post exists and is published
- Verify RLS policies in Supabase

## 📚 Tech Stack

- **Frontend**: React 18, TypeScript
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **Notifications**: Sonner
- **Date Formatting**: date-fns

## 🚀 Deployment

This project is optimized for deployment on:
- **Vercel** (recommended)
- **Netlify**
- **Cloudflare Pages**

Make sure to set the environment variables in your deployment platform.

## 📄 License

MIT License - feel free to use for personal and commercial projects.

## 🤝 Contributing

This is a demo project, but feel free to fork and customize for your needs!

---

Built with ❤️ using React, Supabase, and Tailwind CSS

