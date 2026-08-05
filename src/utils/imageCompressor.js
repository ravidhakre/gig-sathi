/**
 * Utility to automatically compress image files client-side before saving/uploading.
 * Reduces file sizes from 5MB+ down to ~80KB - 150KB for fast site load speeds and minimal storage.
 */
export const compressImage = (fileOrBase64, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve) => {
    if (!fileOrBase64) {
      resolve('');
      return;
    }

    const processDataUrl = (src) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => {
        resolve(src);
      };
      img.src = src;
    };

    if (typeof fileOrBase64 === 'string') {
      if (fileOrBase64.startsWith('data:image/') || fileOrBase64.startsWith('http')) {
        processDataUrl(fileOrBase64);
      } else {
        resolve(fileOrBase64);
      }
    } else if (fileOrBase64 instanceof File || fileOrBase64 instanceof Blob) {
      if (!fileOrBase64.type || !fileOrBase64.type.startsWith('image/')) {
        // Non-image file (e.g. PDF document), read as raw base64 data URL
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(fileOrBase64);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => processDataUrl(reader.result);
      reader.readAsDataURL(fileOrBase64);
    } else {
      resolve('');
    }
  });
};
