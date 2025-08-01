import { useState, useRef, useEffect } from "react";
import AudioUploader from "./components/AudioUploader";
import TranscriptionResult from "./components/TranscriptionResult";
import Loader from "./components/Loader";
import Notification from "./components/Notification";
import "./App.css";

export default function App() {
  useEffect(() => {
    document.title = "Audio Transcriber";
  });

  // State for multiple transcripts: array of objects {file, transcript}
  const [transcripts, setTranscripts] = useState<
    Array<{ file: string; transcript: string }>
  >([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [audioNames, setAudioNames] = useState<string[]>([]);

  // New states for recording
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  // Handle multiple files upload (existing)
  const handleUpload = async (audioFiles: FileList | File[]) => {
    setLoading(true);
    setError("");
    setTranscripts([]);
    setAudioNames(Array.from(audioFiles).map((file) => file.name));

    try {
      const formData = new FormData();
      Array.from(audioFiles).forEach((file) => {
        formData.append("audio", file);
      });

      // REMINDER: Change your URL to use relative path in production!
      const response = await fetch("https://speech-to-text-backend-k4ar.onrender.com/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error!");
      const data = await response.json();

      if (data.status === "success" && Array.isArray(data.data)) {
        setTranscripts(data.data); // Array of { file, transcript }
      } else {
        setError("No transcription received");
      }
    } catch (err) {
      setError("Failed to transcribe audio. Please try again." + err);
    }
    setLoading(false);
  };

  const handleReset = () => {
    setTranscripts([]);
    setError("");
    setAudioNames([]);
  };

  // ------ New: recording handling ------

  // Start recording audio from microphone
  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError("Browser does not support audio recording.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, {
          type: "audio/webm",
        });
        const file = new File([blob], `recording_${Date.now()}.webm`, {
          type: "audio/webm",
        });

        // Send the recorded file to your existing upload handler
        handleUpload([file]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError("Could not start recording: " + (err as Error).message);
    }
  };

  // Stop the recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ------------------------------------

  return (
    <div className="app-container">
      <div className="left-panel card">
        <h1 className="title">Speech to Text Transcription</h1>
        <AudioUploader onUpload={handleUpload} />

        {/* Record Audio Button */}
        {!isRecording ? (
          <button
            className="record-btn"
            onClick={startRecording}
            style={{
              marginTop: "1rem",
              backgroundColor: "var(--primary-orange)",
              color: "white",
              width: "100%",
              padding: "0.75rem",
              fontWeight: "600",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Start recording audio"
          >
            Start Recording
          </button>
        ) : (
          <button
            className="record-btn stop"
            onClick={stopRecording}
            style={{
              marginTop: "1rem",
              backgroundColor: "#cc0000",
              color: "white",
              width: "100%",
              padding: "0.75rem",
              fontWeight: "600",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
            }}
            aria-label="Stop recording audio"
          >
            Stop Recording
          </button>
        )}

        {audioNames.length > 0 && (
          <div className="audio-file-info">
            <span>Uploaded files: {audioNames.join(", ")}</span>
            <button
              className="reset-btn"
              onClick={handleReset}
              aria-label="Remove uploaded audio"
            >
              ✕
            </button>
          </div>
        )}

        {loading && <Loader />}

        {error && <Notification type="error" message={error} />}
      </div>

      <div className="right-panel">
        {transcripts.length > 0 && !loading ? (
          transcripts.map(({ file, transcript }) => (
            <div key={file} style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ color: "#ff7800", marginBottom: "0.5rem" }}>
                {file}
              </h3>
              <TranscriptionResult text={transcript} />
            </div>
          ))
        ) : (
          <p className="placeholder-text">Transcription will appear here</p>
        )}
      </div>

      <footer className="footer">
        &copy; {new Date().getFullYear()} Speech to Text App
      </footer>
    </div>
  );
}
