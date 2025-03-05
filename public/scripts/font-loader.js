// Font loading detection
document.documentElement.classList.add('font-loading');

// Mark fonts as loaded after a short delay
setTimeout(function() {
  document.documentElement.classList.remove('font-loading');
  document.documentElement.classList.add('fonts-loaded');
}, 100);

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