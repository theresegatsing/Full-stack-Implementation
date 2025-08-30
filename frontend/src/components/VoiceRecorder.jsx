import React, { useState, useRef } from 'react'
import { Mic, Square, Loader2 } from 'lucide-react'

const VoiceRecorder = ({ onNewEvent, isLoading, setIsLoading, transcript, setTranscript }) => {
  const [isRecording, setIsRecording] = useState(false)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        await sendAudioToBackend(audioBlob)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setTranscript('Listening... Speak now!')
    } catch (error) {
      console.error('Error starting recording:', error)
      setTranscript('Microphone access denied. Please allow microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
    }
  }

  const sendAudioToBackend = async (audioBlob) => {
    setIsLoading(true)
    try {
      // For now, we'll simulate the backend response
      // In the next step, we'll connect to your actual backend
      setTimeout(() => {
        const sampleEvent = {
          title: "Team Meeting",
          start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          end: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(),
          duration_minutes: 60,
          attendees: ["team@example.com"]
        }
        
        setTranscript("Meeting with team tomorrow at 2 PM for 1 hour")
        onNewEvent(sampleEvent)
        setIsLoading(false)
      }, 2000)
      
    } catch (error) {
      console.error('Error sending audio:', error)
      setTranscript('Connection error. Please check if backend is running.')
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎤 Voice Command</h2>
      
      <div className="space-y-4">
        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
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
              <Square className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
            <span>
              {isLoading ? 'Processing...' : isRecording ? 'Stop Recording' : 'Start Recording'}
            </span>
          </div>
        </button>

        {/* Voice Visualization */}
        {isRecording && (
          <div className="flex items-center justify-center space-x-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="w-2 h-8 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        )}

        {/* Transcript Display */}
        {transcript && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Transcript:</h3>
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