# app.py
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import io
import tempfile
import os
import sys

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import your existing functions from separate modules
try:
    # Import Google Speech-to-Text function
    from stt_live import transcribe_audio_file
    
    # Import NLU functions from the new module
    from nlu_service import extract_event
    
    # Import calendar functions from calendar_booker
    from calendar_booker import create_event, query_conflicts
    
    print("✅ Successfully imported all backend modules")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    # Fallback to simulating the functions
    def transcribe_audio_file(audio_path):
        return "Simulated transcript: Meeting with team tomorrow at 2 PM"
    
    def extract_event(utterance):
        return {
            "intent": "CreateEvent",
            "title": "Simulated Meeting",
            "start": "2024-09-01T14:00:00",
            "end": "2024-09-01T15:00:00",
            "duration_minutes": 60,
            "attendees": ["team@example.com"],
            "timezone": "America/New_York"
        }
    
    def create_event(event_data):
        return {"id": "simulated_event", "htmlLink": "#", "status": "created"}
    
    def query_conflicts(start, end):
        return []

@app.get("/")
async def root():
    return {"message": "VoiceCalendar AI Backend is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "VoiceCalendar AI Backend"
    }

@app.post("/process-audio")
async def process_audio_file(audio: UploadFile = File(...)):
    """Process audio file from frontend using Google Speech-to-Text"""
    try:
        print(f"🎯 Received audio file: {audio.filename}")
        
        # Save audio to temporary file with correct extension
        audio_data = await audio.read()
        print(f"📊 Audio data size: {len(audio_data)} bytes")
        
        # Determine file extension based on content type or filename
        if audio.filename.endswith('.webm') or audio.content_type == 'audio/webm':
            file_extension = '.webm'
        elif audio.filename.endswith('.wav') or audio.content_type == 'audio/wav':
            file_extension = '.wav'
        else:
            # Default to webm since that's what browsers typically record in
            file_extension = '.webm'
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name
        
        print(f"💾 Saved temporary file: {tmp_file_path}")
        
        # Transcribe using your existing Google Speech-to-Text setup
        transcript = transcribe_audio_file(tmp_file_path)
        print(f"📝 Transcript: {transcript}")
        
        # Extract event data from transcript using NLU
        event_data = extract_event(transcript)
        print(f"📅 Extracted event data: {event_data}")
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        print("✅ Temporary file cleaned up")
        
        return {
            "success": True, 
            "transcript": transcript,
            "event": event_data
        }
        
    except Exception as e:
        print(f"❌ Error in process-audio: {str(e)}")
        return {"success": False, "error": str(e)}

@app.post("/process-text")
async def process_text_command(request: Request):
    """Use your existing NLU to extract event data"""
    try:
        data = await request.json()
        utterance = data.get("utterance", "")
        
        if not utterance:
            return {"success": False, "error": "No utterance provided", "event": None}
        
        event_data = extract_event(utterance)
        return {"success": True, "event": event_data, "transcript": utterance}
        
    except Exception as e:
        return {"success": False, "error": str(e), "event": None}

@app.post("/create-event")
async def create_calendar_event(request: Request):
    """Use your calendar_booker to create the event"""
    try:
        event_data = await request.json()
        result = create_event(event_data)
        return {"success": True, "event": result}
    except Exception as e:
        return {"success": False, "error": str(e), "event": None}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)