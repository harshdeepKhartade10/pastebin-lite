import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { getPaste } from '../services/api'
import Header from '../components/Header'
import PasteViewer from '../components/PasteViewer'
import LoadingSpinner from '../components/LoadingSpinner'
import Footer from '../components/Footer'

const ViewPastePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [paste, setPaste] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPaste = async () => {
      try {
        setIsLoading(true)
        const response = await getPaste(id)
        setPaste(response)
      } catch (err) {
        console.error('Error fetching paste:', err)
        const errorMessage = err.response?.data?.error || 'Paste not found'
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchPaste()
    }
  }, [id])

  const handleCreateNew = () => {
    navigate('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <LoadingSpinner size="large" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 glass-effect">
              <div className="text-6xl mb-4">😞</div>
              <h1 className="text-3xl font-bold text-gray-800 mb-4">Paste Not Found</h1>
              <p className="text-gray-600 mb-8">
                {error}
              </p>
              <button
                onClick={handleCreateNew}
                className="btn btn-primary"
              >
                Create New Paste
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <PasteViewer paste={paste} />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ViewPastePage
