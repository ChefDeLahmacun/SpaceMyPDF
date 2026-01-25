import { PDFDocument, rgb } from 'pdf-lib';

// Convert hex color to RGB
export const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : null;
};

// Generate PDF preview
export const generatePDFPreview = async (
  file: File,
  noteSpaceWidth: number,
  noteSpacePosition: string,
  colorOption: string,
  customColor: string
) => {
  // Read the file
  const fileBuffer = await file.arrayBuffer();
  const originalPdfDoc = await PDFDocument.load(fileBuffer);
  const totalPageCount = originalPdfDoc.getPageCount();

  // Create original preview document (max 3 pages)
  const originalPreviewDoc = await PDFDocument.create();
  const pagesToPreview = Math.min(totalPageCount, 3);

  // Copy pages to original preview document without modifications
  for (let i = 0; i < pagesToPreview; i++) {
    const [originalPage] = await originalPreviewDoc.copyPages(originalPdfDoc, [i]);
    originalPreviewDoc.addPage(originalPage);
  }

  // Save and create URL for original preview
  const originalPdfBytes = await originalPreviewDoc.save();
  
  // Create original preview URL
  const originalPreviewUrl = URL.createObjectURL(new Blob([originalPdfBytes], { type: 'application/pdf' }));
  
  // Create modified preview document (max 3 pages)
  const modifiedPreviewDoc = await PDFDocument.create();

  // Copy pages to modified preview document
  for (let i = 0; i < pagesToPreview; i++) {
    // If noteSpaceWidth is provided, create a new page with extended dimensions
    if (noteSpaceWidth > 0) {
      const originalPage = originalPdfDoc.getPage(i);
      const rotation = originalPage.getRotation().angle;
      
      // Get size considering rotation
      const { width, height } = originalPage.getSize();
      
      // Calculate new dimensions based on position
      let newWidth = width;
      let newHeight = height;
      
      if (noteSpacePosition === 'right' || noteSpacePosition === 'left') {
        newWidth = width + noteSpaceWidth;
      } else { // top or bottom
        newHeight = height + noteSpaceWidth;
      }
      
      // Create a new blank page with the new dimensions
      const newPage = modifiedPreviewDoc.addPage([newWidth, newHeight]);
      
      // Set the same rotation as original
      newPage.setRotation({ type: 'degrees', angle: rotation });
      
      // Embed the original page content
      const embeddedPage = await modifiedPreviewDoc.embedPage(originalPage);
      
      // Calculate position for the embedded content
      let contentX = 0;
      let contentY = 0;
      
      if (noteSpacePosition === 'left') {
        contentX = noteSpaceWidth;
      } else if (noteSpacePosition === 'bottom') {
        contentY = noteSpaceWidth;
      }
      
      // Draw the embedded page at the correct position
      newPage.drawPage(embeddedPage, {
        x: contentX,
        y: contentY
      });
      
      // Apply color to the note space
      const color = colorOption === 'custom' ? customColor : '#ffffff';
      const rgbColor = hexToRgb(color);
      if (rgbColor) {
        // Position the rectangle based on the selected position
        let x = 0, y = 0;
        let rectWidth = 0, rectHeight = 0;
        
        switch (noteSpacePosition) {
          case 'right':
            x = width;
            y = 0;
            rectWidth = noteSpaceWidth;
            rectHeight = height;
            break;
          case 'left':
            x = 0;
            y = 0;
            rectWidth = noteSpaceWidth;
            rectHeight = height;
            break;
          case 'top':
            x = 0;
            y = height;
            rectWidth = width;
            rectHeight = noteSpaceWidth;
            break;
          case 'bottom':
            x = 0;
            y = 0;
            rectWidth = width;
            rectHeight = noteSpaceWidth;
            break;
        }
        
        // Draw the colored rectangle
        newPage.drawRectangle({
          x,
          y,
          width: rectWidth,
          height: rectHeight,
          color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
        });
      }
    } else {
      // If no note space width is provided, just copy the original page
      const [originalPage] = await modifiedPreviewDoc.copyPages(originalPdfDoc, [i]);
      modifiedPreviewDoc.addPage(originalPage);
    }
  }

  // Save and create URL for modified preview
  const modifiedPdfBytes = await modifiedPreviewDoc.save();
  const modifiedPreviewUrl = URL.createObjectURL(new Blob([modifiedPdfBytes], { type: 'application/pdf' }));

  return {
    originalPreviewUrl,
    modifiedPreviewUrl,
    totalPageCount
  };
};

// Process PDF for download
export const processPDFForDownload = async (
  file: File,
  noteSpaceWidth: number,
  noteSpacePosition: string,
  colorOption: string,
  customColor: string
) => {
  // Read the file
  const fileBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(fileBuffer);
  const pageCount = pdfDoc.getPageCount();
  
  // Create a new document
  const newPdfDoc = await PDFDocument.create();
  
  // Process each page
  for (let i = 0; i < pageCount; i++) {
    const originalPage = pdfDoc.getPage(i);
    const rotation = originalPage.getRotation().angle;
    
    // Get size considering rotation
    const { width, height } = originalPage.getSize();
    
    // Calculate new dimensions based on position
    let newWidth = width;
    let newHeight = height;
    
    if (noteSpacePosition === 'right' || noteSpacePosition === 'left') {
      newWidth = width + noteSpaceWidth;
    } else { // top or bottom
      newHeight = height + noteSpaceWidth;
    }
    
    // Create a new blank page with the new dimensions
    const newPage = newPdfDoc.addPage([newWidth, newHeight]);
    
    // Set the same rotation as original
    newPage.setRotation({ type: 'degrees', angle: rotation });
    
    // Embed the original page content
    const embeddedPage = await newPdfDoc.embedPage(originalPage);
    
    // Calculate position for the embedded content
    let contentX = 0;
    let contentY = 0;
    
    if (noteSpacePosition === 'left') {
      contentX = noteSpaceWidth;
    } else if (noteSpacePosition === 'bottom') {
      contentY = noteSpaceWidth;
    }
    
    // Draw the embedded page at the correct position
    newPage.drawPage(embeddedPage, {
      x: contentX,
      y: contentY
    });
    
    // Apply color to the note space
    const color = colorOption === 'custom' ? customColor : '#ffffff';
    const rgbColor = hexToRgb(color);
    if (rgbColor) {
      // Position the rectangle based on the selected position
      let x = 0, y = 0;
      let rectWidth = 0, rectHeight = 0;
      
      switch (noteSpacePosition) {
        case 'right':
          x = width;
          y = 0;
          rectWidth = noteSpaceWidth;
          rectHeight = height;
          break;
        case 'left':
          x = 0;
          y = 0;
          rectWidth = noteSpaceWidth;
          rectHeight = height;
          break;
        case 'top':
          x = 0;
          y = height;
          rectWidth = width;
          rectHeight = noteSpaceWidth;
          break;
        case 'bottom':
          x = 0;
          y = 0;
          rectWidth = width;
          rectHeight = noteSpaceWidth;
          break;
      }
      
      // Draw the colored rectangle
      newPage.drawRectangle({
        x,
        y,
        width: rectWidth,
        height: rectHeight,
        color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
      });
    }
  }
  
  // Save the document
  const pdfBytes = await newPdfDoc.save();
  return pdfBytes;
}; 