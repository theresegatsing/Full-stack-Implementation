from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import importlib.util
import sys
import os

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

# Import your existing functions
try:
    # Import STT function
    from stt_live import transcribe_once
    
    # Import NLU function (from your app.py)
    from app import extract_event
    
    # Import calendar functions
    from calendar_booker import create_event, query_conflicts
    
except ImportError as e:
    print(f"Import error: {e}")
    # Fallback to simulating the functions

@app.get("/")
async def root():
    return {"message": "VoiceCalendar AI Backend is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "VoiceCalendar AI Backend"}

@app.post("/process-voice")
async def process_voice_command():
    """Use your existing stt_live.py to transcribe audio"""
    try:
        # This will use your existing transcribe_once function
        transcript = transcribe_once()
        return {"success": True, "transcript": transcript}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/process-text")
async def process_text_command(utterance: str):
    """Use your existing NLU to extract event data"""
    try:
        event_data = extract_event(utterance)
        return {"success": True, "event": event_data, "transcript": utterance}
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.post("/create-event")
async def create_calendar_event(event_data: dict):
    """Use your calendar_booker to create the event"""
    try:
        result = create_event(event_data)
        return {"success": True, "event": result}
    except Exception as e:
        return {"success": False, "error": str(e)}