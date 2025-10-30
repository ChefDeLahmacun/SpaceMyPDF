'use client';

import React, { useState, useRef, useEffect, useLayoutEffect, useContext, useCallback } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import Image from 'next/image';
import Layout, { GreenContentRefContext } from './components/Layout';
import Header from './components/Header';
import Features from './components/Features';
import Controls from './components/Controls';
import Preview from './components/Preview';
import FeedbackForm from './components/FeedbackForm';
import WhiteBox from './components/WhiteBox';
import DonationsBox from './components/DonationsBox';
import MobileOrientationMessage from './components/MobileOrientationMessage';
import DownloadRestriction from './components/DownloadRestriction';
import MembershipBanner from './components/MembershipBanner';
import UserStatus from './components/UserStatus';
import MembershipModal from './components/MembershipModal';
import { useAnalytics } from './utils/useAnalytics';
import './components/GreenSectionFinal.css';

export default function Home() {
  const { trackEvent } = useAnalytics();
  const [file, setFile] = useState<File | null>(null);
  const [noteSpaceWidth, setNoteSpaceWidth] = useState(70);
  const [horizontalNoteSpaceWidth, setHorizontalNoteSpaceWidth] = useState(70); // For left/right note spaces
  const [verticalNoteSpaceWidth, setVerticalNoteSpaceWidth] = useState(70); // For top/bottom note spaces
  const [useSeparateWidths, setUseSeparateWidths] = useState(false); // Toggle for separate width controls
  const [outputFileName, setOutputFileName] = useState('');
  const [baseFileName, setBaseFileName] = useState('');
  const [includeWithNotes, setIncludeWithNotes] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | { original: string, modified: string }>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [downloadIsProcessing, setDownloadIsProcessing] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [referralCode, setReferralCode] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New state variables for color options
  const [useCustomColor, setUseCustomColor] = useState(true);
  const [colorOption, setColorOption] = useState('white'); // 'white', 'custom'
  const [customColor, setCustomColor] = useState('#ffffff'); // Default white
  const [noteSpacePosition, setNoteSpacePosition] = useState('right'); // 'right', 'left', 'top', 'bottom'
  
  // New state variables for multiple note space positions
  const [noteSpacePositions, setNoteSpacePositions] = useState<string[]>(['right']); // Array of selected positions
  
  // New state variables for note patterns
  const [notePattern, setNotePattern] = useState('none'); // 'none', 'lines', 'grid', 'dots'
  const [lineSpacing, setLineSpacing] = useState(20); // Default 20pt spacing
  const [gridSpacing, setGridSpacing] = useState(20); // Default 20pt spacing
  const [dotSpacing, setDotSpacing] = useState(20); // Default 20pt spacing
  
  const predefinedColors = [
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#f0f0f0' },
    { name: 'Gray', value: '#cccccc' },
    { name: 'Black', value: '#000000' },
    { name: 'Light Blue', value: '#e6f7ff' },
    { name: 'Light Yellow', value: '#ffffcc' },
    { name: 'Light Green', value: '#e6ffcc' },
    { name: 'Light Pink', value: '#ffe6e6' }
  ];

  // New state for feedback image
  const [feedbackImages, setFeedbackImages] = useState<File[]>([]);
  const [feedbackImagePreviews, setFeedbackImagePreviews] = useState<string[]>([]);
  const feedbackImageRef = useRef<HTMLInputElement>(null);

  // New state for tracking if the feedback section needs extra height
  const [feedbackSectionNeedsExtraHeight, setFeedbackSectionNeedsExtraHeight] = useState(false);
  
  // Add state to track if the component is fully mounted and measured
  const [isMounted, setIsMounted] = useState(false);
  
  // New state for specifying save location
  const [specifyLocation, setSpecifyLocation] = useState(false);
  
  
  // Use useLayoutEffect to ensure everything is ready before rendering
  useLayoutEffect(() => {
    // Mark component as fully mounted after a delay
    // This ensures all DOM elements are properly rendered
    const timer = setTimeout(() => {
      setIsMounted(true);
      // Force a resize event after mounting
      window.dispatchEvent(new Event('resize'));
    }, 300); // Increased delay to ensure all measurements are complete
    
    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = (uploadedFile: File) => {
    // Check if file size exceeds 50MB
    if (uploadedFile.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB limit. Please choose a smaller file.');
      // Track file size error
      trackEvent(
        'file_upload_error',
        'PDF Processing',
        'File size exceeds limit',
      );
      return;
    }
    
    setIsProcessing(true); // Set processing state immediately when file is uploaded
    setFile(uploadedFile);
    setBaseFileName(uploadedFile.name.replace('.pdf', ''));
    updateOutputFileName(uploadedFile.name.replace('.pdf', ''), includeWithNotes);
    setPdfPreviewUrl('');
    setSuccessMessage('');
    
    // Track successful file upload
    trackEvent(
      'file_upload',
      'PDF Processing',
      'File uploaded successfully',
      Math.round(uploadedFile.size / 1024) // Size in KB as value
    );
  };

  const clearFile = () => {
    setFile(null);
    setPdfPreviewUrl('');
    setBaseFileName('');
    setOutputFileName('');
    setSuccessMessage('');
    setIsProcessing(false); // Clear processing state when file is cleared
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Update the output filename when baseFileName or includeWithNotes changes
  const updateOutputFileName = (base: string, withNotes: boolean) => {
    if (base) {
      setOutputFileName(withNotes ? `${base}_with_notes.pdf` : `${base}.pdf`);
    }
  };

  useEffect(() => {
    updateOutputFileName(baseFileName, includeWithNotes);
  }, [baseFileName, includeWithNotes]);

  // Check for referral code in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode) {
        setReferralCode(refCode);
        
        // Check if user is already logged in
        const token = localStorage.getItem('token');
        if (token) {
          // User is logged in, don't show signup modal
          // Just track the referral link visit
          trackEvent('referral_link_visited', 'referral', refCode);
          // Clear the referral code from URL to prevent redirect loop
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        } else {
          // User is not logged in, show signup modal
          setShowMembershipModal(true);
          trackEvent('referral_link_visited', 'referral', refCode);
        }
      }
    }
  }, [trackEvent]);

  // Handle base filename change
  const handleBaseFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newBaseFileName = e.target.value;
    setBaseFileName(newBaseFileName);
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeWithNotes(e.target.checked);
  };

  // Reset base filename
  const resetBaseFileName = () => {
    if (file) {
      const baseName = file.name.replace(/\.pdf$/, '');
      setBaseFileName(baseName);
    } else {
      setBaseFileName('');
    }
  };

  // PDF Viewer functionality
  useEffect(() => {
    const generatePreview = async () => {
      if (!file) return;
      
      try {
        setIsProcessing(true);
        
        // Read the file
        const fileBuffer = await file.arrayBuffer();
        const originalPdfDoc = await PDFDocument.load(fileBuffer);
        const totalPageCount = originalPdfDoc.getPageCount();
        setTotalPages(totalPageCount);

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
              const { width, height } = originalPage.getSize();
              
              // Calculate new dimensions based on all selected positions
              let newWidth = width;
              let newHeight = height;
              let contentX = 0;
              let contentY = 0;
              
              // Use separate widths if enabled and multiple sides are selected
              const leftRightWidth = useSeparateWidths ? horizontalNoteSpaceWidth : noteSpaceWidth;
              const topBottomWidth = useSeparateWidths ? verticalNoteSpaceWidth : noteSpaceWidth;
              
              // Calculate total space needed for all positions
              if (noteSpacePositions.includes('right')) {
                newWidth += (width * leftRightWidth / 100);
              }
              if (noteSpacePositions.includes('left')) {
                newWidth += (width * leftRightWidth / 100);
                contentX = (width * leftRightWidth / 100);
              }
              if (noteSpacePositions.includes('top')) {
                newHeight += (height * topBottomWidth / 100);
              }
              if (noteSpacePositions.includes('bottom')) {
                newHeight += (height * topBottomWidth / 100);
                contentY = (height * topBottomWidth / 100);
              }
              
              // Create a new blank page with the new dimensions
              const newPage = modifiedPreviewDoc.addPage([newWidth, newHeight]);
              
              // Embed the original page content
              const embeddedPage = await modifiedPreviewDoc.embedPage(originalPage);
              
              // Draw the embedded page at the correct position
              newPage.drawPage(embeddedPage, {
                x: contentX,
                y: contentY
              });
              
              // Apply color and patterns to all note spaces
              const color = colorOption === 'custom' ? customColor : '#ffffff';
              const rgbColor = hexToRgb(color);
              if (rgbColor) {
                // Instead of drawing separate rectangles, fill the entire note space area
                // This ensures no gaps in intersections
                
                // Fill left note space (if selected)
                if (noteSpacePositions.includes('left')) {
                  const x = 0;
                  const y = 0;
                  const rectWidth = (width * leftRightWidth / 100);
                  const rectHeight = newHeight;
                  
                  newPage.drawRectangle({
                    x,
                    y,
                    width: rectWidth,
                    height: rectHeight,
                    color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
                  });
                }
                
                // Fill right note space (if selected)
                if (noteSpacePositions.includes('right')) {
                  const x = contentX + width;
                  const y = 0;
                  const rectWidth = (width * leftRightWidth / 100);
                  const rectHeight = newHeight;
                  
                  newPage.drawRectangle({
                    x,
                    y,
                    width: rectWidth,
                    height: rectHeight,
                    color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
                  });
                }
                
                // Fill top note space (if selected)
                if (noteSpacePositions.includes('top')) {
                  const x = contentX;
                  const y = contentY + height;
                  const rectWidth = width;
                  const rectHeight = (height * topBottomWidth / 100);
                  
                  newPage.drawRectangle({
                    x,
                    y,
                    width: rectWidth,
                    height: rectHeight,
                    color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
                  });
                }
                
                // Fill bottom note space (if selected)
                if (noteSpacePositions.includes('bottom')) {
                  const x = contentX;
                  const y = 0;
                  const rectWidth = width;
                  const rectHeight = (height * topBottomWidth / 100);
                  
                  newPage.drawRectangle({
                    x,
                    y,
                    width: rectWidth,
                    height: rectHeight,
                    color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
                  });
                }
                
                // Draw proper seamless patterns by filling the entire note space area
                if (notePattern !== 'none') {
                  const spacing = notePattern === 'lines' ? lineSpacing : notePattern === 'grid' ? gridSpacing : dotSpacing;
                  
                  if (notePattern === 'lines') {
                    // Draw horizontal lines that span the entire note space area
                    for (let lineY = 0; lineY <= newHeight; lineY += spacing) {
                      // Only draw if this line intersects with note space areas
                      if (lineY < contentY || lineY >= contentY + height) {
                        // This line is in top or bottom note space - draw full width
                        newPage.drawLine({
                          start: { x: 0, y: lineY },
                          end: { x: newWidth, y: lineY },
                          thickness: 0.5,
                          color: rgb(0.7, 0.7, 0.7)
                        });
                      } else {
                        // This line is at the same height as the PDF content
                        // Draw left note space line
                        if (noteSpacePositions.includes('left')) {
                          newPage.drawLine({
                            start: { x: 0, y: lineY },
                            end: { x: contentX, y: lineY },
                            thickness: 0.5,
                            color: rgb(0.7, 0.7, 0.7)
                          });
                        }
                        // Draw right note space line
                        if (noteSpacePositions.includes('right')) {
                          newPage.drawLine({
                            start: { x: contentX + width, y: lineY },
                            end: { x: newWidth, y: lineY },
                            thickness: 0.5,
                            color: rgb(0.7, 0.7, 0.7)
                          });
                        }
                      }
                    }
                  } else if (notePattern === 'grid') {
                    // Draw horizontal lines
                    for (let lineY = 0; lineY <= newHeight; lineY += spacing) {
                      if (lineY < contentY || lineY >= contentY + height) {
                        // Full width line for top/bottom note spaces
                        newPage.drawLine({
                          start: { x: 0, y: lineY },
                          end: { x: newWidth, y: lineY },
                          thickness: 0.5,
                          color: rgb(0.7, 0.7, 0.7)
                        });
                      } else {
                        // Split line for left/right note spaces
                        if (noteSpacePositions.includes('left')) {
                          newPage.drawLine({
                            start: { x: 0, y: lineY },
                            end: { x: contentX, y: lineY },
                            thickness: 0.5,
                            color: rgb(0.7, 0.7, 0.7)
                          });
                        }
                        if (noteSpacePositions.includes('right')) {
                          newPage.drawLine({
                            start: { x: contentX + width, y: lineY },
                            end: { x: newWidth, y: lineY },
                            thickness: 0.5,
                            color: rgb(0.7, 0.7, 0.7)
                          });
                        }
                      }
                    }
                    
                    // Draw vertical lines
                    for (let lineX = 0; lineX <= newWidth; lineX += spacing) {
                      if (lineX < contentX || lineX >= contentX + width) {
                        // Full height line for left/right note spaces
                        newPage.drawLine({
                          start: { x: lineX, y: 0 },
                          end: { x: lineX, y: newHeight },
                          thickness: 0.5,
                          color: rgb(0.7, 0.7, 0.7)
                        });
                      } else {
                        // Split line for top/bottom note spaces
                        if (noteSpacePositions.includes('bottom')) {
                          newPage.drawLine({
                            start: { x: lineX, y: 0 },
                            end: { x: lineX, y: contentY },
                            thickness: 0.5,
                            color: rgb(0.7, 0.7, 0.7)
                          });
                        }
                        if (noteSpacePositions.includes('top')) {
                          newPage.drawLine({
                            start: { x: lineX, y: contentY + height },
                            end: { x: lineX, y: newHeight },
                            thickness: 0.5,
                            color: rgb(0.7, 0.7, 0.7)
                          });
                        }
                      }
                    }
                  } else if (notePattern === 'dots') {
                    // Draw dots in a grid pattern across the entire note space area
                    for (let dotY = 0; dotY <= newHeight; dotY += spacing) {
                      for (let dotX = 0; dotX <= newWidth; dotX += spacing) {
                        // Skip dots that would be inside the PDF content area
                        if (dotX >= contentX && dotX < contentX + width && 
                            dotY >= contentY && dotY < contentY + height) {
                          continue;
                        }
                        
                        newPage.drawCircle({
                          x: dotX,
                          y: dotY,
                          size: 1,
                          color: rgb(0.7, 0.7, 0.7)
                        });
                      }
                    }
                  }
                }
              }
          } else {
            // If no note space is needed, just copy the original page
            const [page] = await modifiedPreviewDoc.copyPages(originalPdfDoc, [i]);
            modifiedPreviewDoc.addPage(page);
          }
        }

        // Save and create URL for modified preview
        const modifiedPdfBytes = await modifiedPreviewDoc.save();
        
        // Clean up old preview URL
        if (pdfPreviewUrl) {
          if (typeof pdfPreviewUrl === 'object') {
            URL.revokeObjectURL(pdfPreviewUrl.original);
            URL.revokeObjectURL(pdfPreviewUrl.modified);
          } else {
            URL.revokeObjectURL(pdfPreviewUrl);
          }
        }

        // Create new preview URL for modified PDF
        const modifiedPreviewUrl = URL.createObjectURL(new Blob([modifiedPdfBytes], { type: 'application/pdf' }));
        
        // Set the preview URLs
        setPdfPreviewUrl({
          original: originalPreviewUrl,
          modified: modifiedPreviewUrl
        });
        
        // Set isProcessing to false immediately after setting preview URLs
        setIsProcessing(false);
      } catch (error) {
        console.error('Error generating preview:', error);
        setIsProcessing(false);
      }
    };

    if (file) {
      generatePreview();
    }

    // Cleanup function
    return () => {
      if (pdfPreviewUrl) {
        if (typeof pdfPreviewUrl === 'object') {
          URL.revokeObjectURL(pdfPreviewUrl.original);
          URL.revokeObjectURL(pdfPreviewUrl.modified);
        } else {
          URL.revokeObjectURL(pdfPreviewUrl);
        }
      }
    };
  }, [file, noteSpaceWidth, colorOption, customColor, noteSpacePosition, noteSpacePositions, notePattern, lineSpacing, gridSpacing, dotSpacing, useSeparateWidths, horizontalNoteSpaceWidth, verticalNoteSpaceWidth]);

  // Download functionality
  const handleDownload = async () => {
    if (!file) return;
    
    try {
      setDownloadIsProcessing(true);
      
      // Track download start
      trackEvent(
        'download_start',
        'PDF Processing',
        'Started PDF download process'
      );

      // Read the file
      const fileBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(fileBuffer);
      
      // Create a new PDF document for the modified pages
      const modifiedPdfDoc = await PDFDocument.create();
      
      // Process each page
      const pages = pdfDoc.getPages();
      for (let i = 0; i < pages.length; i++) {
        const originalPage = pdfDoc.getPage(i);
        const { width, height } = originalPage.getSize();
        
        // If noteSpaceWidth is provided, create a new page with extended dimensions
        if (noteSpaceWidth > 0) {
          // Calculate new dimensions based on all selected positions
          let newWidth = width;
          let newHeight = height;
          let contentX = 0;
          let contentY = 0;
          
          // Use separate widths if enabled and multiple sides are selected
          const leftRightWidth = useSeparateWidths ? horizontalNoteSpaceWidth : noteSpaceWidth;
          const topBottomWidth = useSeparateWidths ? verticalNoteSpaceWidth : noteSpaceWidth;
          
          // Calculate total space needed for all positions
          if (noteSpacePositions.includes('right')) {
            newWidth += (width * leftRightWidth / 100);
          }
          if (noteSpacePositions.includes('left')) {
            newWidth += (width * leftRightWidth / 100);
            contentX = (width * leftRightWidth / 100);
          }
          if (noteSpacePositions.includes('top')) {
            newHeight += (height * topBottomWidth / 100);
          }
          if (noteSpacePositions.includes('bottom')) {
            newHeight += (height * topBottomWidth / 100);
            contentY = (height * topBottomWidth / 100);
          }
          
          // Create a new blank page with the new dimensions
          const newPage = modifiedPdfDoc.addPage([newWidth, newHeight]);
          
          // Embed the original page content
          const embeddedPage = await modifiedPdfDoc.embedPage(originalPage);
          
          // Draw the embedded page at the correct position
          newPage.drawPage(embeddedPage, {
            x: contentX,
            y: contentY
          });
          
          // Apply color and patterns to all note spaces
          const color = colorOption === 'custom' ? customColor : '#ffffff';
          const rgbColor = hexToRgb(color);
          if (rgbColor) {
            // Instead of drawing separate rectangles, fill the entire note space area
            // This ensures no gaps in intersections
            
            // Fill left note space (if selected)
            if (noteSpacePositions.includes('left')) {
              const x = 0;
              const y = 0;
              const rectWidth = (width * leftRightWidth / 100);
              const rectHeight = newHeight;
              
              newPage.drawRectangle({
                x,
                y,
                width: rectWidth,
                height: rectHeight,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
              });
            }
            
            // Fill right note space (if selected)
            if (noteSpacePositions.includes('right')) {
              const x = contentX + width;
              const y = 0;
              const rectWidth = (width * leftRightWidth / 100);
              const rectHeight = newHeight;
              
              newPage.drawRectangle({
                x,
                y,
                width: rectWidth,
                height: rectHeight,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
              });
            }
            
            // Fill top note space (if selected)
            if (noteSpacePositions.includes('top')) {
              const x = contentX;
              const y = contentY + height;
              const rectWidth = width;
              const rectHeight = (height * topBottomWidth / 100);
              
              newPage.drawRectangle({
                x,
                y,
                width: rectWidth,
                height: rectHeight,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
              });
            }
            
            // Fill bottom note space (if selected)
            if (noteSpacePositions.includes('bottom')) {
              const x = contentX;
              const y = 0;
              const rectWidth = width;
              const rectHeight = (height * topBottomWidth / 100);
              
              newPage.drawRectangle({
                x,
                y,
                width: rectWidth,
                height: rectHeight,
                color: rgb(rgbColor.r, rgbColor.g, rgbColor.b)
              });
            }
            
            // Draw proper seamless patterns by filling the entire note space area
            if (notePattern !== 'none') {
              const spacing = notePattern === 'lines' ? lineSpacing : notePattern === 'grid' ? gridSpacing : dotSpacing;
              
              if (notePattern === 'lines') {
                // Draw horizontal lines that span the entire note space area
                for (let lineY = 0; lineY <= newHeight; lineY += spacing) {
                  // Only draw if this line intersects with note space areas
                  if (lineY < contentY || lineY >= contentY + height) {
                    // This line is in top or bottom note space - draw full width
                    newPage.drawLine({
                      start: { x: 0, y: lineY },
                      end: { x: newWidth, y: lineY },
                      thickness: 0.5,
                      color: rgb(0.7, 0.7, 0.7)
                    });
                  } else {
                    // This line is at the same height as the PDF content
                    // Draw left note space line
                    if (noteSpacePositions.includes('left')) {
                      newPage.drawLine({
                        start: { x: 0, y: lineY },
                        end: { x: contentX, y: lineY },
                        thickness: 0.5,
                        color: rgb(0.7, 0.7, 0.7)
                      });
                    }
                    // Draw right note space line
                    if (noteSpacePositions.includes('right')) {
                      newPage.drawLine({
                        start: { x: contentX + width, y: lineY },
                        end: { x: newWidth, y: lineY },
                        thickness: 0.5,
                        color: rgb(0.7, 0.7, 0.7)
                      });
                    }
                  }
                }
              } else if (notePattern === 'grid') {
                // Draw horizontal lines
                for (let lineY = 0; lineY <= newHeight; lineY += spacing) {
                  if (lineY < contentY || lineY >= contentY + height) {
                    // Full width line for top/bottom note spaces
                    newPage.drawLine({
                      start: { x: 0, y: lineY },
                      end: { x: newWidth, y: lineY },
                      thickness: 0.5,
                      color: rgb(0.7, 0.7, 0.7)
                    });
                  } else {
                    // Split line for left/right note spaces
                    if (noteSpacePositions.includes('left')) {
                      newPage.drawLine({
                        start: { x: 0, y: lineY },
                        end: { x: contentX, y: lineY },
                        thickness: 0.5,
                        color: rgb(0.7, 0.7, 0.7)
                      });
                    }
                    if (noteSpacePositions.includes('right')) {
                      newPage.drawLine({
                        start: { x: contentX + width, y: lineY },
                        end: { x: newWidth, y: lineY },
                        thickness: 0.5,
                        color: rgb(0.7, 0.7, 0.7)
                      });
                    }
                  }
                }
                
                // Draw vertical lines
                for (let lineX = 0; lineX <= newWidth; lineX += spacing) {
                  if (lineX < contentX || lineX >= contentX + width) {
                    // Full height line for left/right note spaces
                    newPage.drawLine({
                      start: { x: lineX, y: 0 },
                      end: { x: lineX, y: newHeight },
                      thickness: 0.5,
                      color: rgb(0.7, 0.7, 0.7)
                    });
                  } else {
                    // Split line for top/bottom note spaces
                    if (noteSpacePositions.includes('bottom')) {
                      newPage.drawLine({
                        start: { x: lineX, y: 0 },
                        end: { x: lineX, y: contentY },
                        thickness: 0.5,
                        color: rgb(0.7, 0.7, 0.7)
                      });
                    }
                    if (noteSpacePositions.includes('top')) {
                      newPage.drawLine({
                        start: { x: lineX, y: contentY + height },
                        end: { x: lineX, y: newHeight },
                        thickness: 0.5,
                        color: rgb(0.7, 0.7, 0.7)
                      });
                        }
                      }
                    }
                  } else if (notePattern === 'dots') {
                    // Draw dots in a grid pattern across the entire note space area
                    for (let dotY = 0; dotY <= newHeight; dotY += spacing) {
                      for (let dotX = 0; dotX <= newWidth; dotX += spacing) {
                        // Skip dots that would be inside the PDF content area
                        if (dotX >= contentX && dotX < contentX + width && 
                            dotY >= contentY && dotY < contentY + height) {
                          continue;
                        }
                        
                        newPage.drawCircle({
                          x: dotX,
                          y: dotY,
                          size: 1,
                          color: rgb(0.7, 0.7, 0.7)
                        });
                      }
                    }
                  }
                }
          }
        } else {
          // If no note space is needed, just copy the original page
          const [copiedPage] = await modifiedPdfDoc.copyPages(pdfDoc, [i]);
          modifiedPdfDoc.addPage(copiedPage);
        }
      }
      
      // Save the modified PDF
      const modifiedPdfBytes = await modifiedPdfDoc.save();
      
      if (specifyLocation) {
        // Use the File System Access API if available
        if ('showSaveFilePicker' in window) {
          try {
            const suggestedName = outputFileName || file.name.replace('.pdf', '_with_notes.pdf');
            const fileHandle = await (window as any).showSaveFilePicker({
              suggestedName,
              types: [{
                description: 'PDF Document',
                accept: { 'application/pdf': ['.pdf'] }
              }]
            });
            
            const writable = await fileHandle.createWritable();
            await writable.write(modifiedPdfBytes);
            await writable.close();
            
            // After processing, show success message
            setIsProcessing(false);
            setSuccessMessage('PDF saved successfully!');
            
            // Reset the success message after 5 seconds
            setTimeout(() => {
              setSuccessMessage('');
            }, 5000);
            
            clearAllFeedbackImages();
            setFeedbackSectionNeedsExtraHeight(false);
            
            // Increment PDF processed count
            try {
              const token = localStorage.getItem('token');
              if (token) {
                await fetch('/api/analytics/user-stats', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({ action: 'increment_pdf_processed' })
                });
              }
            } catch (error) {
              console.error('Failed to update analytics:', error);
            }
          } catch (error) {
            // User cancelled the save dialog
          }
        } else {
          // Fallback for browsers that don't support File System Access API
          alert('Your browser does not support the File System Access API. The file will be downloaded directly.');
          downloadFile(modifiedPdfBytes);
        }
      } else {
        // Direct download without dialog
        downloadFile(modifiedPdfBytes);
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Error processing PDF. Please try again with a different file.');
      
      // Track download error
      trackEvent(
        'download_error',
        'PDF Processing',
        'Error processing PDF',
      );
    } finally {
      setDownloadIsProcessing(false);
    }
  };
  
  // Helper function to download file directly
  const downloadFile = (pdfBytes: Uint8Array) => {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const filename = outputFileName || file!.name.replace('.pdf', '_with_notes.pdf');
    link.download = filename;
    
    // Set additional attributes to force download without dialog
    link.style.display = 'none';
    link.setAttribute('target', '_self');
    
    document.body.appendChild(link);
    
    // Use a small delay to ensure the link is ready
    setTimeout(() => {
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
    }, 0);

    // After processing, show success message
    setIsProcessing(false);
    setSuccessMessage('PDF downloaded successfully!');
    
    // Track successful download
    trackEvent(
      'download_complete',
      'PDF Processing',
      'PDF downloaded successfully',
      Math.round(pdfBytes.length / 1024) // Size in KB as value
    );
    
    // Increment PDF processed count
    try {
      const token = localStorage.getItem('token');
      if (token) {
        fetch('/api/analytics/user-stats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'increment_pdf_processed' })
        })
          .then(response => response.json())
          .catch(error => {
            console.error('[PDF Download] Failed to update analytics:', error);
          });
      }
    } catch (error) {
      console.error('[PDF Download] Failed to update analytics:', error);
    }
    
    // Reset the success message after 5 seconds
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
    
    clearAllFeedbackImages();
    setFeedbackSectionNeedsExtraHeight(false);
  };

  // Helper function to convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255
    } : null;
  };

  // Helper function to draw note patterns
  const drawNotePattern = (page: any, noteSpaceRect: { x: number, y: number, width: number, height: number }, pattern: string, spacing: number) => {
    const { x, y, width, height } = noteSpaceRect;
    
    if (pattern === 'lines') {
      // Draw horizontal lines
      for (let lineY = y; lineY <= y + height; lineY += spacing) {
        page.drawLine({
          start: { x, y: lineY },
          end: { x: x + width, y: lineY },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7)
        });
      }
    } else if (pattern === 'grid') {
      // Draw horizontal lines
      for (let lineY = y; lineY <= y + height; lineY += spacing) {
        page.drawLine({
          start: { x, y: lineY },
          end: { x: x + width, y: lineY },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7)
        });
      }
      // Draw vertical lines
      for (let lineX = x; lineX <= x + width; lineX += spacing) {
        page.drawLine({
          start: { x: lineX, y },
          end: { x: lineX, y: y + height },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7)
        });
      }
    } else if (pattern === 'dots') {
      // Draw dots in a grid pattern
      for (let dotY = y; dotY <= y + height; dotY += spacing) {
        for (let dotX = x; dotX <= x + width; dotX += spacing) {
          page.drawCircle({
            x: dotX,
            y: dotY,
            size: 1,
            color: rgb(0.7, 0.7, 0.7)
          });
        }
      }
    }
  };

  // Handle feedback image upload
  const handleFeedbackImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Convert FileList to array
      const newFiles: File[] = Array.from(files);
      
      // Check if files are images and within size limit
      const validFiles = newFiles.filter(file => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
          alert('Please upload only image files (JPEG, PNG, etc.)');
          return false;
        }
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`Image "${file.name}" exceeds 5MB limit. Please choose a smaller image.`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        // Add new files to existing files
        setFeedbackImages(prev => [...prev, ...validFiles]);
        setFeedbackSectionNeedsExtraHeight(true);
        
        // Create previews for new files
        validFiles.forEach(file => {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFeedbackImagePreviews(prev => [...prev, e.target?.result as string]);
          };
          reader.readAsDataURL(file);
        });
      }
      
      // Reset the file input to allow selecting the same files again
      if (feedbackImageRef.current) {
        feedbackImageRef.current.value = '';
      }
    }
  };
  
  // Clear all feedback images
  const clearAllFeedbackImages = () => {
    setFeedbackImages([]);
    setFeedbackImagePreviews([]);
    setFeedbackSectionNeedsExtraHeight(false);
    if (feedbackImageRef.current) {
      feedbackImageRef.current.value = '';
    }
  };
  
  // Remove a specific feedback image
  const removeFeedbackImage = (index: number) => {
    setFeedbackImages(prev => prev.filter((_, i) => i !== index));
    setFeedbackImagePreviews(prev => prev.filter((_, i) => i !== index));
    
    // If no images left, reset the extra height
    if (feedbackImages.length <= 1) {
      setFeedbackSectionNeedsExtraHeight(false);
    }
  };
  
  // Submit feedback
  const submitFeedback = () => {
    if (!feedback.trim()) {
      alert('Please enter some feedback before submitting.');
      return;
    }
    
    // The form submission is now handled by the event listener in FeedbackForm
    // We just need to handle the UI updates here
    
    // Track feedback submission
    trackEvent(
      'feedback_submitted',
      'User Feedback',
      'Feedback submitted',
      feedbackImages.length // Number of images attached as value
    );
    
    // Clear form and show success message
    setFeedback('');
    setFeedbackImages([]);
    setFeedbackImagePreviews([]);
    
    // Don't need extra height for success message
    setFeedbackSectionNeedsExtraHeight(false);
    setFeedbackSubmitted(true);
    
    // Reset the feedback submitted state after 5 seconds
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 5000);
    
    if (feedbackImageRef.current) {
      feedbackImageRef.current.value = '';
    }
  };

  return (
    <Layout 
      feedbackSectionNeedsExtraHeight={feedbackSectionNeedsExtraHeight}
      feedbackSubmitted={feedbackSubmitted}
    >
      <div className="bottom-section-placeholder"></div>
      <div 
        style={{ 
          width: '100%',
          visibility: isMounted ? 'visible' : 'hidden',
          opacity: isMounted ? 1 : 0,
          transition: 'opacity 0.1s ease-in'
        }}
      >
        <MobileOrientationMessage />
        <MembershipBanner />
        <Header />
        <Features />
        
        <GreenContentWrapper>
          <Preview 
            file={file}
            isProcessing={isProcessing}
            pdfPreviewUrl={pdfPreviewUrl}
          />
          
          <div className="column-divider"></div>
          
          <Controls 
            file={file}
            noteSpaceWidth={noteSpaceWidth}
            setNoteSpaceWidth={setNoteSpaceWidth}
            horizontalNoteSpaceWidth={horizontalNoteSpaceWidth}
            setHorizontalNoteSpaceWidth={setHorizontalNoteSpaceWidth}
            verticalNoteSpaceWidth={verticalNoteSpaceWidth}
            setVerticalNoteSpaceWidth={setVerticalNoteSpaceWidth}
            useSeparateWidths={useSeparateWidths}
            setUseSeparateWidths={setUseSeparateWidths}
            noteSpacePosition={noteSpacePosition}
            setNoteSpacePosition={setNoteSpacePosition}
            colorOption={colorOption}
            setColorOption={setColorOption}
            customColor={customColor}
            setCustomColor={setCustomColor}
            baseFileName={baseFileName}
            handleBaseFileNameChange={handleBaseFileNameChange}
            includeWithNotes={includeWithNotes}
            handleCheckboxChange={handleCheckboxChange}
            resetBaseFileName={resetBaseFileName}
            fileInputRef={fileInputRef}
            handleFileUpload={handleFileUpload}
            clearFile={clearFile}
            handleDownload={handleDownload}
            downloadIsProcessing={downloadIsProcessing}
            predefinedColors={predefinedColors}
            specifyLocation={specifyLocation}
            setSpecifyLocation={setSpecifyLocation}
            successMessage={successMessage}
            notePattern={notePattern}
            setNotePattern={setNotePattern}
            lineSpacing={lineSpacing}
            setLineSpacing={setLineSpacing}
            gridSpacing={gridSpacing}
            setGridSpacing={setGridSpacing}
            dotSpacing={dotSpacing}
            setDotSpacing={setDotSpacing}
            noteSpacePositions={noteSpacePositions}
            setNoteSpacePositions={setNoteSpacePositions}
          />
        </GreenContentWrapper>
        
        <div style={{ 
          width: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          backgroundColor: '#f2c4aa',
          borderTopLeftRadius: '0',
          borderTopRightRadius: '0',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 2
        }}>
          <FeedbackForm 
            feedback={feedback}
            setFeedback={setFeedback}
            feedbackImages={feedbackImages}
            feedbackImagePreviews={feedbackImagePreviews}
            handleFeedbackImageUpload={handleFeedbackImageUpload}
            clearAllFeedbackImages={clearAllFeedbackImages}
            removeFeedbackImage={removeFeedbackImage}
            submitFeedback={submitFeedback}
            feedbackSectionNeedsExtraHeight={feedbackSectionNeedsExtraHeight}
            feedbackSubmitted={feedbackSubmitted}
          />
          <div className="section-gap"></div>
          <DonationsBox />
        </div>
      </div>
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "SpaceMyPDF",
            "description": "Free online tool to add customizable note-taking space to your PDF documents. No upload required, works in your browser with complete privacy.",
            "url": "https://www.spacemypdf.com",
            "applicationCategory": "Productivity Software",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "featureList": [
              "Add customizable note space to PDFs",
              "Choose width, position, and color of note space",
              "Client-side processing for privacy",
              "No registration required",
              "Free to use"
            ]
          })
        }}
      />
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [{
              "@type": "Question",
              "name": "How do I add note space to my PDF?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Upload your PDF, adjust the note space width and position, then download the modified PDF. The process is instant and completely private."
              }
            },
            {
              "@type": "Question",
              "name": "Is SpaceMyPDF free to use?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes, SpaceMyPDF is completely free to use with no registration required."
              }
            }]
            // Add more FAQ items as needed
          })
        }}
      />
      
      {/* Membership Modal for Referral Links */}
      <MembershipModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        onSignUp={() => setShowMembershipModal(false)}
        onLogin={() => setShowMembershipModal(false)}
        initialReferralCode={referralCode}
      />
    </Layout>
  );
}

// Component to wrap the green content and use the context
function GreenContentWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div id="greenSectionFinal">
      {children}
    </div>
  );
}
