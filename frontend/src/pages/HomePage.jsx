import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createPaste, validateBackendConnection } from '../services/api'
import Header from '../components/Header'
import PasteForm from '../components/PasteForm'
import Features from '../components/Features'
import Footer from '../components/Footer'

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [backendStatus,setBackendStatus] = useState({ checking: true, connected: false })
  const navigate = useNavigate()

  // Check backend connection on component mount
  useEffect(() => {
    const checkBackend = async () =>{
      try {
        const status = await validateBackendConnection()
        setBackendStatus({ checking: false, ...status })

        if (!status.connected) {
          toast.error('Backend service unavailable. Some features may not work.')
        }
      } catch (error) {
        setBackendStatus({ checking: false, connected: false })
        console.error('Backend check failed:',error)
      }
    }

    checkBackend()
  }, [])

  const handleCreatePaste = async (pasteData) =>{
    // Check backend connection before creating paste
    if (!backendStatus.connected && !backendStatus.checking) {
      toast.error('Backend service is currently unavailable. Please try again later.')
      return
    }

    setIsLoading(true)
    try{
      const response =await createPaste(pasteData)
      toast.success('Paste created successfully!')

      // Navigate to backend HTML page using environment variable or fallback
      const backendUrl = import.meta.env.VITE_API_URL || 'https://pastebin-lite-backend-6uu2.onrender.com'
      window.location.href = `${backendUrl}/p/${response.id}`
    } catch (error) {
      console.error('Error creating paste:', error)

      // Enhanced error messages for deployment
      let errorMessage = 'Failed to create paste'

      if (error.response?.status=== 413) {
        errorMessage = 'Paste content too large. Please reduce the size.'
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.'
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
        errorMessage = 'Unable to connect to server. Please try again later.'
      } else if (error.response?.data?.error) {
        errorMessage =error.response.data.error
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      {/* Backend Status Indicator */}
      {!backendStatus.checking && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all ${backendStatus.connected
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-green-500' : 'bg-red-500'
              }`} />
            <span className="text-sm font-medium">
              {backendStatus.connected ? 'Backend Connected' : 'Backend Offline'}
            </span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl font-bold mb-4 gradient-text">
              Pastebin Lite
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Share text snippets quickly and securely. Create temporary or permanent pastes with advanced features.
            </p>

            {/* Backend Status in Hero */}
            {!backendStatus.checking &&(
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${backendStatus.connected
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
                }`}>
                <div className={`w-2 h-2 rounded-full ${backendStatus.connected ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                <span>
                  {backendStatus.connected ? 'Service Online' : 'Limited Service'}
                </span>
              </div>
            )}
          </div>

          {/* Paste Form */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 glass-effect animate-slide-up">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Paste</h2>
            <PasteForm onSubmit={handleCreatePaste} isLoading={isLoading} />
          </div>

          {/* Features Section */}
          <Features />
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default HomePage
