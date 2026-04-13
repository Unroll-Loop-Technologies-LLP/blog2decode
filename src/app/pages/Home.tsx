import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { blogService } from '../../services/blog.service';
import type { BlogWithAuthor } from '../../types';
import { BlogCard } from '../components/BlogCard';
import { NewsletterSubscribe } from '../components/NewsletterSubscribe';
import { Loader2 } from 'lucide-react';
import { StatePage } from '../components/StatePage';

export function Home() {
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      const data = await blogService.getPublishedBlogs();
      setBlogs(data);
    } catch (error) {
      console.error('Error loading blogs:', error);
      setError('We could not load the latest CyberSphere articles right now.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <StatePage title="Articles unavailable" description={error} />;
  }

  const featuredBlog = blogs[0];
  const otherBlogs = blogs.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-gray-500 mb-3">
          CyberSphere
        </p>
        <h1 className="font-bold text-4xl md:text-6xl leading-tight mb-4">
          Securing the Sphere. Powering Innovation. Scaling the Future
        </h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Insights, analysis, and stories at the intersection of cybersecurity, technology, and modern digital growth.
        </p>
      </div>

      {featuredBlog && (
        <div className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {featuredBlog.cover_image && (
              <div className="aspect-[4/3] rounded-2xl overflow-hidden">
                <img
                  src={featuredBlog.cover_image}
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <div className="inline-block px-3 py-1 bg-black text-white rounded-full text-sm mb-4">
                Featured
              </div>
              <h1 className="font-bold text-4xl md:text-5xl mb-4 leading-tight">
                {featuredBlog.title}
              </h1>
              {featuredBlog.excerpt && (
                <p className="text-gray-600 text-lg mb-6">{featuredBlog.excerpt}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                {featuredBlog.published_at && (
                  <span>
                    {new Date(featuredBlog.published_at).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <Link
                to={`/blog/${featuredBlog.slug}`}
                className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Read Article
              </Link>
            </div>
          </div>
        </div>
      )}

      {otherBlogs.length > 0 && (
        <div className="mb-16">
          <h2 className="font-bold text-2xl mb-8">Latest Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </div>
      )}

      {blogs.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg">No published articles yet.</p>
        </div>
      )}

      <NewsletterSubscribe />
    </div>
  );
}
