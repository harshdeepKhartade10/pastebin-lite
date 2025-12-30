const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const pasteRoutes = require('./routes/pastes');
const healthRoutes = require('./routes/health');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
    },
  },
}));

// Compression middleware
app.use(compression());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.BASE_URL] 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-test-now-ms']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Set Content-Type for all API responses
app.use('/api', (req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Routes
app.use('/api/healthz', healthRoutes);
app.use('/api/pastes', pasteRoutes);

// Handle HTML paste viewing route
app.get('/p/:id', async (req, res) => {
  try {
    const { 
      getCurrentTime, 
      isExpired, 
      isViewLimitExceeded,
      sanitizeId,
      escapeHtml
    } = require('./utils/helpers');
    const { getPaste, updatePaste, deletePaste } = require('./services/redis');

    const rawId = req.params.id;
    const id = sanitizeId(rawId);
    
    if (!id) {
      return res.status(404).send(createErrorPage('Paste Not Found', 'The paste you\'re looking for doesn\'t exist.'));
    }

    const currentTime = getCurrentTime(req);
    const paste = await getPaste(id);
    
    if (!paste) {
      return res.status(404).send(createErrorPage('Paste Not Found', 'The paste you\'re looking for doesn\'t exist.'));
    }

    // Check if paste has expired
    if (isExpired(paste, currentTime)) {
      await deletePaste(id);
      return res.status(404).send(createErrorPage('Paste Expired', 'This paste has expired and is no longer available.'));
    }

    // Check if view limit has been exceeded (after incrementing)
    if (paste.max_views && paste.view_count >= paste.max_views) {
      await deletePaste(id);
      return res.status(404).send(createErrorPage('View Limit Exceeded', 'This paste has reached its maximum view limit and is no longer available.'));
    }

    // Increment view count
    const updatedViewCount = paste.view_count + 1;
    const updateSuccess = await updatePaste(id, { view_count: updatedViewCount });

    if (!updateSuccess) {
      console.error('Failed to update view count for paste:', id);
    }

    // Check if this view exceeds the limit and delete if so
    if (paste.max_views && updatedViewCount >= paste.max_views) {
      await deletePaste(id);
    }

    const escapedContent = escapeHtml(paste.content);
    const remainingViews = paste.max_views ? Math.max(0, paste.max_views - updatedViewCount) : null;

    res.status(200).send(createPastePage(id, escapedContent, paste, updatedViewCount, remainingViews));

  } catch (error) {
    console.error('View paste error:', error);
    res.status(500).send(createErrorPage('Error', 'An error occurred while loading this paste.'));
  }
});

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('../frontend/dist'));
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile('index.html', { root: '../frontend/dist' });
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Validation failed',
      details: err.details 
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.status(404).json({ error: 'Not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/healthz`);
    console.log(` Environment: ${process.env.NODE_ENV}`);
  });
}

module.exports = app;

/**
 * Create HTML page for paste viewing
 */
function createPastePage(id, content, paste, viewCount, remainingViews) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>View Paste - ${id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .paste-id { opacity: 0.9; font-size: 0.9rem; }
        .content-container { padding: 30px; }
        .paste-content {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 25px;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            line-height: 1.6;
            white-space: pre-wrap;
            word-wrap: break-word;
            max-height: 500px;
            overflow-y: auto;
            margin-bottom: 25px;
        }
        .meta {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
            font-size: 0.9rem;
            color: #6c757d;
        }
        .meta-item { display: flex; flex-direction: column; }
        .meta-label { font-weight: 600; color: #495057; margin-bottom: 5px; }
        .actions {
            padding: 30px;
            text-align: center;
            background: #f8f9fa;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            margin: 0 10px;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        .copy-btn {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
        }
        @media (max-width: 768px) {
            .header h1 { font-size: 2rem; }
            .container { margin: 10px; }
            .content-container { padding: 20px; }
            .meta { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 View Paste</h1>
            <div class="paste-id">Paste ID: ${id}</div>
        </div>
        
        <div class="content-container">
            <div class="paste-content">${content}</div>
            
            <div class="meta">
                <div class="meta-item">
                    <span class="meta-label">📅 Created</span>
                    <span>${new Date(paste.created_at).toLocaleString()}</span>
                </div>
                ${paste.expires_at ? `
                <div class="meta-item">
                    <span class="meta-label">⏰ Expires</span>
                    <span>${new Date(paste.expires_at).toLocaleString()}</span>
                </div>
                ` : ''}
                ${remainingViews !== null ? `
                <div class="meta-item">
                    <span class="meta-label">👁️ Remaining Views</span>
                    <span>${remainingViews}</span>
                </div>
                ` : ''}
                <div class="meta-item">
                    <span class="meta-label">📊 Total Views</span>
                    <span>${viewCount}</span>
                </div>
            </div>
        </div>
        
        <div class="actions">
            <a href="${process.env.BASE_URL || 'https://pastebin-lite-phi.vercel.app'}" class="btn">✨ Create New Paste</a>
        </div>
    </div>

    </body>
</html>`;
}

/**
 * Create error page
 */
function createErrorPage(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .error-container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 500px;
        }
        .error-icon { font-size: 4rem; margin-bottom: 20px; }
        .error-title { color: #dc3545; font-size: 2rem; margin-bottom: 15px; }
        .error-message { color: #6c757d; margin-bottom: 30px; line-height: 1.6; }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
    </style>
</head>
<body>
    <div class="error-container">
        <div class="error-icon"></div>
        <h1 class="error-title">${title}</h1>
        <p class="error-message">${message}</p>
        <a href="${process.env.BASE_URL || 'https://pastebin-lite-phi.vercel.app'}" class="btn">✨ Create New Paste</a>
    </div>
</body>
</html>`;
}
