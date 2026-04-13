import { supabase } from '../lib/supabase';

const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || 'blog-images';

export const storageService = {
  async uploadBlogImage(
    file: File,
    userId: string,
    onProgress?: (progress: number) => void
  ) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please choose a valid image file.');
    }

    onProgress?.(5);

    const extension = file.name.split('.').pop() || 'png';
    const sanitizedBaseName = file.name
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const filePath = `covers/${userId}/${Date.now()}-${sanitizedBaseName || 'cover'}.${extension}`;

    let progress = 10;
    const progressTimer = window.setInterval(() => {
      progress = Math.min(progress + 12, 90);
      onProgress?.(progress);
    }, 250);

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, { upsert: false });

    window.clearInterval(progressTimer);

    if (uploadError) {
      onProgress?.(0);
      throw new Error(
        uploadError.message.includes('Bucket not found')
          ? `Storage bucket "${STORAGE_BUCKET}" is missing. Create it in Supabase to enable uploads.`
          : uploadError.message
      );
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
    onProgress?.(100);
    return data.publicUrl;
  },
};
