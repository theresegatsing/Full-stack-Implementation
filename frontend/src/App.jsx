import React, { useState } from 'react'
import VoiceRecorder from './components/VoiceRecorder'
import CalendarView from './components/CalendarView'
import EventList from './components/EventList'
import Header from './components/Header'

function App() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState('')

  const handleNewEvent = (newEvent) => {
    setEvents(prev => [...prev, { ...newEvent, id: Date.now() }])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Voice Interface */}
          <div className="space-y-6">
            <VoiceRecorder 
              onNewEvent={handleNewEvent}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              transcript={transcript}
              setTranscript={setTranscript}
            />
            
            {events.length > 0 && (
              <EventList events={events} />
            )}
          </div>

          {/* Right Column - Calendar View */}
          <div className="lg:col-span-1">
            <CalendarView events={events} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App