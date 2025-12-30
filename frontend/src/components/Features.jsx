const Features = () => {
  const features = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Create and share pastes instantly with our optimized infrastructure'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your data is encrypted and we never track your content'
    },
    {
      icon: '⏰',
      title: 'Auto-Expiration',
      description: 'Set custom TTL to automatically delete pastes after specified time'
    },
    {
      icon: '👁️',
      title: 'View Limits',
      description: 'Control how many times your paste can be viewed before deletion'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices with responsive design'
    },
    {
      icon: '🎨',
      title: 'Syntax Highlighting',
      description: 'Beautiful code highlighting for multiple programming languages'
    },
    {
      icon: '📋',
      title: 'Easy Copy',
      description: 'One-click copy to clipboard functionality'
    },
    {
      icon: '🌐',
      title: 'Shareable Links',
      description: 'Generate clean, shareable URLs for your pastes'
    }
  ]

  return (
    <section id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">✨ Features</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Everything you need for secure and efficient text sharing
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow glass-effect animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="text-3xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Stats Section */}
      <div className="mt-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white text-center">
        <h3 className="text-2xl font-bold mb-6"> Trusted by Developers</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl font-bold mb-2">100+</div>
            <div className="text-primary-100">Pastes Created</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">99.9%</div>
            <div className="text-primary-100">Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">&lt;100ms</div>
            <div className="text-primary-100">Response Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features
