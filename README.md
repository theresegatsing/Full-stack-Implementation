# Intelligent VoiceCalendarAI: The Voice-First Productivity Engine
Bridge the gap between thought and action. Intelligent VoiceCalendarAI is a cutting-edge full-stack application that transforms spoken language into structured calendar events. Move beyond clunky interfaces, simply speak your intentions and watch your schedule build itself with powerful AI precision.

## 🚀 Core Innovation
This is more than a simple voice-to-text tool. It's an intelligent parsing engine that understands natural language, extracting intent, dates, times, and event descriptions to create accurate and actionable calendar entries seamlessly.

## Demo Video

[▶️ Watch the Demo](https://drive.google.com/file/d/1iCuwpQCWXaDjmrE9vsddA6AK89Uz15zN/view?usp=sharing)


## ✨ Features
**Natural Language Command:** Say "Schedule a meeting with Alex next Monday at 3pm to discuss the quarterly project report" and let the AI handle the rest.

**AI-Powered Context Recognition:** Leverages a sophisticated large language model to accurately infer event titles, descriptions, participants, and precise timings from unstructured speech.

**Seamless Calendar Integration:** Events are created instantly and displayed in a clean, intuitive interface.

**Modern, Responsive UI:** A sleek frontend built with React provides a fluid user experience on any device.

**Robust & Scalable Backend:** A high-performance Python API serves as the brain, handling audio processing and AI inference with reliability.

## 🛠️ Tech Stack
**Frontend:**

- React - A modern library for building a dynamic user interface.

- Vite - Next-generation frontend tooling for a blazing fast development experience.

- Tailwind CSS - A utility-first CSS framework for rapidly designing custom, responsive user interfaces.

**Backend:**

- FastAPI - A modern, high-performance web framework for building APIs with Python 3.8+.

- Whisper (or similar STT service) - For converting speech audio to text.

- GPT-4/Claude/Google Gemini (LLM Integration) - For parsing text and extracting structured calendar data.

- Pydantic - Data validation using Python type annotations, ensuring robustness.

## ⚙️ Installation & Setup
**Prerequisites**
- Node.js (v18 or higher)
- Python (3.8 or higher)
- pip (Python package manager)



1. Clone the Repository

   ```bash
    git clone <your-repo-url>
    cd VoiceCalendarAI-Full
   ```
2. Backend Setup

    ```bash
    # Navigate to the backend directory
    cd backend

    # Create a virtual environment
    python -m venv venv

    # Activate the virtual environment
    # On Windows: .\venv\Scripts\activate
    # On macOS/Linux: source venv/bin/activate

    # Install Python dependencies
    pip install -r requirements.txt
    ```
3. Frontend Setup

     ```bash
     # Navigate to the frontend directory
     cd ../frontend

     # Install npm dependencies
     npm install
     ```

 ## 🏃‍♂️ Running the Application Locally
 
 **Starting the Backend Server**
  - From the **backend** directory:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
  - The API will be available at **http://localhost:8000**. Interactive API documentation (Swagger UI) will be automatically available at **http://localhost:8000/docs**.

**Starting the Frontend Development Server**
  - From the **frontend** directory:

 ``` bash
    npm run dev
 ```
  - The application will be available at **http://localhost:5173**.


## 🔮 Usage
1. **Grant Microphone Permissions:** Click "Start Recording" and allow the browser to access your microphone.

2. **Speak Your Event:** Clearly state your meeting or task. For example: "Lunch with Sarah at Cafe Neo this Friday at 1 PM for one hour."

3. **Stop Recording:** Click "Stop". The application will automatically process your audio.

4. **Review & Confirm:** The parsed event details (title, attendee, location, time) will appear. Confirm to add it to your calendar view.



## 🧪 Testing the API
You can directly test the core **/process-audio** endpoint using **curl**:
```bash
    curl -X 'POST' \
      'http://localhost:8000/process-audio' \
      -H 'Content-Type: application/json' \
      -d '{
      "audio": "your_base64_encoded_audio_string_here"
    }'
```


## 🤝 Contributing

We welcome contributions! To contribute to Intelligent VoiceCalendarAI:

 1. Fork the Project.

 2. Create your Feature Branch (```bash git checkout -b feature/AmazingFeature ```).

 3. Commit your Changes (``` bash git commit -m 'Add some AmazingFeature' ```).

 4. Push to the Branch ( ``` git push origin feature/AmazingFeature ```).

 5. Open a Pull Request.


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


