export const storageService = {
  async uploadBlogImage(
    file: File,
    _userId: string,
    onStateChange?: (state: string) => void
  ) {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please choose a valid image file.');
    }

    if (file.size > 4 * 1024 * 1024) {
      throw new Error('Please upload an image smaller than 4 MB.');
    }

    onStateChange?.('Reading image...');

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read the selected image.'));
      reader.readAsDataURL(file);
    });

    if (!dataUrl.startsWith('data:image/')) {
      throw new Error('The selected file could not be converted into an image.');
    }

    onStateChange?.('Image ready');
    return dataUrl;
  },
};
