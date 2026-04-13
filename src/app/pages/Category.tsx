import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { blogService } from '../../services/blog.service';
import type { BlogWithAuthor } from '../../types';
import { BlogCard } from '../components/BlogCard';
import { Loader2 } from 'lucide-react';

export function Category() {
  const { slug } = useParams<{ slug: string }>();
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadBlogs(slug);
    }
  }, [slug]);

  const loadBlogs = async (categorySlug: string) => {
    setLoading(true);
    try {
      const data = await blogService.getBlogsByCategory(categorySlug);
      setBlogs(data);
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryName = slug?.charAt(0).toUpperCase() + slug?.slice(1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="font-bold text-4xl mb-4">{categoryName}</h1>
        <p className="text-gray-600 text-lg">
          Explore articles about {categoryName?.toLowerCase()}
        </p>
      </div>

      {blogs.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No articles in this category yet.</p>
        </div>
      )}
    </div>
  );
}
