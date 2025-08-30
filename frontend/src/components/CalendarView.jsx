import React from 'react'
import { format, addDays, startOfWeek, addWeeks } from 'date-fns'

const CalendarView = ({ events }) => {
  const today = new Date()
  const weekStart = startOfWeek(today)
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">📆 This Week</h2>
      
      <div className="grid grid-cols-7 gap-2 mb-4">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center">
            <div className={`text-sm font-medium ${
              format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') 
                ? 'text-blue-600' 
                : 'text-gray-600'
            }`}>
              {format(day, 'EEE')}
            </div>
            <div className={`text-lg font-bold rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
              format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
                ? 'bg-blue-500 text-white'
                : 'text-gray-800'
            }`}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          Calendar integration coming soon!<br />
          Events will be displayed here on the calendar grid.
        </p>
      </div>

      {events.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold text-gray-700 mb-2">Recent Events:</h3>
          <div className="space-y-2">
            {events.slice(0, 3).map((event, index) => (
              <div key={index} className="text-sm text-gray-600">
                • {event.title} - {format(new Date(event.start), 'MMM d, h:mm a')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarView