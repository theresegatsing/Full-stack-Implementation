import React, { useState, useRef } from 'react';

const VoiceRecorder = ({ onNewEvent, isLoading, setIsLoading, transcript, setTranscript, setNotification, setCurrentView, setCurrentEvent }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [showTextInput, setShowTextInput] = useState(false);
    const [textInput, setTextInput] = useState("");
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    
    // Enhanced speech patterns for better recognition
    const speechPatterns = [
        "Schedule meeting with John tomorrow at 3 PM for 1 hour",
        "Team lunch next Friday at 12:30 for 45 minutes",
        "Dentist appointment on March 15 at 10 AM",
        "Conference call with clients Wednesday at 2 PM",
        "Doctor visit next Tuesday at 11:30 AM for 30 minutes",
        "Birthday party on Saturday at 4 PM for 2 hours"
    ];
    
    const startRecording = async () => {
        try {
            setIsRecording(true);
            setTranscript("Initializing microphone...");
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 48000
                } 
            });
            
            const mediaRecorder = new MediaRecorder(stream, { 
                mimeType: 'audio/webm; codecs=opus'
            });
            
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                await processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };
            
            mediaRecorder.start(1000);
            setTranscript("Listening... Speak clearly and slowly");
            
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setNotification({
                message: "Microphone access denied. Please use text input.",
                type: "error"
            });
            setIsRecording(false);
            setShowTextInput(true);
        }
    };
    
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setTranscript("Processing your speech...");
        }
    };
    
    // Enhanced speech processing with better parsing
    const parseSpeechToEvent = (transcript) => {
        // Default event structure
        const event = {
            title: "Meeting",
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            duration: 60,
            description: "Created from voice command"
        };
        
        // Extract time patterns
        const timePatterns = [
            { regex: /at (\d{1,2}):?(\d{2})? ?(AM|PM)/i, handler: (match) => {
                let hours = parseInt(match[1]);
                const minutes = match[2] ? parseInt(match[2]) : 0;
                const period = match[3].toUpperCase();
                
                if (period === 'PM' && hours < 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                return { hours, minutes };
            }},
            { regex: /at (\d{1,2}) ?(AM|PM)/i, handler: (match) => {
                let hours = parseInt(match[1]);
                const period = match[2].toUpperCase();
                
                if (period === 'PM' && hours < 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;
                
                return { hours, minutes: 0 };
            }}
        ];
        
        // Extract duration
        const durationMatch = transcript.match(/(\d+)\s*(minute|hour)/i);
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            event.duration = durationMatch[2].toLowerCase() === 'hour' ? value * 60 : value;
        }
        
        // Extract date references
        if (transcript.toLowerCase().includes('tomorrow')) {
            event.date.setDate(event.date.getDate() + 1);
        } else if (transcript.toLowerCase().includes('next week')) {
            event.date.setDate(event.date.getDate() + 7);
        }
        
        // Set title from transcript
        event.title = transcript.length > 30 ? transcript.substring(0, 30) + "..." : transcript;
        event.description = transcript;
        
        return event;
    };
    
    const processAudio = async (audioBlob) => {
        setIsLoading(true);
        
        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");
            
            const response = await fetch("http://localhost:8000/process-audio", {
                method: "POST",
                body: formData,
            });
            
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            
            const result = await response.json();
            console.log("Backend response:", result); // DEBUG
            
            if (result.success) {
                // Use the event data from the backend, not parsed on frontend
                console.log("Event data from backend:", result.event); // DEBUG
                setCurrentEvent(result.event);
                setCurrentView('confirmation');
                setTranscript(result.transcript);
            } else {
                throw new Error(result.error || "Speech recognition failed");
            }
        } catch (error) {
            console.error("Error processing audio:", error);
            setNotification({
                message: error.message,
                type: "error"
            });
            setTranscript("❌ Error: " + error.message);
            setShowTextInput(true);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleTextSubmit = () => {
        if (textInput.trim()) {
            // For text input, we need to parse it since we're not calling the backend
            const event = parseSpeechToEvent(textInput);
            setCurrentEvent(event);
            setCurrentView('confirmation');
            setTextInput("");
            setShowTextInput(false);
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">🎤 Voice Command</h2>
            
            <div className="flex flex-col items-center">
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isLoading}
                    className={`p-4 rounded-full text-white font-medium mb-4 flex items-center justify-center ${isRecording ? 'bg-red-500 pulse-recording' : 'bg-indigo-600 hover:bg-indigo-700'} ${isLoading ? 'opacity-50' : ''}`}
                    style={{ width: '80px', height: '80px' }}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : isRecording ? (
                        <i className="fas fa-stop text-2xl"></i>
                    ) : (
                        <i className="fas fa-microphone text-2xl"></i>
                    )}
                </button>
                
                <p className="text-gray-600 mb-2">
                    {isRecording ? "Recording in progress..." : isLoading ? "Processing your request..." : "Start Recording"}
                </p>
                
                {transcript && (
                    <div className="w-full mt-4 p-4 bg-gray-100 rounded-md">
                        <p className="text-gray-700">{transcript}</p>
                    </div>
                )}
                
                {showTextInput && (
                    <div className="w-full mt-4">
                        <p className="text-red-500 mb-2">❌ Voice recognition failed. Please type your command:</p>
                        <div className="flex">
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                placeholder="e.g., Meeting with John tomorrow at 3 PM"
                                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <button
                                onClick={handleTextSubmit}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-r-md hover:bg-indigo-700"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="mt-6 text-sm text-gray-500">
                    <p className="font-medium">💡 Try saying clearly:</p>
                    <ul className="list-disc list-inside mt-1">
                        <li>"Meeting with John next Friday at 3 PM for 1 hour"</li>
                        <li>"Lunch with team tomorrow at 12:30 for 45 minutes"</li>
                        <li>"Interview on September 20th at 2 PM"</li>
                    </ul>
                    <p className="mt-2">💡 Tip: Use a headset microphone and speak clearly in a quiet environment for best results.</p>
                </div>
            </div>
        </div>
    );
};

export default VoiceRecorder;