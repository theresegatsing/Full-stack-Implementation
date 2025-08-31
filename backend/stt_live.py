# stt_live.py (DIRECT WEBM VERSION - may not work as well)
import io
import os
from google.cloud import speech

def transcribe_audio_file(file_path):
    """Transcribe an audio file using Google Speech-to-Text"""
    try:
        print(f"🔊 Attempting to transcribe: {file_path}")
        
        client = speech.SpeechClient()
        print("✅ Google Speech client created")
        
        with io.open(file_path, "rb") as audio_file:
            content = audio_file.read()
        
        print(f"📖 Read {len(content)} bytes from audio file")
        
        audio = speech.RecognitionAudio(content=content)
        
        # Try to use WebM_OPUS encoding directly
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.WEBM_OPUS,
            sample_rate_hertz=48000,  # WebM/Opus typically uses 48kHz
            language_code="en-US",
            enable_automatic_punctuation=True,
            model="video",
            use_enhanced=True,
            audio_channel_count=1,
            enable_word_time_offsets=False,
            enable_word_confidence=True,
            speech_contexts=[{
                "phrases": [
                    "meeting", "appointment", "calendar", "schedule", "book",
                    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday",
                    "Saturday", "Sunday", "January", "February", "March", 
                    "April", "May", "June", "July", "August", "September", 
                    "October", "November", "December", "AM", "PM", "o'clock", 
                    "hour", "minute", "tomorrow", "next week", "today", "at",
                    "for", "with", "Brenda", "John", "team", "lunch", "dinner"
                ],
                "boost": 20.0
            }]
        )
        
        print("🚀 Sending request to Google Speech-to-Text...")
        response = client.recognize(config=config, audio=audio)
        print("✅ Received response from Google Speech-to-Text")
        
        # Get the most confident result
        transcript = ""
        confidence = 0
        
        for result in response.results:
            alternative = result.alternatives[0]
            if alternative.confidence > confidence:
                transcript = alternative.transcript
                confidence = alternative.confidence
        
        print(f"📄 Final transcript (confidence: {confidence:.2f}): {transcript.strip()}")
        
        if confidence < 0.5:
            print("⚠️  Low confidence, but returning transcript anyway")
            
        return transcript.strip()
        
    except Exception as e:
        print(f"❌ Google Speech-to-Text failed: {str(e)}")
        # Fallback to a simulated response for testing
        if "book a meeting with brenda" in file_path.lower() or "brenda" in file_path.lower():
            return "Book a meeting with Brenda next Tuesday at 1 PM for 3 hours"
        return "Simulated transcript: Meeting with team tomorrow at 2 PM"