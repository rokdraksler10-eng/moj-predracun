// Global Error Handler - Moj Predracun
// Faza 4: Stabilizacija

(function() {
  'use strict';
  
  // Error tracking
  window.errorLog = [];
  window.appErrors = {
    count: 0,
    lastError: null,
    categories: {
      network: 0,
      database: 0,
      ui: 0,
      unknown: 0
    }
  };
  
  // Global error handler
  window.addEventListener('error', function(event) {
    const error = {
      type: 'javascript',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: new Date().toISOString(),
      stack: event.error ? event.error.stack : null
    };
    
    window.errorLog.push(error);
    window.appErrors.count++;
    window.appErrors.lastError = error;
    
    // Categorize error
    if (error.message.includes('fetch') || error.message.includes('network')) {
      window.appErrors.categories.network++;
    } else if (error.message.includes('IndexedDB') || error.message.includes('database')) {
      window.appErrors.categories.database++;
    } else if (error.message.includes('undefined') || error.message.includes('null')) {
      window.appErrors.categories.ui++;
    } else {
      window.appErrors.categories.unknown++;
    }
    
    // Log to console
    console.error('[Global Error]', error);
    
    // Show user-friendly message for critical errors
    if (window.showToast && error.message.includes('undefined')) {
      window.showToast('⚠️ Napaka v aplikaciji. Osvežite stran.', 'error');
    }
  });
  
  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', function(event) {
    const error = {
      type: 'promise',
      message: event.reason ? event.reason.message : 'Unknown promise error',
      timestamp: new Date().toISOString(),
      stack: event.reason ? event.reason.stack : null
    };
    
    window.errorLog.push(error);
    window.appErrors.count++;
    
    console.error('[Unhandled Promise]', error);
    
    // Prevent default handling
    event.preventDefault();
  });
  
  // Network error handler
  window.addEventListener('offline', function() {
    console.warn('[Network] Connection lost');
    if (window.showToast) {
      window.showToast('📴 Povezava izgubljena', 'warning');
    }
  });
  
  // Recovery suggestions
  window.getErrorReport = function() {
    return {
      totalErrors: window.appErrors.count,
      categories: window.appErrors.categories,
      recentErrors: window.errorLog.slice(-10),
      timestamp: new Date().toISOString()
    };
  };
  
  // Clear error log
  window.clearErrorLog = function() {
    window.errorLog = [];
    window.appErrors.count = 0;
    window.appErrors.lastError = null;
    window.appErrors.categories = { network: 0, database: 0, ui: 0, unknown: 0 };
    console.log('[Error Handler] Log cleared');
  };
  
  console.log('[Error Handler] Initialized');
})();
