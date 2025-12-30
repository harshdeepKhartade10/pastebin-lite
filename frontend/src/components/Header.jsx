import { Link } from 'react-router-dom'

const Header = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollToFeatures = () => {
    const featuresElement = document.getElementById('features')
    if (featuresElement) {
      featuresElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const focusPasteInput = () => {
    // First scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })

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
          <button className="md:hidden p-2 rounded-md text-gray-600 hover:text-primary-600 hover:bg-gray-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
