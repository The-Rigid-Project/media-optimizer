## Media Optimizer

Modern social media platforms don't just serve raw, unoptimized files. To ensure instant load speeds, they generate multiple responsive versions of assets. This repository provides a robust, Next.js-native approach to media processing, ensuring smaller data footprints and significantly faster client-side rendering.

---

### Core Logic

The pipeline is designed to handle high-resolution uploads and transform them into web-ready formats. By generating a variety of resolutions and qualities, we minimize the **Largest Contentful Paint (LCP)** and reduce bandwidth costs for both the server and the end-user.

### Key Features

* **iPhone Compatibility:** Automated conversion of HEIC/HEIF images to standard web formats using `heic2any`.
* **High-Performance Image Processing:** Leverages `sharp` for lightning-fast resizing, cropping, and WebP/AVIF encoding.
* **Video Transcoding:** Integrated `fluent-ffmpeg` pipeline to compress videos and generate thumbnails.
* **Next.js Integration:** Built specifically to work within API routes or Server Actions for a seamless full-stack experience.

---

### Tech Stack

| Dependency | Purpose |
| --- | --- |
| **sharp** | High-speed Node.js image processing. |
| **heic2any** | Client-side conversion of Apple's HEIC format. |
| **fluent-ffmpeg** | A fluent API for FFMPEG to process video streams. |
| **@ffmpeg-installer/ffmpeg** | Provides the FFMPEG binary for various environments. |

---

### Installation

1. Clone the repository:
```bash
git clone https://github.com/The-Rigid-Project/media-optimizer.git
```


2. Install the necessary packages:
```bash
npm install sharp heic2any fluent-ffmpeg @ffmpeg-installer/ffmpeg
```


3. Ensure your environment has the necessary permissions for file system writes if you are processing files locally.

---

### Usage Example

```javascript
import sharp from 'sharp';

export async function optimizeImage(buffer) {
  return await sharp(buffer)
    .resize(800) // Resize to 800px width
    .webp({ quality: 80 }) // Convert to WebP
    .toBuffer();
}
```

This ensures that regardless of the source file size, your application serves a performant, optimized version every time.