import React, { useState, useRef } from 'react'
import { Mic, Square, Loader2, Keyboard, CheckCircle, XCircle } from 'lucide-react'

const VoiceRecorder = ({ onNewEvent, isLoading, setIsLoading, transcript, setTranscript }) => {
  const [isRecording, setIsRecording] = useState(false)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const audioChunks = useRef([])

  const startRecording = async () => {
    try {
      console.log('🎤 Starting recording...')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data)
        }
      }
      
      recorder.onstop = async () => {
        console.log('⏹️ Recording stopped, processing audio...')
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
      console.log('🛑 Stopping recording...')
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
      
      console.log('📤 Sending audio to backend...')
      
      const response = await fetch('http://localhost:8000/process-audio', {
        method: 'POST',
        body: formData,
      })
      
      console.log('📥 Received response from backend')
      const result = await response.json()
      console.log('Backend result:', result)
      
      if (result.success) {
        setTranscript(`✅ Heard: ${result.transcript}`)
        await processTextCommand(result.transcript)
      } else {
        setTranscript(`❌ Error: ${result.error}`)
        console.error('Backend error:', result.error)
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
      console.log('📨 Sending text to NLU:', text)
      
      const response = await fetch('http://localhost:8000/process-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ utterance: text }),
      })

      const result = await response.json()
      console.log('NLU result:', result)
      
      if (result.success) {
        console.log('📅 Creating calendar event:', result.event)
        
        const calendarResponse = await fetch('http://localhost:8000/create-event', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(result.event),
        })
        
        const calendarResult = await calendarResponse.json()
        console.log('Calendar result:', calendarResult)
        
        if (calendarResult.success) {
          setTranscript(`✅ Event created: ${result.event.title}`)
          onNewEvent(calendarResult.event)
        } else {
          setTranscript(`❌ Calendar error: ${calendarResult.error}`)
          console.error('Calendar error:', calendarResult.error)
        }
      } else {
        setTranscript(`❌ NLU error: ${result.error}`)
        console.error('NLU error:', result.error)
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

        <button
          onClick={handleTextInput}
          disabled={isLoading}
          className="w-full py-3 px-6 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Keyboard className="w-5 h-5" />
          <span>Type Command Instead</span>
        </button>

        {transcript && (
          <div className={`p-4 rounded-lg ${
            transcript.includes('✅') ? 'bg-green-50 border border-green-200' :
            transcript.includes('❌') ? 'bg-red-50 border border-red-200' :
            'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-start space-x-2">
              {transcript.includes('✅') ? (
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              ) : transcript.includes('❌') ? (
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Status:</h3>
                <p className="text-gray-600">{transcript}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-2">💡 Try saying:</h3>
          <ul className="text-sm text-blue-600 space-y-1">
            <li>"Meeting with John next Friday at 3 PM for 1 hour"</li>
            <li>"Lunch with team tomorrow at 12:30 for 45 minutes"</li>
            <li>"Interview on September 20th at 2 PM"</li>
            <li>"Doctor appointment Wednesday at 10 AM for 30 minutes"</li>
          </ul>
        </div>

        <div className="p-3 bg-gray-100 rounded-lg text-xs text-gray-500">
          <strong>Backend:</strong> http://localhost:8000
          <br />
          <strong>Endpoints:</strong> /process-audio, /process-text, /create-event
        </div>
      </div>
    </div>
  )
}

export default VoiceRecorder