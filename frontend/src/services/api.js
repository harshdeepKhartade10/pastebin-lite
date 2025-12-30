import axios from 'axios'

// Create axios instance with default configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add any request modifications here
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 404) {
      error.message = 'Paste not found or has expired'
    } else if (error.response?.status === 400) {
      error.message = error.response?.data?.error || 'Invalid request'
    } else if (error.response?.status >= 500) {
      error.message = 'Server error. Please try again later'
    } else if (error.code === 'ECONNABORTED') {
      error.message = 'Request timeout. Please check your connection'
    }
    
    return Promise.reject(error)
  }
)

// API functions
export const createPaste = async (pasteData) => {
  try {
    const response = await api.post('/pastes', pasteData)
    return response
  } catch (error) {
    console.error('Create paste error:', error)
    throw error
  }
}

export const getPaste = async (id) => {
  try {
    const response = await api.get(`/pastes/${id}`)
    return response
  } catch (error) {
    console.error('Get paste error:', error)
    throw error
  }
}

export const checkHealth = async () => {
  try {
    const response = await api.get('/healthz')
    return response
  } catch (error) {
    console.error('Health check error:', error)
    throw error
  }
}

export default api
