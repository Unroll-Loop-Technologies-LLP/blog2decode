import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { blogService } from '../../services/blog.service';
import { storageService } from '../../services/storage.service';
import type { BlogWithAuthor, Category, Tag } from '../../types';
import { RichTextEditor } from '../components/RichTextEditor';
import { Plus, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

export function AuthorDashboard() {
  const { user, isAuthor, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<BlogWithAuthor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogWithAuthor | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [coverImageInput, setCoverImageInput] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadState, setUploadState] = useState('');
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthor) {
      navigate('/');
      return;
    }
    loadData();
  }, [authLoading, isAuthor, user]);

  const loadData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [blogsData, categoriesData, tagsData] = await Promise.all([
        blogService.getBlogsByAuthor(user.id),
        blogService.getCategories(),
        blogService.getTags(),
      ]);
      setBlogs(blogsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setExcerpt('');
    setCoverImage('');
    setCoverImageInput('');
    setStatus('draft');
    setSelectedCategories([]);
    setSelectedTags([]);
    setEditingBlog(null);
    setUploadState('');
    setUploadError('');
  };

  const handleCreateNew = () => {
    resetForm();
    setShowEditor(true);
  };

  const handleEdit = (blog: BlogWithAuthor) => {
    setEditingBlog(blog);
    setTitle(blog.title);
    setContent(typeof blog.content === 'string' ? blog.content : JSON.stringify(blog.content));
    setExcerpt(blog.excerpt || '');
    setCoverImage(blog.cover_image || '');
    setCoverImageInput(blog.cover_image?.startsWith('data:image/') ? '' : blog.cover_image || '');
    setStatus(blog.status);
    setSelectedCategories(blog.categories?.map((category) => category.id) || []);
    setSelectedTags(blog.tags?.map((tag) => tag.id) || []);
    setShowEditor(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingBlog) {
        await blogService.updateBlog(editingBlog.id, {
          title,
          slug,
          content,
          excerpt,
          cover_image: coverImage,
          status,
          categoryIds: selectedCategories,
          tagIds: selectedTags,
        });
        toast.success('Blog updated successfully!');
      } else {
        await blogService.createBlog({
          title,
          slug,
          content,
          excerpt,
          cover_image: coverImage,
          author_id: user.id,
          status,
          categoryIds: selectedCategories,
          tagIds: selectedTags,
        });
        toast.success('Blog created successfully!');
      }

      setShowEditor(false);
      resetForm();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blog?')) return;

    try {
      await blogService.deleteBlog(id);
      toast.success('Blog deleted successfully!');
      await loadData();
    } catch (error) {
      toast.error('Failed to delete blog');
    }
  };

  const handleUploadImage = async (file: File | undefined) => {
    if (!file || !user) return;

    setUploadingImage(true);
    setUploadError('');
    try {
      const imageUrl = await storageService.uploadBlogImage(file, user.id, setUploadState);
      setCoverImage(imageUrl);
      setCoverImageInput('');
      toast.success('Cover image uploaded successfully!');
    } catch (error: any) {
      setUploadError(error.message || 'Failed to upload cover image');
      toast.error(error.message || 'Failed to upload cover image');
    } finally {
      setUploadingImage(false);
      setTimeout(() => setUploadState(''), 1200);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (showEditor) {
    const hasEmbeddedCoverImage = coverImage.startsWith('data:image/');

    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => {
              setShowEditor(false);
              resetForm();
            }}
            className="text-gray-600 hover:text-black"
          >
            Back to Dashboard
          </button>
        </div>

        <h1 className="font-bold text-3xl mb-8">
          {editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block font-medium mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Excerpt (optional)</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg resize-y min-h-[80px] focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="A short summary of your blog post"
            />
          </div>

          <div>
            <label className="block font-medium mb-2">Cover Image URL (optional)</label>
            <input
              type="url"
              value={coverImageInput}
              onChange={(e) => {
                const nextValue = e.target.value;
                setCoverImageInput(nextValue);
                setCoverImage(nextValue.trim());
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              placeholder="https://example.com/image.jpg"
            />
            <div className="mt-3 flex flex-col gap-3">
              <label className="block text-sm font-medium text-gray-700">
                Or upload an image
              </label>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={async (e) => {
                    await handleUploadImage(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                  className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
                />
                {uploadingImage && (
                  <div className="w-full sm:max-w-xs">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{uploadState || 'Uploading image...'}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full w-1/2 bg-black animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
              {uploadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {uploadError}
                </div>
              )}
              <p className="text-sm text-gray-500">
                Uploaded cover images are embedded directly into the article, so they keep working without extra storage setup.
              </p>
              <p className="text-sm text-gray-500">
                Use a reasonably sized image for best performance. Images larger than 4 MB are blocked.
              </p>
              {hasEmbeddedCoverImage && (
                <p className="text-sm text-gray-500">
                  An uploaded image is attached below. The URL field stays empty so the editor does not freeze on large embedded data.
                </p>
              )}
            </div>
            {coverImage && (
              <div className="mt-4">
                <ImageWithFallback
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full max-w-md h-48 object-cover rounded-xl border"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage('');
                    setCoverImageInput('');
                    setUploadState('');
                    setUploadError('');
                  }}
                  className="mt-3 text-sm text-gray-600 hover:text-black"
                >
                  Remove cover image
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2">Content</label>
            <RichTextEditor value={content} onChange={setContent} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium mb-2">Categories</label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCategories([...selectedCategories, category.id]);
                        } else {
                          setSelectedCategories(selectedCategories.filter((id) => id !== category.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Tags</label>
              <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-lg">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tag.id]);
                        } else {
                          setSelectedTags(selectedTags.filter((id) => id !== tag.id));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block font-medium mb-2">Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={status === 'draft'}
                  onChange={() => setStatus('draft')}
                  className="w-4 h-4"
                />
                Draft
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={status === 'published'}
                  onChange={() => setStatus('published')}
                  className="w-4 h-4"
                />
                Published
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowEditor(false);
                resetForm();
              }}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-bold text-3xl">My Blogs</h1>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Blog
        </button>
      </div>

      {blogs.length > 0 ? (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="bg-white border rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="font-bold text-xl">{blog.title}</h2>
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        blog.status === 'published'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </div>
                  {blog.excerpt && <p className="text-gray-600 mb-3">{blog.excerpt}</p>}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>Created: {format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                    {blog.published_at && (
                      <span>Published: {format(new Date(blog.published_at), 'MMM d, yyyy')}</span>
                    )}
                    {blog.views_enabled && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {blog.views_count} views
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(blog)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(blog.id)}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">You haven't created any blogs yet.</p>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Your First Blog
          </button>
        </div>
      )}
    </div>
  );
}
