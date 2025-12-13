import { useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production and if Performance Observer is supported
    if (!import.meta.env.PROD || !('PerformanceObserver' in window)) {
      return;
    }

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetric[] = [];

      // Core Web Vitals
      if ('LCP' in window) {
        // Largest Contentful Paint
        const lcpEntry = paint.find(entry => entry.name === 'largest-contentful-paint');
        if (lcpEntry) {
          metrics.push({
            name: 'LCP',
            value: lcpEntry.startTime,
            rating: lcpEntry.startTime < 2500 ? 'good' : lcpEntry.startTime < 4000 ? 'needs-improvement' : 'poor'
          });
        }
      }

      if ('CLS' in window) {
        // Cumulative Layout Shift - would need Layout Shift API
      }

      if ('FID' in window) {
        // First Input Delay - would need First Input API
      }

      // Navigation timing metrics
      metrics.push(
        {
          name: 'DNS Lookup',
          value: navigation.domainLookupEnd - navigation.domainLookupStart,
          rating: navigation.domainLookupEnd - navigation.domainLookupStart < 100 ? 'good' : 'needs-improvement'
        },
        {
          name: 'TCP Connect',
          value: navigation.connectEnd - navigation.connectStart,
          rating: navigation.connectEnd - navigation.connectStart < 100 ? 'good' : 'needs-improvement'
        },
        {
          name: 'Request/Response',
          value: navigation.responseEnd - navigation.requestStart,
          rating: navigation.responseEnd - navigation.requestStart < 200 ? 'good' : 'needs-improvement'
        },
        {
          name: 'DOM Processing',
          value: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          rating: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart < 200 ? 'good' : 'needs-improvement'
        },
        {
          name: 'Total Load Time',
          value: navigation.loadEventEnd - navigation.fetchStart,
          rating: navigation.loadEventEnd - navigation.fetchStart < 1000 ? 'good' : navigation.loadEventEnd - navigation.fetchStart < 3000 ? 'needs-improvement' : 'poor'
        }
      );

      // Log metrics to console in development
      if (import.meta.env.DEV) {
        console.group('Performance Metrics');
        metrics.forEach(metric => {
          const color = metric.rating === 'good' ? 'green' : metric.rating === 'needs-improvement' ? 'orange' : 'red';
          console.log(`%c${metric.name}: ${Math.round(metric.value)}ms`, `color: ${color}`);
        });
        console.groupEnd();
      }

      // Send to analytics in production
      if (import.meta.env.PROD) {
        // Example: Send to Google Analytics or other analytics service
        // gtag('event', 'page_load_time', {
        //   value: Math.round(navigation.loadEventEnd - navigation.navigationStart),
        //   custom_parameter: 'performance_metric'
        // });
      }
    };

    // Measure after page load
    window.addEventListener('load', measurePerformance);

    // Set up observers for Core Web Vitals
    if ('PerformanceObserver' in window) {
      // Observe Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.startTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Observe First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const fidEntry = entry as PerformanceEventTiming;
            console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Observe Layout Shift
      try {
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const layoutShiftEntry = entry as any;
            if (!layoutShiftEntry.hadRecentInput) {
              clsValue += layoutShiftEntry.value;
            }
          }
          console.log('CLS:', clsValue);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        // CLS not supported
      }
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;