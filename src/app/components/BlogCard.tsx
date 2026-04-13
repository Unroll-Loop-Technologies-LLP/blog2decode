import { Link } from 'react-router';
import type { BlogWithAuthor } from '../../types';
import { Calendar, User, Eye } from 'lucide-react';
import { format } from 'date-fns';

interface BlogCardProps {
  blog: BlogWithAuthor;
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link
      to={`/blog/${blog.slug}`}
      className="group block bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {blog.cover_image && (
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
          {blog.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{blog.author.name}</span>
            </div>
          )}
          {blog.published_at && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(blog.published_at), 'MMM d, yyyy')}</span>
            </div>
          )}
          {blog.views_enabled && blog.views_count > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{blog.views_count}</span>
            </div>
          )}
        </div>

        <h2 className="font-bold text-xl mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
          {blog.title}
        </h2>

        {blog.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
        )}

        <div className="flex flex-wrap gap-2">
          {blog.categories?.slice(0, 2).map((category) => (
            <span
              key={category.id}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
            >
              {category.name}
            </span>
          ))}
          {blog.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag.id}
              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
            >
              #{tag.name}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
