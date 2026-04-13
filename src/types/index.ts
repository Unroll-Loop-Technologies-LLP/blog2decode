import type { Database } from './database';

export type User = Database['public']['Tables']['users']['Row'];
export type Blog = Database['public']['Tables']['blogs']['Row'];
export type Category = Database['public']['Tables']['categories']['Row'];
export type Tag = Database['public']['Tables']['tags']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];

export interface BlogWithAuthor extends Blog {
  author: User;
  categories?: Category[];
  tags?: Tag[];
  comments?: CommentWithUser[];
}

export interface CommentWithUser extends Comment {
  user: User;
}

export type UserRole = 'reader' | 'author' | 'admin';
export type BlogStatus = 'draft' | 'published';
