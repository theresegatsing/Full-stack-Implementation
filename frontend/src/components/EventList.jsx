import React from 'react'
import { Calendar, Clock, Users } from 'lucide-react'

const EventList = ({ events }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (events.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📅 Scheduled Events</h2>
      
      <div className="space-y-3">
        {events.map((event, index) => (
          <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
            <h3 className="font-semibold text-gray-800 mb-2">{event.title}</h3>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.start)}</span>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
              <Clock className="w-4 h-4" />
              <span>
                {formatTime(event.start)} - {formatTime(event.end)}
                {event.duration_minutes && (
                  <span className="text-gray-400"> ({event.duration_minutes} minutes)</span>
                )}
              </span>
            </div>
            
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>{event.attendees.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default EventList