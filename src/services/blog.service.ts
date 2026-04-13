import { supabase } from '../lib/supabase';
import type { Blog, BlogWithAuthor, Category, Tag } from '../types';

export const blogService = {
  // Get all published blogs with author info
  async getPublishedBlogs() {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users(*),
        blog_categories(
          category:categories(*)
        ),
        blog_tags(
          tag:tags(*)
        )
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (error) throw error;
    return this.transformBlogs(data);
  },

  // Get blog by slug
  async getBlogBySlug(slug: string) {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users(*),
        blog_categories(
          category:categories(*)
        ),
        blog_tags(
          tag:tags(*)
        ),
        comments(
          *,
          user:users(*)
        )
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;

    // Increment views
    if (data.id) {
      await supabase.rpc('increment_blog_views', { blog_id: data.id });
    }

    return this.transformBlog(data);
  },

  // Get blogs by category
  async getBlogsByCategory(categorySlug: string) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (!category) return [];

    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users(*),
        blog_categories!inner(category_id),
        blog_tags(
          tag:tags(*)
        )
      `)
      .eq('status', 'published')
      .eq('blog_categories.category_id', category.id)
      .order('published_at', { ascending: false });

    if (error) throw error;
    return this.transformBlogs(data);
  },

  // Get blogs by author
  async getBlogsByAuthor(authorId: string) {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        author:users(*),
        blog_categories(
          category:categories(*)
        ),
        blog_tags(
          tag:tags(*)
        )
      `)
      .eq('author_id', authorId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return this.transformBlogs(data);
  },

  // Create blog
  async createBlog(blog: {
    title: string;
    slug: string;
    content: any;
    excerpt?: string;
    cover_image?: string;
    author_id: string;
    status?: 'draft' | 'published';
    categoryIds?: string[];
    tagIds?: string[];
  }) {
    const { data, error } = await supabase
      .from('blogs')
      .insert({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        cover_image: blog.cover_image,
        author_id: blog.author_id,
        status: blog.status || 'draft',
        published_at: blog.status === 'published' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) throw error;

    // Add categories
    if (blog.categoryIds?.length) {
      await supabase
        .from('blog_categories')
        .insert(
          blog.categoryIds.map(categoryId => ({
            blog_id: data.id,
            category_id: categoryId,
          }))
        );
    }

    // Add tags
    if (blog.tagIds?.length) {
      await supabase
        .from('blog_tags')
        .insert(
          blog.tagIds.map(tagId => ({
            blog_id: data.id,
            tag_id: tagId,
          }))
        );
    }

    return data;
  },

  // Update blog
  async updateBlog(
    id: string,
    updates: {
      title?: string;
      slug?: string;
      content?: any;
      excerpt?: string;
      cover_image?: string;
      status?: 'draft' | 'published';
      categoryIds?: string[];
      tagIds?: string[];
    }
  ) {
    const updateData: any = { ...updates };

    // Set published_at when publishing
    if (updates.status === 'published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    // Remove category/tag arrays from update
    delete updateData.categoryIds;
    delete updateData.tagIds;

    const { data, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Update categories
    if (updates.categoryIds !== undefined) {
      await supabase.from('blog_categories').delete().eq('blog_id', id);
      if (updates.categoryIds.length > 0) {
        await supabase
          .from('blog_categories')
          .insert(
            updates.categoryIds.map(categoryId => ({
              blog_id: id,
              category_id: categoryId,
            }))
          );
      }
    }

    // Update tags
    if (updates.tagIds !== undefined) {
      await supabase.from('blog_tags').delete().eq('blog_id', id);
      if (updates.tagIds.length > 0) {
        await supabase
          .from('blog_tags')
          .insert(
            updates.tagIds.map(tagId => ({
              blog_id: id,
              tag_id: tagId,
            }))
          );
      }
    }

    return data;
  },

  // Delete blog
  async deleteBlog(id: string) {
    const { error } = await supabase.from('blogs').delete().eq('id', id);
    if (error) throw error;
  },

  // Get all categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Get all tags
  async getTags() {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  // Create tag
  async createTag(name: string) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('tags')
      .insert({ name, slug })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Helper to transform blog data
  transformBlog(data: any): BlogWithAuthor {
    return {
      ...data,
      categories: data.blog_categories?.map((bc: any) => bc.category).filter(Boolean) || [],
      tags: data.blog_tags?.map((bt: any) => bt.tag).filter(Boolean) || [],
      comments: data.comments || [],
    };
  },

  transformBlogs(data: any[]): BlogWithAuthor[] {
    return data.map(blog => this.transformBlog(blog));
  },
};
