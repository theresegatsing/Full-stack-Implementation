# app.py
from fastapi import FastAPI, HTTPException, Request, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import speech_recognition as sr
import io
import tempfile
import os

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
    # Import NLU functions from the new module
    from nlu_service import extract_event
    
    # Import calendar functions from calendar_booker
    from calendar_booker import create_event, query_conflicts
    
    print("✅ Successfully imported NLU and calendar modules")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    # Fallback to simulating the functions
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
    """Process audio file from frontend"""
    try:
        # Save audio to temporary file
        audio_data = await audio.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(audio_data)
            tmp_file_path = tmp_file.name
        
        # Transcribe audio using speech_recognition
        recognizer = sr.Recognizer()
        
        with sr.AudioFile(tmp_file_path) as source:
            audio_content = recognizer.record(source)
            transcript = recognizer.recognize_google(audio_content)
        
        # Clean up temporary file
        os.unlink(tmp_file_path)
        
        return {"success": True, "transcript": transcript}
        
    except sr.UnknownValueError:
        return {"success": False, "error": "Could not understand audio"}
    except sr.RequestError as e:
        return {"success": False, "error": f"Speech recognition error: {e}"}
    except Exception as e:
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