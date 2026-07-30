// Images are stored as data: URI strings directly on their IndexedDB entry
// record rather than raw Blobs — a Blob just written to IndexedDB has a real
// WebKit/Safari readback bug (renders as a broken icon until the app fully
// restarts). A plain string skips that code path entirely.
const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.85;

export function readAndResizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height >= width && height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
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

export function readAndResizeImages(files) {
  return Promise.all(Array.from(files).map(readAndResizeImage));
}
