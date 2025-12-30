import { useState } from 'react'
import { Link } from 'react-router-dom'

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMobileMenuOpen(false)
  }

  const scrollToFeatures = () => {
    const featuresElement = document.getElementById('features')
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' })
    }
    setIsMobileMenuOpen(false)
  }

  const focusPasteInput = () => {
    // First scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setIsMobileMenuOpen(false)

    // Then focus the textarea after a short delay to allow scroll to complete
    setTimeout(() => {
      // Try multiple selectors to find the textarea
      let textarea = document.querySelector('textarea[placeholder*="Paste your content here"]')

      // Fallback selectors if the first one doesn't work
      if (!textarea) {
        textarea = document.querySelector('textarea')
      }

      if (!textarea) {
        textarea = document.querySelector('.textarea')
      }

      if (textarea) {
        textarea.focus()
        // Clear any existing content to start fresh
        textarea.value = ''
        // Place cursor at the beginning
        textarea.setSelectionRange(0, 0)

        // Add a visual indicator that it's ready
        textarea.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.5)'
        setTimeout(() => {
          textarea.style.boxShadow = ''
        }, 2000)
      }
    }, 800) // Wait for smooth scroll to complete
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            to="/"
            className="flex items-center space-x-2 text-2xl font-bold gradient-text hover:opacity-80 transition-opacity"
            onClick={scrollToTop}
          >
            <span>📋</span>
            <span>Pastebin Lite</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <button
              onClick={scrollToTop}
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={scrollToFeatures}
              className="text-gray-600 hover:text-primary-600 transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={focusPasteInput}
              className="btn btn-primary"
            >
              Create Paste
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${isMobileMenuOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <nav className="py-4 space-y-2">
            <button
              onClick={scrollToTop}
              className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={scrollToFeatures}
              className="block w-full text-left px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
            >
              Features
            </button>
            <button
              onClick={focusPasteInput}
              className="block w-full text-left px-4 py-2 text-primary-600 hover:bg-primary-50 rounded-md transition-colors font-medium"
            >
              Create Paste
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
