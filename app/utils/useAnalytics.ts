import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from './analytics';

export const useAnalytics = () => {
  const pathname = usePathname();
  
  // Only use searchParams on the client side
  let searchParamsString = '';
  
  if (typeof window !== 'undefined') {
    // This ensures it only runs on the client side
    const searchParams = useSearchParams();
    searchParamsString = searchParams ? searchParams.toString() : '';
  }

  // Track page views
  useEffect(() => {
    if (pathname) {
      // Include search parameters if they exist
      const url = searchParamsString 
        ? `${pathname}?${searchParamsString}`
        : pathname;
        
      // This is automatically tracked by the GoogleAnalytics component,
      // but we're adding it here for completeness
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'page_view', {
          page_path: url,
        });
      }
    }
  }, [pathname, searchParamsString]);

  // Return the trackEvent function for custom event tracking
  return { trackEvent };
}; 