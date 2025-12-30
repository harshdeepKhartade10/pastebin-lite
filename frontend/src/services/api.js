import axios from 'axios'

// Use environment variable for API base URL with fallback to deployed backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://pastebin-lite-backend-6uu2.onrender.com'

// Create axios instance with deployment-ready configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // Increased timeout for deployment
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Pastebin-Lite-Frontend/1.0'
  },
  // Enable credentials for cross-origin requests if needed
  withCredentials: false
})

// Request interceptor for deployment
api.interceptors.request.use(
  (config) => {
    // Add deployment-specific headers
    config.headers['X-Client-Version'] = '1.0.0'
    config.headers['X-Client-Platform'] = 'web'
    
    // Log in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    return config
  },
  (error) => {
    console.error('❌ Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Enhanced response interceptor for deployment
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    
    return response.data
  },
  (error) => {
    // Enhanced error handling for deployment
    const originalRequest = error.config
    
    // Log errors in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.response?.status} ${originalRequest?.url}`, error.response?.data)
    }
    
    // Handle specific deployment scenarios
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      error.message = 'Unable to connect to server. Please check your internet connection.'
    } else if (error.response?.status === 429) {
      error.message = 'Too many requests. Please wait a moment and try again.'
    } else if (error.response?.status === 503) {
      error.message = 'Service temporarily unavailable. Please try again later.'
    } else if (error.response?.status === 404) {
      error.message = 'Paste not found or has expired.'
    } else if (error.response?.status === 400) {
      error.message = error.response?.data?.error || 'Invalid request data.'
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later.'
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection and try again.'
    } else if (!error.response) {
      error.message = 'Network error. Please check your internet connection.'
    }
    
    return Promise.reject(error)
  }
)

// Enhanced API functions with deployment-specific error handling
export const createPaste = async (pasteData) => {
  try {
    const response = await api.post('/api/pastes', pasteData)
    
    // Ensure response has required fields for deployment
    if (!response.id) {
      throw new Error('Invalid response: Missing paste ID')
    }
    
    return response
  } catch (error) {
    console.error('Create paste error:', error)
    
    // Add deployment-specific context
    if (error.response?.status === 413) {
      error.message = 'Paste content too large. Please reduce the size.'
    }
    
    throw error
  }
}

export const getPaste = async (id) => {
  try {
    if (!id) {
      throw new Error('Paste ID is required')
    }
    
    const response = await api.get(`/api/pastes/${id}`)
    
    // Validate response for deployment
    if (!response.content) {
      throw new Error('Paste content not found')
    }
    
    return response
  } catch (error) {
    console.error('Get paste error:', error)
    throw error
  }
}

export const checkHealth = async () => {
  try {
    const response = await api.get('/api/healthz')
    
    // Validate health response for deployment
    if (!response.hasOwnProperty('ok')) {
      throw new Error('Invalid health check response')
    }
    
    return response
  } catch (error) {
    console.error('Health check error:', error)
    
    // Health check failures are critical in deployment
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      error.message = 'Backend service is unavailable. Please try again later.'
    }
    
    throw error
  }
}

// New deployment-specific utility function
export const validateBackendConnection = async () => {
  try {
    await checkHealth()
    return { connected: true, message: 'Backend connection successful' }
  } catch (error) {
    return { 
      connected: false, 
      message: error.message || 'Backend connection failed',
      error 
    }
  }
}

export default api
