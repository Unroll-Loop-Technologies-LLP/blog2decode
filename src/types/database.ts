export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string | null
          email: string | null
          role: 'reader' | 'author' | 'admin'
          avatar_url: string | null
          bio: string | null
          created_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          role?: 'reader' | 'author' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          role?: 'reader' | 'author' | 'admin'
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
        }
      }
      blogs: {
        Row: {
          id: string
          title: string
          slug: string
          content: Json
          excerpt: string | null
          cover_image: string | null
          author_id: string
          status: 'draft' | 'published'
          views_count: number
          views_enabled: boolean
          created_at: string
          published_at: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: Json
          excerpt?: string | null
          cover_image?: string | null
          author_id: string
          status?: 'draft' | 'published'
          views_count?: number
          views_enabled?: boolean
          created_at?: string
          published_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: Json
          excerpt?: string | null
          cover_image?: string | null
          author_id?: string
          status?: 'draft' | 'published'
          views_count?: number
          views_enabled?: boolean
          created_at?: string
          published_at?: string | null
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      blog_tags: {
        Row: {
          blog_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          blog_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          blog_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      blog_categories: {
        Row: {
          blog_id: string
          category_id: string
          created_at: string
        }
        Insert: {
          blog_id: string
          category_id: string
          created_at?: string
        }
        Update: {
          blog_id?: string
          category_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          blog_id: string
          user_id: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          blog_id: string
          user_id: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          blog_id?: string
          user_id?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
