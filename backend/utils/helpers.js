const crypto = require('crypto');

/**
 * Generate a unique ID for pastes
 * @returns {string} A unique 8-character ID
 */
const generateId = () =>{
  return crypto.randomBytes(4).toString('hex');
};

/**
 * Get current time, supporting deterministic testing
 * @param {object} req - Express request object
 * @returns {Date} Current time (or test time if in test mode)
 */
const getCurrentTime =(req) =>{
  if (process.env.TEST_MODE === '1' && req.headers['x-test-now-ms']) {
    const testTimeMs = parseInt(req.headers['x-test-now-ms']);
    if (!isNaN(testTimeMs)){
      return new Date(testTimeMs);
    }
  }
  return new Date();
};

/**
 * Check if a paste has expired based on TTL
 * @param {object}paste - Paste object
 * @param {Date} currentTime - Current time
 * @returns {boolean} True if expired
 */
const isExpired =(paste,currentTime) => {
  if (!paste.expires_at) return false;
  return new Date(paste.expires_at) <= currentTime;
};

/**
 * Check if view limit has been exceeded
 * @param {object} paste - Paste object
 * @returns {boolean} True if view limit exceeded
 */
const isViewLimitExceeded = (paste) => {
  if (!paste.max_views) return false;
  return paste.view_count >=paste.max_views;
};

/**
 * Calculate expiry date from TTL seconds
 * @param {number} ttlSeconds - TTL in seconds
 * @param {Date} createdAt - Creation time
 * @returns {Date|null} Expiry date or null if no TTL
 */
const calculateExpiryDate = (ttlSeconds, createdAt = new Date()) => {
  if (!ttlSeconds) return null;
  const expiryDate= new Date(createdAt);
  expiryDate.setSeconds(expiryDate.getSeconds() + ttlSeconds);
  return expiryDate;
};

/**
 * Validate paste creation input
 * @param {object} body - Request body
 * @returns {object} Validation result
 */
const validatePasteInput = (body) => {
  const errors = [];

  if (!body.content || typeof body.content !== 'string' || body.content.trim() === ''){
    errors.push('content is required and must be a non-empty string');
  }

  if (body.ttl_seconds !== undefined) {
    if (!Number.isInteger(body.ttl_seconds) || body.ttl_seconds < 1) {
      errors.push('ttl_seconds must be an integer ≥ 1');
    }
    if (body.ttl_seconds > 31536000){ // 1 year max
      errors.push('ttl_seconds must be ≤ 31536000 (1 year)');
    }
  }

  if (body.max_views !== undefined){
    if (!Number.isInteger(body.max_views) || body.max_views < 1) {
      errors.push('max_views must be an integer ≥ 1');
    }
    if (body.max_views > 1000000) { // Reasonable limit
      errors.push('max_views must be ≤ 1000000');
    }
  }

  // Content length validation
  if (body.content && body.content.length >1000000) { // 1MB max
    errors.push('content must be ≤ 1000000 characters');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Escape HTML to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped HTML
 */
const escapeHtml = (text) =>{
  const map= {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;'
  };
  return text.replace(/[&<>"'/]/g, (m) => map[m]);
};

/**
 * Generate shareable URL
 * @param {string} id - Paste ID
 * @param {string} baseUrl - Base URL
 * @returns {string} Full URL
 */
const generateShareUrl =(id, baseUrl) => {
  const cleanBaseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  return `${cleanBaseUrl}/p/${id}`;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  return d.toISOString();
};

/**
 * Sanitize paste ID
 * @param {string} id - Raw ID
 * @returns {string|null} Sanitized ID or null if invalid
 */
const sanitizeId = (id) =>{
  if (!id || typeof id !== 'string') return null;
  
  // Only allow alphanumeric characters (hex format)
  const sanitized = id.replace(/[^a-fA-F0-9]/g, '');
  
  // Check if it's 8 characters (our standard length)
  if (sanitized.length !==8) return null;
  
  return sanitized;
};

module.exports = {
  generateId,
  getCurrentTime,
  isExpired,
  isViewLimitExceeded,
  calculateExpiryDate,
  validatePasteInput,
  escapeHtml,
  generateShareUrl,
  formatDate,
  sanitizeId
};
