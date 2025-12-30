import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'

const NotFoundPage = () => {
  const navigate = useNavigate()

  const handleGoHome = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-xl p-12 glass-effect">
            <div className="text-8xl mb-6">🔍</div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <p className="text-xl text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="space-y-4">
              <button
                onClick={handleGoHome}
                className="btn btn-primary text-lg px-8 py-3"
              >
                🏠 Go Home
              </button>
              <div className="text-gray-500">
                Or create a new paste to get started
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default NotFoundPage
