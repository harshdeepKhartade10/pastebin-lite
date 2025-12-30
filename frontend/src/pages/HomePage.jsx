import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { createPaste } from '../services/api'
import Header from '../components/Header'
import PasteForm from '../components/PasteForm'
import Features from '../components/Features'
import Footer from '../components/Footer'

const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleCreatePaste = async (pasteData) => {
    setIsLoading(true)
    try {
      const response = await createPaste(pasteData)
      toast.success('Paste created successfully!')
      // Navigate to the backend HTML page instead of React route
      window.location.href = response.url
    } catch (error) {
      console.error('Error creating paste:', error)
      const errorMessage = error.response?.data?.error || 'Failed to create paste'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

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
