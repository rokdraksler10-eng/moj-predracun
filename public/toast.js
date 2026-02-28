// Toast Notification System
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  
  // Add styles
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#2563eb'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 9999;
    animation: slideInRight 0.3s ease;
    font-weight: 500;
    max-width: 400px;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  .toast-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 1rem;
    opacity: 0.8;
  }
  .toast-close:hover { opacity: 1; }
`;
document.head.appendChild(style);

// Export for use in app.js
window.showToast = showToast;
