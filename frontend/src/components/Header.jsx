import React from 'react'
import { Calendar, Mic } from 'lucide-react'

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">VoiceCalendar AI</h1>
              <p className="text-sm text-gray-600">Voice-powered calendar management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 text-gray-500">
            <Calendar className="w-5 h-5" />
            <span className="text-sm">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header