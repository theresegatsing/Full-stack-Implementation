import React, { useState, useRef } from 'react'
import { Mic, Square, Loader2, Keyboard } from 'lucide-react'

const VoiceRecorder = ({ onNewEvent, isLoading, setIsLoading, transcript, setTranscript }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const audioChunks = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' })
        await sendAudioToBackend(audioBlob)
        audioChunks.current = []
      }
      
      setMediaRecorder(recorder)
      recorder.start()
      setIsRecording(true)
      setTranscript('🎤 Recording... Speak now!')
      
    } catch (error) {
      console.error('Error starting recording:', error)
      setTranscript('❌ Microphone access denied. Please allow permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      mediaRecorder.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      setTranscript('⏳ Processing your audio...')
    }
  }

  const sendAudioToBackend = async (audioBlob) => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.wav')
      
      const response = await fetch('http://localhost:8000/process-audio', {
        method: 'POST',
        body: formData,
      })
      
      const result = await response.json()
      
      if (result.success) {
        setTranscript(`✅ Heard: ${result.transcript}`)
        await processTextCommand(result.transcript)
      } else {
        setTranscript(`❌ Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error sending audio:', error)
      setTranscript('🔌 Connection error. Please check backend.')
    } finally {
      setIsLoading(false)
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
        // Create the calendar event
        const calendarResponse = await fetch('http://localhost:8000/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result.event),
        })
        
        const calendarResult = await calendarResponse.json()
        
        if (calendarResult.success) {
          setTranscript(`✅ Event created: ${result.event.title}`)
          onNewEvent(calendarResult.event)
        } else {
          setTranscript(`❌ Calendar error: ${calendarResult.error}`)
        }
      } else {
        setTranscript(`❌ NLU error: ${result.error}`)
      }
    } catch (error) {
      console.error('Text processing error:', error)
      setTranscript('🔌 Connection error. Please check backend.')
    }
  }

  const handleTextInput = async () => {
    const text = prompt('Enter your calendar command:')
    if (text) {
      setIsLoading(true)
      setTranscript(`📝 Processing: ${text}`)
      await processTextCommand(text)
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">🎤 Voice Command</h2>
      
      <div className="space-y-4">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
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

        {/* ... rest of your component ... */}
      </div>
    </div>
  )
}

export default VoiceRecorder