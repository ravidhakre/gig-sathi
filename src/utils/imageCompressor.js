/**
 * Utility to automatically compress image files client-side before saving/uploading.
 * Non-image files (e.g. PDF documents) are safely converted to Base64 data URLs without crashing.
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
      const mimeType = fileOrBase64.type || '';
      const fileName = fileOrBase64.name || '';
      const isImage = mimeType.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(fileName);

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result || '';
        if (isImage) {
          processDataUrl(result);
        } else {
          // PDF or document file: resolve raw data URL directly
          resolve(result);
        }
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(fileOrBase64);
    } else {
      resolve('');
    }
  });
};
