# app.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import importlib.util
import sys
import os
import threading

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
    # Import STT function from stt_live
    from stt_live import transcribe_once, transcribe_with_control
    
    # Import NLU functions from the new module
    from nlu_service import extract_event
    
    # Import calendar functions from calendar_booker
    from calendar_booker import create_event, query_conflicts
    
    print("✅ Successfully imported all backend modules")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
    # Fallback to simulating the functions
    def transcribe_once():
        return "Simulated transcript: Meeting with team tomorrow at 2 PM"
    
    def transcribe_with_control():
        return "Simulated controlled transcript: Meeting with team tomorrow at 2 PM"
    
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

class EventRequest(BaseModel):
    utterance: str

class VoiceResponse(BaseModel):
    success: bool
    transcript: str = None
    error: str = None

class EventResponse(BaseModel):
    success: bool
    event: Dict[str, Any] = None
    error: str = None

@app.get("/")
async def root():
    return {"message": "VoiceCalendar AI Backend is running!"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "service": "VoiceCalendar AI Backend",
        "modules_loaded": "extract_event" in globals()
    }

@app.post("/process-voice")
async def process_voice_command():
    """Use your existing stt_live.py to transcribe audio"""
    try:
        # Use the new controllable function
        transcript = transcribe_with_control()
        return {"success": True, "transcript": transcript}
    except Exception as e:
        return {"success": False, "error": str(e), "transcript": None}

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