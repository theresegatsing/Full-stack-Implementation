import React from 'react'
import { CheckCircle, XCircle, Calendar, ExternalLink, X } from 'lucide-react'

const Notification = ({ message, type, event, onClose }) => {
  if (!message) return null

  const bgColor = type === 'success' ? 'bg-green-50 border-green-200' : 
                 type === 'error' ? 'bg-red-50 border-red-200' : 
                 'bg-blue-50 border-blue-200'

  const icon = type === 'success' ? <CheckCircle className="w-6 h-6 text-green-500" /> :
              type === 'error' ? <XCircle className="w-6 h-6 text-red-500" /> :
              <Calendar className="w-6 h-6 text-blue-500" />

  return (
    <div className={`fixed top-4 right-4 z-50 border rounded-lg p-4 shadow-lg ${bgColor} max-w-md animate-fade-in`}>
      <div className="flex items-start space-x-3">
        {icon}
        <div className="flex-1">
          <p className="font-medium text-gray-800">{message}</p>
          {event && event.htmlLink && (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center mt-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View in Calendar
            </a>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}

export default Notification