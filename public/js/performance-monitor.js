// Performance Monitor - Moj Predracun
// Faza 4: Performance optimizacija

(function() {
  'use strict';
  
  window.performanceMonitor = {
    metrics: {
      pageLoadTime: 0,
      apiResponseTimes: [],
      renderTimes: [],
      cacheHitRate: 0,
      totalRequests: 0,
      cachedRequests: 0
    },
    
    // Start timing
    startTime: null,
    
    init() {
      // Measure page load time
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = performance.timing;
          this.metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
          console.log(`[Performance] Page load time: ${this.metrics.pageLoadTime}ms`);
        }, 0);
      });
      
      // Intercept fetch for monitoring
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const start = performance.now();
        const url = args[0];
        
        try {
          const response = await originalFetch(...args);
          const duration = performance.now() - start;
          
          this.metrics.apiResponseTimes.push({
            url: url,
            duration: duration,
            timestamp: new Date().toISOString()
          });
          
          // Keep only last 50
          if (this.metrics.apiResponseTimes.length > 50) {
            this.metrics.apiResponseTimes.shift();
          }
          
          console.log(`[Performance] API ${url}: ${duration.toFixed(2)}ms`);
          
          return response;
        } catch (error) {
          const duration = performance.now() - start;
          console.error(`[Performance] API ${url} failed: ${duration.toFixed(2)}ms`, error);
          throw error;
        }
      };
      
      console.log('[Performance Monitor] Initialized');
    },
    
    // Get performance report
    getReport() {
      const avgApiTime = this.metrics.apiResponseTimes.length > 0
        ? this.metrics.apiResponseTimes.reduce((a, b) => a + b.duration, 0) / this.metrics.apiResponseTimes.length
        : 0;
      
      return {
        pageLoadTime: this.metrics.pageLoadTime,
        averageApiResponseTime: avgApiTime.toFixed(2),
        totalApiCalls: this.metrics.apiResponseTimes.length,
        cacheHitRate: this.metrics.cacheHitRate,
        timestamp: new Date().toISOString()
      };
    },
    
    // Measure render time
    measureRender(componentName, callback) {
      const start = performance.now();
      const result = callback();
      const duration = performance.now() - start;
      
      this.metrics.renderTimes.push({
        component: componentName,
        duration: duration,
        timestamp: new Date().toISOString()
      });
      
      console.log(`[Performance] Render ${componentName}: ${duration.toFixed(2)}ms`);
      
      return result;
    }
  };
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.performanceMonitor.init());
  } else {
    window.performanceMonitor.init();
  }
})();
