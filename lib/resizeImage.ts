export async function resizeImage(
  file: File,
  maxSizeBytes: number,
  maxDimension = 1024
): Promise<File> {
  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;
  if (width > maxDimension || height > maxDimension) {
    const scale = maxDimension / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');
  ctx.drawImage(bitmap, 0, 0, width, height);

  let quality = 0.9;
  let blob: Blob | null = await canvasToBlob(canvas, quality);

  while (blob && blob.size > maxSizeBytes && quality > 0.1) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  if (blob && blob.size > maxSizeBytes && width > 400) {
    const scale = 0.7;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx2 = canvas.getContext('2d');
    ctx2?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    quality = 0.8;
    blob = await canvasToBlob(canvas, quality);
    while (blob && blob.size > maxSizeBytes && quality > 0.1) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, quality);
    }
  }

  if (!blob) throw new Error('Failed to compress image');

  return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), {
    type: 'image/jpeg',
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}
