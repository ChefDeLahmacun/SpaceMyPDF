// Font loading detection - only run on client side
if (typeof window !== 'undefined') {
  // Check if fonts are already loaded
  if (document.readyState === 'complete') {
    document.documentElement.classList.remove('font-loading');
    document.documentElement.classList.add('fonts-loaded');
  } else {
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
      // Mark fonts as loaded after a short delay
      setTimeout(function() {
        document.documentElement.classList.remove('font-loading');
        document.documentElement.classList.add('fonts-loaded');
      }, 100);
    });
  }

  // Font loading fallback
  (function() {
    try {
      document.fonts.ready.then(function() {
        document.documentElement.classList.remove('font-loading');
        document.documentElement.classList.add('fonts-loaded');
      });
    } catch (e) {
      // If document.fonts is not supported, we already have the timeout above
      console.warn('Font loading API not supported');
    }
  })();
} 