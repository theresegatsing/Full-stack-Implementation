import React, { useState } from 'react';
import VoiceRecorder from './components/VoiceRecorder';
import CalendarView from './components/CalendarView';
import EventList from './components/EventList';
import Header from './components/Header';
import Notification from './components/Notification';
import EventConfirmation from './components/EventConfirmation';

function App() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [notification, setNotification] = useState(null);
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'confirmation'
  const [currentEvent, setCurrentEvent] = useState(null);

  const handleNewEvent = (newEvent) => {
    setEvents(prev => [...prev, { ...newEvent, id: Date.now() }]);
    setNotification({
      message: "Event added successfully!",
      type: "success",
      event: newEvent
    });
    setCurrentView('main');
  };

  const confirmEvent = async () => {
    if (currentEvent) {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:8000/create-event", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentEvent),
        });
        
        const result = await response.json();
        
        if (result.success) {
          handleNewEvent(currentEvent);
          setNotification({
            message: "Event created successfully in your calendar!",
            type: "success",
            event: currentEvent
          });
        } else {
          throw new Error(result.error || "Failed to create event in calendar");
        }
      } catch (error) {
        console.error("Error creating event:", error);
        setNotification({
          message: error.message,
          type: "error"
        });
        // Still add to local events even if calendar creation fails
        handleNewEvent(currentEvent);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <Notification 
        message={notification?.message}
        type={notification?.type}
        event={notification?.event}
        onClose={() => setNotification(null)}
      />
      
      <div className="container mx-auto px-4 py-8">
        {currentView === 'confirmation' ? (
          <EventConfirmation 
            event={currentEvent}
            onBack={() => setCurrentView('main')}
            onConfirm={confirmEvent}
            isLoading={isLoading}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <VoiceRecorder 
                onNewEvent={handleNewEvent}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                transcript={transcript}
                setTranscript={setTranscript}
                setNotification={setNotification}
                setCurrentView={setCurrentView}
                setCurrentEvent={setCurrentEvent}
              />
              
              <EventList events={events} />
            </div>

            <div className="lg:col-span-1">
              <CalendarView events={events} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;