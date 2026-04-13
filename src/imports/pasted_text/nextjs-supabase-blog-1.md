💻 Codex Prompt: Full Monolithic Next.js + Supabase Blog Platform

Prompt:

Build a production-ready full-stack blog platform using a monolithic architecture with:

Frontend + Backend in Next.js (App Router)
Database & Auth using Supabase (PostgreSQL)
Deployable on Vercel

Follow best practices like SSR, API routes, and secure authentication

🧱 1. Project Setup

Initialize project:

npx create-next-app@latest blog-platform --typescript --tailwind --app
cd blog-platform

npm install @supabase/supabase-js @supabase/ssr zod react-hook-form zustand
🔐 2. Environment Variables

Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
📁 3. Folder Structure
/app
  /(public)
    /page.tsx
    /blog/[slug]/page.tsx
    /category/[slug]/page.tsx

  /(dashboard)
    /admin/page.tsx
    /author/page.tsx

/api
  /blogs/route.ts
  /auth/route.ts
  /comments/route.ts
  /subscribe/route.ts

/lib
  supabase-client.ts
  supabase-server.ts

/services
  blog.service.ts
  user.service.ts

/types
  index.ts

/components
  BlogCard.tsx
  Editor.tsx
  Navbar.tsx
🔌 4. Supabase Client Setup
/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}
🗄️ 5. Database Schema (SQL)
create table users (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text unique,
  role text default 'reader',
  created_at timestamp default now()
);

create table blogs (
  id uuid primary key default gen_random_uuid(),
  title text,
  slug text unique,
  content jsonb,
  cover_image text,
  author_id uuid references users(id),
  status text default 'draft',
  views_enabled boolean default true,
  created_at timestamp default now(),
  published_at timestamp
);

create table categories (
  id uuid primary key,
  name text,
  slug text
);

create table tags (
  id uuid primary key,
  name text
);

create table blog_tags (
  blog_id uuid references blogs(id),
  tag_id uuid references tags(id)
);

create table comments (
  id uuid primary key,
  blog_id uuid,
  user_id uuid,
  content text,
  created_at timestamp default now()
);

create table subscriptions (
  id uuid primary key,
  email text unique,
  created_at timestamp default now()
);

👉 Supabase provides:

Auth
PostgreSQL DB
Storage
Realtime APIs
🔐 6. Authentication

Use Supabase Auth:

const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password,
})
Middleware Protection

Create middleware.ts:

import { NextResponse } from 'next/server'

export function middleware(req) {
  const token = req.cookies.get('sb-access-token')

  if (!token && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
}
📡 7. API Routes (Backend inside Next.js)
/app/api/blogs/route.ts
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('blogs')
    .select('*')
    .eq('status', 'published')

  return Response.json(data)
}
Create Blog
export async function POST(req: Request) {
  const body = await req.json()
  const supabase = await createClient()

  const { data, error } = await supabase.from('blogs').insert(body)

  return Response.json({ data, error })
}
🏠 8. Frontend Pages
Home Page (SSR + ISR)
export const revalidate = 3600

export default async function Home() {
  const res = await fetch('/api/blogs')
  const blogs = await res.json()

  return (
    <div>
      {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
    </div>
  )
}
Blog Page
/blog/[slug]
SSR for SEO
Show:
Title
Content
Author
Views
Share buttons
✍️ 9. Author Editor

Create a Notion-style editor:

Rich text
Markdown support
Image upload (Supabase Storage)
Publish toggle
🛠️ 10. Admin Dashboard

Features:

Manage users (role-based)
Approve blogs
Manage categories/tags
View analytics
📬 11. Newsletter API
export async function POST(req: Request) {
  const { email } = await req.json()

  const supabase = await createClient()
  await supabase.from('subscriptions').insert({ email })

  return Response.json({ success: true })
}
⚡ 12. Performance Best Practices
Use ISR (revalidate)
Cache API responses
Use server components
Optimize queries

👉 Next.js + Supabase enables scalable, fast apps with SSR + API integration

🔐 13. Security
Enable Row Level Security (RLS)
Use server-side mutations only
Validate inputs with Zod
Role-based access

👉 Supabase RLS ensures data isolation per user

🚀 14. Deployment
Push to GitHub
Deploy on Vercel
Connect Supabase DB
🧠 15. Optional Enhancements
AI blog summary
Full-text search
Likes/bookmarks
Reading progress bar
Analytics dashboard
✅ Output Expected from Codex
Full Next.js project
Supabase integration
API routes working
Auth + roles implemented
Blog CRUD functional