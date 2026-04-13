import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { blogService } from '../../services/blog.service';
import { commentService } from '../../services/comment.service';
import { useAuth } from '../../contexts/AuthContext';
import type { BlogWithAuthor, CommentWithUser } from '../../types';
import { Calendar, Eye, MessageCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { StatePage } from '../components/StatePage';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [blog, setBlog] = useState<BlogWithAuthor | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadBlog(slug);
    }
  }, [slug]);

  const loadBlog = async (slug: string) => {
    try {
      const data = await blogService.getBlogBySlug(slug);
      setBlog(data);
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading blog:', error);
      setError('The article you requested could not be found or is no longer available.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !blog || !newComment.trim()) return;

    setSubmittingComment(true);
    try {
      await commentService.createComment(blog.id, user.id, newComment);
      const updatedComments = await commentService.getCommentsByBlog(blog.id);
      setComments(updatedComments);
      setNewComment('');
      toast.success('Comment posted!');
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!blog) {
    return (
      <StatePage
        title="Article unavailable"
        description={error || 'The article you requested could not be found.'}
      />
    );
  }

  const contentText = typeof blog.content === 'string' ? blog.content : '';

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      {blog.cover_image && (
        <div className="aspect-[16/9] rounded-2xl overflow-hidden mb-8">
          <img
            src={blog.cover_image}
            alt={blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <header className="mb-8">
        <h1 className="font-bold text-4xl md:text-5xl mb-6 leading-tight">{blog.title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
          {blog.published_at && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{format(new Date(blog.published_at), 'MMMM d, yyyy')}</span>
            </div>
          )}
          {blog.views_enabled && (
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              <span>{blog.views_count} views</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {blog.categories?.map((category) => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            >
              {category.name}
            </Link>
          ))}
          {blog.tags?.map((tag) => (
            <span key={tag.id} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full">
              #{tag.name}
            </span>
          ))}
        </div>
      </header>

      <div className="prose prose-lg max-w-none mb-12">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ ...props }) => (
              <img {...props} className="rounded-xl max-h-[32rem] w-full object-cover" />
            ),
            a: ({ ...props }) => (
              <a
                {...props}
                className="text-blue-600 underline underline-offset-4"
                target="_blank"
                rel="noreferrer"
              />
            ),
          }}
        >
          {contentText}
        </ReactMarkdown>
      </div>

      <div className="border-t pt-12">
        <div className="flex items-center gap-2 mb-6">
          <MessageCircle className="w-6 h-6" />
          <h2 className="font-bold text-2xl">Comments ({comments.length})</h2>
        </div>

        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts..."
              className="w-full p-4 border rounded-lg resize-y min-h-[100px] focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="mt-2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {submittingComment ? 'Posting...' : 'Post Comment'}
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">
              Please <Link to="/login" className="text-blue-600 hover:underline">sign in</Link> to leave a comment
            </p>
          </div>
        )}

        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{comment.user?.name}</span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(comment.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <p className="text-gray-500 text-center py-8">No comments yet. Be the first to comment!</p>
          )}
        </div>
      </div>
    </article>
  );
}
