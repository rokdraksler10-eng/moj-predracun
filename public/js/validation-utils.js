// Input Validation & Security - Moj Predracun
// Faza 4: Stabilizacija in varnost

const ValidationUtils = {
  // Sanitize input to prevent XSS
  sanitize(input) {
    if (typeof input !== 'string') return input;
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  },
  
  // Validate email
  isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },
  
  // Validate phone number (Slovenian format)
  isValidPhone(phone) {
    const cleaned = phone.replace(/[\s\-\.]/g, '');
    const regex = /^(\+386|0)[1-9][0-9]{7}$/;
    return regex.test(cleaned);
  },
  
  // Validate number
  isValidNumber(value, min = null, max = null) {
    const num = parseFloat(value);
    if (isNaN(num)) return false;
    if (min !== null && num < min) return false;
    if (max !== null && num > max) return false;
    return true;
  },
  
  // Validate required field
  isRequired(value) {
    return value !== null && value !== undefined && value.toString().trim() !== '';
  },
  
  // Validate length
  isValidLength(value, min = 0, max = Infinity) {
    const length = value.toString().length;
    return length >= min && length <= max;
  },
  
  // Validate quote data
  validateQuote(quote) {
    const errors = [];
    
    if (!this.isRequired(quote.project_name)) {
      errors.push('Naziv projekta je obvezen');
    }
    
    if (quote.project_name && !this.isValidLength(quote.project_name, 1, 200)) {
      errors.push('Naziv projekta je predolg (max 200 znakov)');
    }
    
    if (quote.client_email && !this.isValidEmail(quote.client_email)) {
      errors.push('Neveljaven email naslov');
    }
    
    if (quote.client_phone && !this.isValidPhone(quote.client_phone)) {
      errors.push('Neveljavna telefonska številka');
    }
    
    if (quote.items && quote.items.length > 1000) {
      errors.push('Predračun ima preveč postavk (max 1000)');
    }
    
    return {
      isValid: errors.length === 0,
      errors: errors
    };
  },
  
  // Sanitize object recursively
  sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitize(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = this.sanitizeObject(value);
    }
    return sanitized;
  },
  
  // Format price
  formatPrice(price) {
    const num = parseFloat(price);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  },
  
  // Format date
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  }
};

// Security utilities
const SecurityUtils = {
  // Generate random ID
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },
  
  // Hash string (simple)
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  },
  
  // Check if string contains SQL injection patterns
  containsSqlInjection(str) {
    const patterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(--|;|\/\*|\*\/)/,
      /(\bOR\b|\bAND\b).*?=.*?/i
    ];
    return patterns.some(pattern => pattern.test(str));
  },
  
  // Rate limiting helper
  createRateLimiter(maxRequests = 10, windowMs = 60000) {
    const requests = [];
    
    return {
      canProceed() {
        const now = Date.now();
        // Remove old requests
        while (requests.length > 0 && requests[0] < now - windowMs) {
          requests.shift();
        }
        
        if (requests.length < maxRequests) {
          requests.push(now);
          return true;
        }
        
        return false;
      },
      
      getRemainingTime() {
        if (requests.length === 0) return 0;
        const oldestRequest = requests[0];
        return Math.max(0, oldestRequest + windowMs - Date.now());
      }
    };
  }
};

// Export for use in app
window.ValidationUtils = ValidationUtils;
window.SecurityUtils = SecurityUtils;

console.log('[Validation & Security] Initialized');
