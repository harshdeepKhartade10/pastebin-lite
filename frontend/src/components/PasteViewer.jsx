import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

const PasteViewer = ({ paste }) => {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paste.content)
      setCopied(true)
      toast.success('Content copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const handleCreateNew = () => {
    navigate('/')
  }

  const handleCopyLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const getExpirationInfo = () => {
    if (!paste.expires_at) return null

    const expiryDate = new Date(paste.expires_at)
    const now = new Date()
    const isExpired = expiryDate <= now

    return {
      date: expiryDate,
      isExpired,
      timeAgo: formatDistanceToNow(expiryDate, { addSuffix: true })
    }
  }

  const expirationInfo = getExpirationInfo()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6 glass-effect">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 View Paste</h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span>🆔 ID: {window.location.pathname.split('/').pop()}</span>
              <span>📅 Created: {formatDistanceToNow(new Date(paste.created_at), { addSuffix: true })}</span>
              {paste.remaining_views !== null && (
                <span>👁️ Views: {paste.remaining_views} remaining</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="btn btn-secondary"
              title="Copy link"
            >
              🔗 Copy Link
            </button>
            <button
              onClick={handleCreateNew}
              className="btn btn-primary"
            >
              ✨ New Paste
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden glass-effect">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Content</h2>
            <button
              onClick={handleCopyToClipboard}
              className={`btn ${copied ? 'btn-secondary' : 'btn-primary'} px-4 py-2 text-sm`}
            >
              {copied ? ' Copied!' : ' Copy Content'}
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="code-container custom-scrollbar">
            <pre>
              <code>{paste.content}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-xl shadow-lg p-6 glass-effect">
        <h3 className="text-lg font-semibold text-gray-800 mb-4"> Paste Information</h3>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">
                {new Date(paste.created_at).toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Content Size:</span>
              <span className="font-medium">
                {paste.content.length.toLocaleString()} characters
              </span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Views:</span>
              <span className="font-medium">
                {(paste.max_views || 0) - (paste.remaining_views || 0)}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {expirationInfo && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Expires:</span>
                <span className={`font-medium ${expirationInfo.isExpired ? 'text-red-600' : 'text-green-600'}`}>
                  {expirationInfo.isExpired ? 'Expired' : expirationInfo.timeAgo}
                </span>
              </div>
            )}

            {paste.remaining_views !== null && (
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Remaining Views:</span>
                <span className={`font-medium ${paste.remaining_views === 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {paste.remaining_views}
                </span>
              </div>
            )}

            <div className="flex justify-between py-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-green-600">
                🟢 Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Warning Messages */}
      {expirationInfo?.isExpired && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">⚠️</span>
            <span className="text-red-800">This paste has expired and will be deleted soon.</span>
          </div>
        </div>
      )}

      {paste.remaining_views === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⚠️</span>
            <span className="text-yellow-800">This paste has reached its view limit and will be deleted.</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default PasteViewer
