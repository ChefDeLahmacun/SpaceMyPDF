# PDFextend - Documentation & Notes

## Overview
PDFextend is a web application that allows users to add note space to PDF documents. It provides a live preview of both the original and extended PDFs, with efficient handling of large documents.

## Key Features

### PDF Preview System
- **Preview Limitation**: Both original and extended previews show maximum 10 pages for performance
- **Full Processing**: Final PDF will include all pages when downloaded
- **Live Preview**: Updates in real-time when adjusting note space width
- **Mobile Responsive**: Automatically adjusts layout and note space for mobile devices

### Note Space Control
- **Width Range**: 100px to 1000px
- **Preset Sizes**:
  - S: 200px
  - M: 400px
  - L: 600px
  - XL: 800px
- **Mobile View**: Automatically reduces to 60px on mobile devices (screens < 768px)
- **Patterns**: Optional note-taking patterns including lines, grid, and dots
- **Spacing Options**: Configurable spacing for patterns (10pt, 15pt, 20pt, 25pt, 30pt)

## Technical Details

### Dependencies
- Next.js 14.1.0
- pdf-lib: For PDF manipulation
- Tailwind CSS: For styling

### Key Components

#### PDFViewer (`src/components/PDFViewer.tsx`)
- Handles PDF preview generation
- Manages preview URLs and cleanup
- Implements mobile responsiveness
- Shows loading states during processing

#### NoteSpaceControl (`src/components/NoteSpaceControl.tsx`)
- Controls note space width
- Provides preset width options
- Implements smooth slider control
- Shows current width value

## Troubleshooting

### Common Issues

1. **PDF Loading Issues**
   - Ensure PDF is not corrupted
   - Check if file size is reasonable
   - Verify PDF is not password protected

2. **Preview Not Updating**
   - Check if note space width is changing
   - Verify PDF file is properly loaded
   - Clear browser cache if needed

3. **Performance Issues**
   - Large PDFs are limited to 10 pages in preview
   - Full PDF processing happens only when downloading
   - Mobile view automatically optimizes layout

4. **Browser Compatibility**
   - Uses native PDF viewer capabilities
   - Requires modern browser with PDF support
   - Falls back to "PDF preview not available" message if needed

## Configuration

### Next.js Configuration
```javascript
// next.config.js
- Webpack configuration removed for Turbopack compatibility
- Using Next.js 14.1.0 for stability
```

### Development
```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Notes for Future Updates

1. **Potential Enhancements**
   - Add download progress indicator
   - Implement page number selection
   - Add custom note space templates
   - Support for PDF annotations

2. **Performance Optimizations**
   - Currently using efficient preview generation
   - URL cleanup implemented for memory management
   - Separate preview generation for original and extended PDFs

## Error Messages & Solutions

### Font Loading Issues
If seeing: "Failed to download `Inter` from Google Fonts"
- This is a non-critical error
- System falls back to default fonts
- Does not affect PDF functionality

### PDF Processing Errors
If PDF fails to process:
1. Check file format and size
2. Ensure PDF is not corrupted
3. Try with a different PDF file
4. Clear browser cache and reload

## Contact & Support
For issues and feature requests, please refer to the project repository. 