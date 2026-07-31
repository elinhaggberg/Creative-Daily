// Images are stored as data: URI strings directly on their IndexedDB entry
// record rather than raw Blobs — a Blob just written to IndexedDB has a real
// WebKit/Safari readback bug (renders as a broken icon until the app fully
// restarts). A plain string skips that code path entirely.
//
// 1400px @ quality 0.85 was needlessly large for how these are actually
// viewed: a 2-column masonry card, a gallery grid cell, or a share card
// that's itself only 1080px wide -- and decode time (what a Gallery's
// several-images-at-once load noticeably pays for) scales with pixel count,
// not just file size. Lower dimension/quality defaults now, plus a smaller
// cap specifically for Gallery, since it's the one case where several
// photos' decode time stacks up in a single render pass.
const MAX_DIMENSION = 1280;
const GALLERY_MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.8;

export function readAndResizeImage(file, maxDimension = MAX_DIMENSION) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDimension) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else if (height >= width && height > maxDimension) {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export function readAndResizeImages(files, maxDimension = MAX_DIMENSION) {
  return Promise.all(Array.from(files).map((file) => readAndResizeImage(file, maxDimension)));
}

export { GALLERY_MAX_DIMENSION };
