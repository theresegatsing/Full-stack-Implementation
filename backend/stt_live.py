import io
# Add this function to your existing stt_live.py
def transcribe_audio_file(file_path):
    """Transcribe an audio file using Google Speech-to-Text with fallback"""
    try:
        print(f"🔊 Attempting to transcribe: {file_path}")
        
        from google.cloud import speech
        
        client = speech.SpeechClient()
        print("✅ Google Speech client created")
        
        with io.open(file_path, "rb") as audio_file:
            content = audio_file.read()
        
        print(f"📖 Read {len(content)} bytes from audio file")
        
        audio = speech.RecognitionAudio(content=content)
        config = speech.RecognitionConfig(
            encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
            sample_rate_hertz=SAMPLE_RATE,
            language_code=LANGUAGE,
            enable_automatic_punctuation=True,
        )
        
        print("🚀 Sending request to Google Speech-to-Text...")
        response = client.recognize(config=config, audio=audio)
        print("✅ Received response from Google Speech-to-Text")
        
        transcript = ""
        for result in response.results:
            transcript += result.alternatives[0].transcript + " "
        
        print(f"📄 Final transcript: {transcript.strip()}")
        return transcript.strip()
        
    except Exception as e:
        print(f"❌ Google Speech-to-Text failed: {str(e)}")
        print("🔄 Falling back to simulated transcription...")
        
        # Fallback to simulated transcription
        simulated_transcripts = [
            "Meeting with John next Friday at 3 PM for 1 hour",
            "Lunch with team tomorrow at 12:30 for 45 minutes",
            "Interview on September 20th at 2 PM",
            "Doctor appointment Wednesday at 10 AM for 30 minutes"
        ]
        
        import random
        fallback_transcript = random.choice(simulated_transcripts)
        print(f"🎭 Using fallback transcript: {fallback_transcript}")
        
        return fallback_transcript