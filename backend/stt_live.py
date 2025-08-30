# Add this function to your stt_live.py
def transcribe_with_control(stop_event=None):
    """
    Modified version that can be stopped externally
    """
    global committed_text
    committed_text = ""
    
    print("🎤 Speak now... (Recording will auto-stop after silence)")
    
    try:
        client = speech.SpeechClient()
    except DefaultCredentialsError:
        print("[!] No Google Speech credentials. Falling back to typed input.")
        return input("🧑 Type your command: ")
    
    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=SAMPLE_RATE,
        language_code=LANGUAGE,
        enable_automatic_punctuation=True,
    )
    
    streaming_config = speech.StreamingRecognitionConfig(config=config, interim_results=True)
    blocksize = int(SAMPLE_RATE / BLOCKS_PER_SECOND)
    
    with sd.InputStream(samplerate=SAMPLE_RATE, channels=CHANNELS, dtype="float32",
                        blocksize=blocksize, callback=_audio_callback):
        requests = _request_generator()
        responses = client.streaming_recognize(streaming_config, requests)
        try:
            silence_counter = 0
            max_silence = 15  # Stop after 3 seconds of silence (15 * 200ms)
            
            for resp in responses:
                # Check if we should stop externally
                if stop_event and stop_event.is_set():
                    break
                    
                for result in resp.results:
                    if not result.alternatives:
                        continue
                        
                    alt = result.alternatives[0]
                    txt = clean_text(alt.transcript)
                    
                    if result.is_final:
                        committed_text = (committed_text + " " + txt).strip()
                        one_line_preview("💬 " + committed_text)
                        silence_counter = 0  # Reset silence counter when speech is detected
                    else:
                        preview = f"💭 {committed_text} {txt}" if committed_text else f"💭 {txt}"
                        one_line_preview(preview)
                
                # Check for silence timeout
                silence_counter += 1
                if silence_counter > max_silence and committed_text:
                    print("\n⏹️  Auto-stop (silence detected)")
                    break
                    
        except KeyboardInterrupt:
            print("\n⏹️  Recording stopped by user")
        except Exception as e:
            print(f"\n❌ Recognition error: {e}")
        finally:
            audio_q.put(None)
    
    print("\n✅ Transcript complete")
    return committed_text