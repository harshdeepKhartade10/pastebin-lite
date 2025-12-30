const express = require('express');
const { 
  generateId, 
  getCurrentTime, 
  isExpired, 
  isViewLimitExceeded,
  calculateExpiryDate,
  validatePasteInput,
  escapeHtml,
  generateShareUrl,
  sanitizeId
} = require('../utils/helpers');
const { setPaste, getPaste, updatePaste, deletePaste } = require('../services/redis');

const router = express.Router();

/**
 * Create a new paste
 * POST /api/pastes
 */
router.post('/', async (req, res) => {
  try {
    const validation = validatePasteInput(req.body);
    if (!validation.isValid) {
      return res.status(400).json({
        error: 'Invalid input',
        details: validation.errors
      });
    }

    const { content, ttl_seconds, max_views } = req.body;
    const id = generateId();
    const createdAt = getCurrentTime(req);
    
    const pasteData = {
      id,
      content: content.trim(),
      ttl_seconds: ttl_seconds || null,
      max_views: max_views || null,
      view_count: 0,
      created_at: createdAt.toISOString(),
      expires_at: calculateExpiryDate(ttl_seconds, createdAt)?.toISOString() || null
    };

    const success = await setPaste(id, pasteData);
    if (!success) {
      return res.status(500).json({
        error: 'Failed to create paste'
      });
    }

    const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
    const pasteUrl = generateShareUrl(id, baseUrl);

    res.status(201).json({
      id,
      url: pasteUrl
    });

  } catch (error) {
    console.error('Create paste error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * Fetch a paste (API endpoint)
 * GET /api/pastes/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const rawId = req.params.id;
    const id = sanitizeId(rawId);
    
    if (!id) {
      return res.status(404).json({
        error: 'Paste not found'
      });
    }

    const currentTime = getCurrentTime(req);
    const paste = await getPaste(id);
    
    if (!paste) {
      return res.status(404).json({
        error: 'Paste not found'
      });
    }

    // Check if paste has expired
    if (isExpired(paste, currentTime)) {
      await deletePaste(id);
      return res.status(404).json({
        error: 'Paste not found'
      });
    }

    // Check if view limit has been exceeded (after incrementing)
    if (paste.max_views && paste.view_count >= paste.max_views) {
      await deletePaste(id);
      return res.status(404).json({
        error: 'Paste not found'
      });
    }

    // Increment view count atomically
    const updatedViewCount = paste.view_count + 1;
    const updateSuccess = await updatePaste(id, { view_count: updatedViewCount });

    if (!updateSuccess) {
      console.error('Failed to update view count for paste:', id);
      // Continue anyway - the paste was successfully retrieved
    }

    // Check if this view exceeds the limit and delete if so
    if (paste.max_views && updatedViewCount >= paste.max_views) {
      await deletePaste(id);
    }

    // Calculate remaining views
    const remainingViews = paste.max_views ? Math.max(0, paste.max_views - updatedViewCount) : null;

    res.status(200).json({
      content: paste.content,
      remaining_views: remainingViews,
      expires_at: paste.expires_at
    });

  } catch (error) {
    console.error('Fetch paste error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

/**
 * View a paste (HTML endpoint)
 * GET /p/:id
 * This will be handled in the main server.js for frontend routing
 * But we'll provide a basic HTML response here for serverless deployment
 */
router.get('/view/:id', async (req, res) => {
  try {
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

    // Check if view limit has been exceeded
    if (isViewLimitExceeded(paste)) {
      await deletePaste(id);
      return res.status(404).send(createErrorPage('View Limit Exceeded', 'This paste has reached its maximum view limit and is no longer available.'));
    }

    // Increment view count
    const updatedViewCount = paste.view_count + 1;
    const updateSuccess = await updatePaste(id, { view_count: updatedViewCount });

    if (!updateSuccess) {
      console.error('Failed to update view count for paste:', id);
    }

    // Check if this view exceeds the limit
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
            <button class="btn copy-btn" onclick="copyToClipboard()"> Copy Content</button>
            <a href="/" class="btn">✨ Create New Paste</a>
        </div>
    </div>

    <script>
        function copyToClipboard() {
            const content = document.querySelector('.paste-content').textContent;
            navigator.clipboard.writeText(content).then(() => {
                const btn = document.querySelector('.copy-btn');
                const originalText = btn.textContent;
                btn.textContent = ' Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy:', err);
                alert('Failed to copy to clipboard');
            });
        }
    </script>
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
        <a href="/" class="btn">✨ Create New Paste</a>
    </div>
</body>
</html>`;
}

module.exports = router;
