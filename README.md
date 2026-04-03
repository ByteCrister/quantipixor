<div align="center">  
  
# Quantipixor  
  
**Private batch image compression — entirely in your browser.**  
  
Compress JPG, PNG, WebP, AVIF, and 14+ other formats in bulk with zero server uploads.  
Fast, private, and free.  
  
[Live Demo](https://quantipixor.vercel.app/) · [Report Bug](https://github.com/ByteCrister/quantipixor/issues) · [Request Feature](https://github.com/ByteCrister/quantipixor/issues)  
  
</div>  
  
---  
  
## Table of Contents  
  
- [About](#about)  
- [Features](#features)  
- [Supported Formats](#supported-formats)  
- [How It Works](#how-it-works)  
- [Tech Stack](#tech-stack)  
- [Project Structure](#project-structure)  
- [Getting Started](#getting-started)  
- [Configuration & Limits](#configuration--limits)  
- [ZIP Output Structure](#zip-output-structure)  
- [Roadmap](#roadmap)  
- [Contributing](#contributing)  
- [License](#license)  
- [Author](#author)  
  
---  
  
## About  
  
Quantipixor is a high-performance, privacy-first web application for **batch image compression**. Every image is processed locally using the browser's native Canvas API — nothing is ever uploaded to a server. Compressed images are packaged into organized ZIP archives for easy download.  
  
Built with Next.js 16, React 19, and a glassmorphism design system, Quantipixor delivers a polished, accessible experience on any modern browser.  
  
---  
  
## Features  
  
| Feature | Description |  
|---|---|  
| **100% Client-Side** | All compression runs in-browser via the HTML Canvas API. Your images never leave your device. |  
| **Batch Processing** | Upload up to 20 images per drop and maintain up to 50 images in the queue simultaneously. |  
| **Smart Deduplication** | SHA-256 file hashing prevents the same image from being added twice. |  
| **Configurable Quality** | Adjust compression quality from 20% to 80% with a simple slider (default: 70%). |  
| **ZIP Download** | Download all compressed images as a single ZIP file, organized into batch sub-folders. |  
| **Custom Naming** | Set a base filename and batch size to control output file and folder naming. |  
| **Real-Time Progress** | Live compression progress tracking with per-image status (pending → processing → completed/error). |  
| **Re-Compress** | Keep files in the queue and re-compress with different settings without re-uploading. |  
| **Upload Feedback** | Detailed stats on every upload: added, duplicates skipped, invalid files rejected, and truncated counts. |  
| **Accessible** | WCAG 2.2 AA compliant with keyboard-first interactions and visible focus states. |  
| **SEO Optimized** | Full Open Graph, Twitter Card, and JSON-LD structured data out of the box. |  
  
---  
  
## Supported Formats  
  
Quantipixor accepts **18 image extensions** across **20+ MIME types**:  
  
| Category | Formats |  
|---|---|  
| **JPEG family** | `.jpg`, `.jpeg`, `.jfif`, `.pjpeg` |  
| **PNG family** | `.png`, `.apng` |  
| **Modern formats** | `.webp`, `.avif`, `.heic`, `.heif` |  
| **Legacy/Other** | `.gif`, `.bmp`, `.svg`, `.ico`, `.cur`, `.tiff`, `.tif` |  
  
> **Note:** The Canvas API can reliably re-encode to **JPEG**, **WebP**, and **PNG** only. All other input formats (GIF, BMP, SVG, AVIF, TIFF, etc.) are rasterized to PNG during compression. Browser support for decoding HEIC/HEIF varies.  
  
---  
  
## How It Works  
  
```mermaid  
flowchart LR  
    A["Upload Images"] --> B["Validate & Deduplicate"]  
    B --> C["Canvas Compression"]  
    C --> D["Batch into ZIP"]  
    D --> E["Download"]  
```  
  
1. **Upload** — Drag & drop or use the file picker. Files are validated against format and size limits.  
2. **Deduplicate** — Each file is hashed with SHA-256 via `crypto.subtle.digest`. Duplicates are silently skipped.  
3. **Compress** — Images are drawn onto an HTML `<canvas>` and re-encoded at the configured quality level.  
4. **Package** — Compressed blobs are organized into `batch-N/` sub-folders and bundled into a ZIP using JSZip.  
5. **Download** — The ZIP is generated client-side and triggered as a browser download.  
  
---  
  
## Tech Stack  
  
| Layer | Technology |  
|---|---|  
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |  
| **UI Library** | [React 19](https://react.dev/) |  
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) |  
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) · Glassmorphism design system |  
| **UI Primitives** | [Radix UI](https://www.radix-ui.com/) (Dialog, AlertDialog, Slot) |  
| **Animations** | [Framer Motion](https://www.framer.com/motion/) |  
| **Icons** | [Lucide React](https://lucide.dev/) · [React Icons](https://react-icons.github.io/react-icons/) |  
| **ZIP Generation** | [JSZip](https://stuk.github.io/jszip/) |  
| **Typography** | Plus Jakarta Sans (primary) · JetBrains Mono (monospace) |  
| **Language** | TypeScript 5 |  
  
---  
  
## Project Structure  
  
```  
quantipixor/  
├── src/  
│   ├── app/                    # Next.js App Router pages & layouts  
│   │   ├── image/              # Image compressor page  
│   │   ├── layout.tsx          # Root layout (fonts, header, footer)  
│   │   ├── page.tsx            # Landing page with SEO metadata & JSON-LD  
│   │   └── globals.css         # Global styles  
│   ├── components/  
│   │   ├── global/             # Shared components (Loading, QuantipixorIcon)  
│   │   ├── image/              # Image compressor UI  
│   │   │   └── batch-compressor/  
│   │   ├── landing/            # Landing page sections (Hero, Features)  
│   │   ├── layout/             # Header & Footer  
│   │   └── ui/                 # Reusable primitives (Button, Card, Dialog, Badge, Toaster, AlertDialog)  
│   ├── const/                  # Constants & configuration  
│   │   ├── image-extensions.ts # 18 extensions, MIME maps, validation helpers  
│   │   ├── imageCompressorLimits.ts  # Upload & queue limits  
│   │   └── social-links.ts    # Creator social links  
│   ├── hooks/  
│   │   └── useImageCompressor.ts  # Custom hook for compressor logic  
│   ├── lib/                    # Shared utilities  
│   ├── store/  
│   │   └── imageCompressorStore.ts  # Zustand store (state + actions)  
│   ├── types/  
│   │   └── index.ts            # TypeScript interfaces (ImageItem, CompressionConfig, etc.)  
│   └── utils/  
│       └── image/  
│           ├── compress.ts     # Canvas-based compression engine  
│           ├── formatBytes.ts  # Human-readable file size formatting  
│           ├── hash.ts         # SHA-256 file hashing for deduplication  
│           ├── validation.ts   # Format & size validation  
│           └── zipGenerator.ts # ZIP archive generation with batch folders  
├── CLAUDE.md                   # Design system guidelines  
├── next.config.ts  
├── package.json  
└── tsconfig.json  
```  
  
---  
  
## Getting Started  
  
### Prerequisites  
  
- **Node.js** >= 18  
- **npm**, **yarn**, **pnpm**, or **bun**  
  
### Installation  
  
```bash  
# Clone the repository  [header-1](#header-1)
git clone https://github.com/ByteCrister/quantipixor.git  
cd quantipixor  
  
# Install dependencies  [header-2](#header-2)
npm install  
  
# Start the development server  [header-3](#header-3)
npm run dev  
```  
  
Open [http://localhost:3000](http://localhost:3000) in your browser.  
  
### Available Scripts  
  
| Command | Description |  
|---|---|  
| `npm run dev` | Start development server |  
| `npm run build` | Create production build |  
| `npm run start` | Start production server |  
| `npm run lint` | Run ESLint |  
  
### Environment Variables  
  
| Variable | Description | Default |  
|---|---|---|  
| `NEXT_PUBLIC_SITE_URL` | Canonical site URL (used for SEO & JSON-LD) | `http://localhost:3000` |  
  
---  
  
## Configuration & Limits  
  
| Setting | Range | Default | Description |  
|---|---|---|---|  
| **Quality** | 0.2 – 0.8 | 0.7 | Compression quality (affects JPEG & WebP output) |  
| **Batch Size** | 1 – 100 | 10 | Images per sub-folder in the ZIP |  
| **Base Name** | any string | `"image"` | Prefix for output filenames (`image-1.jpg`, `image-2.png`) |  
| **Max File Size** | — | 15 MB | Individual file size limit |  
| **Per Upload** | — | 20 | Max images accepted per file picker / drop |  
| **Total Queue** | — | 50 | Max images in the queue at once |  
  
---  
  
## ZIP Output Structure  
  
```  
compressed-images-<timestamp>.zip  
├── batch-1/  
│   ├── image-1.jpg  
│   ├── image-2.png  
│   └── image-3.webp  
├── batch-2/  
│   ├── image-1.jpg  
│   └── image-2.png  
└── ...  
```  
  
Files are named `{baseName}-{sequenceWithinBatch}.{extension}` and grouped into `batch-{N}/` folders based on the configured batch size.  
  
---  
  
## Roadmap  
  
- [x] Batch image compression with quality control  
- [x] ZIP download with organized batch folders  
- [x] SHA-256 duplicate detection  
- [x] Drag & drop + file picker upload  
- [x] Real-time compression progress  
- [x] Re-compress with different settings  
- [x] SEO optimization (Open Graph, Twitter Cards, JSON-LD)  
- [x] WCAG 2.2 AA accessibility  
- [ ] **Image Format Converter** — Convert between formats (e.g., PNG → WebP, HEIC → JPEG, SVG → PNG)  
- [ ] **Image Resizer** — Resize images by dimensions, percentage, or aspect ratio with preset templates  
- [ ] **Bulk Resize + Compress** — Combined resize and compress pipeline in a single workflow  
- [ ] **Custom Output Format** — Choose the output format independently of the input (e.g., force all outputs to WebP)  
- [ ] **Image Cropper** — Interactive crop tool with aspect ratio presets (1:1, 16:9, 4:3, free)  
- [ ] **Image Metadata Viewer / Stripper** — View and optionally strip EXIF, IPTC, and XMP metadata  
- [ ] **Watermark Tool** — Add text or image watermarks to batches with position, opacity, and size controls  
- [ ] **Before/After Preview** — Side-by-side or slider comparison of original vs. compressed images  
- [ ] **Compression Presets** — Save and load named quality/format/size presets for repeated workflows  
- [ ] **Dark / Light Theme Toggle** — User-selectable theme with system preference detection  
- [ ] **PWA Support** — Installable progressive web app with offline capability  
- [ ] **Web Worker Compression** — Move compression to a Web Worker for non-blocking UI during large batches  
- [ ] **Drag-to-Reorder Queue** — Reorder images in the queue before compression  
- [ ] **Individual Image Settings** — Per-image quality and format overrides  
- [ ] **Cloud Export** — Optional one-click export to Google Drive, Dropbox, or clipboard  
  
---  
  
## Contributing  
  
Contributions are welcome! Please follow these steps:  
  
1. Fork the repository  
2. Create a feature branch (`git checkout -b feature/amazing-feature`)  
3. Commit your changes (`git commit -m 'Add amazing feature'`)  
4. Push to the branch (`git push origin feature/amazing-feature`)  
5. Open a Pull Request  
  
Please ensure your code passes linting (`npm run lint`) and follows the existing code style.  
  
---  
  
## License  
  
Distributed under the **MIT License**. See `LICENSE` for more information.  
  
---  
  
## Author  
  
**Sadiqul Islam Shakib**  
  
[![GitHub](https://img.shields.io/badge/GitHub-ByteCrister-181717?style=flat&logo=github)](https://github.com/ByteCrister)  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Sadiqul%20Islam%20Shakib-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/sadiqul-islam-shakib)  
[![Facebook](https://img.shields.io/badge/Facebook-Profile-1877F2?style=flat&logo=facebook)](https://www.facebook.com/sadiqulislam.shakib.33)  
[![Instagram](https://img.shields.io/badge/Instagram-Profile-E4405F?style=flat&logo=instagram)](https://www.instagram.com/_sadiqul_islam_shakib_)  
  
---  
  
<div align="center">  
  
**If you find Quantipixor useful, please consider giving it a star!**  
  
</div>