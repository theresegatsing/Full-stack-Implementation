import React, { useState } from 'react'
import { Mic, Loader2, Keyboard } from 'lucide-react'

const VoiceRecorder = ({ onNewEvent, isLoading, setIsLoading, transcript, setTranscript }) => {
  const [isRecording, setIsRecording] = useState(false)

  const processVoiceCommand = async () => {
    setIsLoading(true)
    setIsRecording(true)
    setTranscript('Recording... Speak now!')
    
    try {
      // Call your backend's voice endpoint
      const response = await fetch('http://localhost:8000/process-voice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTranscript(result.transcript)
        // Now process the transcript through NLU
        await processTextCommand(result.transcript)
      } else {
        setTranscript(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Voice processing error:', error)
      setTranscript('Connection error. Please check backend.')
    } finally {
      setIsLoading(false)
      setIsRecording(false)
    }
  }

  const processTextCommand = async (text) => {
    try {
      const response = await fetch('http://localhost:8000/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ utterance: text }),
      })

      const result = await response.json()
      
      if (result.success) {
        // Now create the calendar event
        const calendarResponse = await fetch('http://localhost:8000/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result.event),
        })
        
        const calendarResult = await calendarResponse.json()
        
        if (calendarResult.success) {
          onNewEvent(calendarResult.event)
        } else {
          setTranscript(`Calendar error: ${calendarResult.error}`)
        }
      } else {
        setTranscript(`NLU error: ${result.error}`)
      }
    } catch (error) {
      console.error('Text processing error:', error)
      setTranscript('Connection error. Please check backend.')
    }
  }

  const handleTextInput = async () => {
    const text = prompt('Enter your calendar command:')
    if (text) {
      setIsLoading(true)
      setTranscript(`Processing: ${text}`)
      await processTextCommand(text)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎤 Voice Command</h2>
      
      <div className="space-y-4">
        {/* Real Voice Button - connects to your stt_live.py */}
        <button
          onClick={processVoiceCommand}
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="flex items-center justify-center space-x-2">
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isRecording ? (
              <div className="flex space-x-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-2 h-6 bg-white rounded-full animate-pulse" />
                ))}
              </div>
            ) : (
              <Mic className="w-6 h-6" />
            )}
            <span>
              {isLoading ? 'Processing...' : isRecording ? 'Listening...' : 'Start Voice Recording'}
            </span>
          </div>
        </button>

        {/* Text Input Fallback */}
        <button
          onClick={handleTextInput}
          disabled={isLoading}
          className="w-full py-3 px-6 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Keyboard className="w-5 h-5" />
          <span>Type Command Instead</span>
        </button>

        {/* Transcript Display */}
        {transcript && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Status:</h3>
            <p className="text-gray-600">{transcript}</p>
          </div>
        )}

        {/* Example Commands */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800 mb-2">Try saying:</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>"Meeting with John next Friday at 3 PM for 1 hour"</li>
            <li>"Lunch with team tomorrow at 12:30 for 45 minutes"</li>
            <li>"Interview on September 20th at 2 PM"</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default VoiceRecorder