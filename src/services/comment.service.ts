import { publicSupabase, supabase } from '../lib/supabase';
import type { Comment, CommentWithUser } from '../types';

export const commentService = {
  // Get comments for a blog
  async getCommentsByBlog(blogId: string): Promise<CommentWithUser[]> {
    const { data, error } = await publicSupabase
      .from('comments')
      .select(`
        *,
        user:users(*)
      `)
      .eq('blog_id', blogId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create comment
  async createComment(blogId: string, userId: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        blog_id: blogId,
        user_id: userId,
        content,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update comment
  async updateComment(id: string, content: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .update({ content })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete comment
  async deleteComment(id: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
