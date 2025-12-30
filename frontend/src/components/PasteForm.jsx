import { useState } from 'react'
import toast from 'react-hot-toast'

const PasteForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    content: '',
    ttl_seconds: '',
    max_views: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required'
    } else if (formData.content.length > 1000000) {
      newErrors.content = 'Content must be less than 1MB'
    }

    if (formData.ttl_seconds && (isNaN(formData.ttl_seconds) || formData.ttl_seconds < 1)) {
      newErrors.ttl_seconds = 'TTL must be a positive number'
    }

    if (formData.max_views && (isNaN(formData.max_views) || formData.max_views < 1)) {
      newErrors.max_views = 'Max views must be a positive number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    const submitData = {
      content: formData.content.trim(),
      ...(formData.ttl_seconds && { ttl_seconds: parseInt(formData.ttl_seconds) }),
      ...(formData.max_views && { max_views: parseInt(formData.max_views) })
    }

    onSubmit(submitData)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const presetOptions = [
    { label: 'No expiry', ttl: '' },
    { label: '1 hour', ttl: 3600 },
    { label: '1 day', ttl: 86400 },
    { label: '1 week', ttl: 604800 },
    { label: '1 month', ttl: 2592000 }
  ]

  const viewLimitOptions = [
    { label: 'Unlimited views', max: '' },
    { label: '1 view', max: 1 },
    { label: '5 views', max: 5 },
    { label: '10 views', max: 10 },
    { label: '25 views', max: 25 }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Content Input */}
      <div>
        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
          Content *
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleInputChange}
          className={`textarea ${errors.content ? 'border-red-500 focus:ring-red-500' : ''}`}
          rows={12}
          placeholder="Paste your content here..."
          disabled={isLoading}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content}</p>
        )}
        <div className="mt-1 text-sm text-gray-500">
          {formData.content.length.toLocaleString()} characters
        </div>
      </div>

      {/* Options Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* TTL Settings */}
        <div>
          <label htmlFor="ttl_seconds" className="block text-sm font-medium text-gray-700 mb-2">
            Expiry Time
          </label>
          <select
            id="ttl_seconds"
            name="ttl_seconds"
            value={formData.ttl_seconds}
            onChange={handleInputChange}
            className="input"
            disabled={isLoading}
          >
            {presetOptions.map(option => (
              <option key={option.label} value={option.ttl}>
                {option.label}
              </option>
            ))}
          </select>
          {formData.ttl_seconds && (
            <p className="mt-1 text-sm text-gray-500">
              Expires in {formData.ttl_seconds} seconds
            </p>
          )}
        </div>

        {/* View Limit Settings */}
        <div>
          <label htmlFor="max_views" className="block text-sm font-medium text-gray-700 mb-2">
            View Limit
          </label>
          <select
            id="max_views"
            name="max_views"
            value={formData.max_views}
            onChange={handleInputChange}
            className="input"
            disabled={isLoading}
          >
            {viewLimitOptions.map(option => (
              <option key={option.label} value={option.max}>
                {option.label}
              </option>
            ))}
          </select>
          {formData.max_views && (
            <p className="mt-1 text-sm text-gray-500">
              Will be deleted after {formData.max_views} views
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <span className="loading-spinner w-5 h-5 mr-2 inline-block"></span>
              Creating...
            </>
          ) : (
            <>
              ✨ Create Paste
            </>
          )}
        </button>
      </div>
    </form>
  )
}

export default PasteForm
