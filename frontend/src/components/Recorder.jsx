
import { useRef, useState } from "react";
import { GoogleGenAI, Modality } from "@google/genai";
import { Mic, Square, LoaderCircle, AudioLines } from "lucide-react";

const TOKEN_URL = `${import.meta.env.VITE_API_URL}/live-token/`;
const MODEL = "gemini-3.5-transcribe-live";

function downsampleTo16k(input, inputRate) {
  if (inputRate === 16000) return input;

  const ratio = inputRate / 16000;
  const outputLength = Math.floor(input.length / ratio);
  const output = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(Math.floor((i + 1) * ratio), input.length);

    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];

    output[i] = end > start ? sum / (end - start) : 0;
  }

  return output;
}

function floatToBase64(samples) {
  const pcm = new Int16Array(samples.length);

  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    pcm[i] = sample < 0 ? sample * 32768 : sample * 32767;
  }

  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";

  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
}

export default function Recorder({ onTranscript }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");

  const sessionRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);
  const transcriptRef = useRef("");
  const interimRef = useRef("");

  function handleTranscriptMessage(message) {
    const content = message.serverContent;

    if (!content) return;

    if (content.inputTranscription?.text) {
      transcriptRef.current += content.inputTranscription.text;
      interimRef.current = "";
    }

    if (content.interimInputTranscription?.text) {
      interimRef.current = content.interimInputTranscription.text;
    }

    const combined = [
      transcriptRef.current.trim(),
      interimRef.current.trim(),
    ]
      .filter(Boolean)
      .join(" ");

    setPreview(combined);
    onTranscript(combined);
  }

  async function startRecording() {
    setError("");
    setPreview("");
    transcriptRef.current = "";
    interimRef.current = "";
    onTranscript("");
    setStatus("connecting");

    try {
      const tokenResponse = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!tokenResponse.ok) {
        throw new Error("Could not obtain a Gemini Live token from Django.");
      }

      const { token } = await tokenResponse.json();

      if (!token) throw new Error("The backend did not return a token.");

      const ai = new GoogleGenAI({
        apiKey: token,
        httpOptions: { apiVersion: "v1beta" },
      });

      const session = await ai.live.connect({
        model: MODEL,
        config: {
          responseModalities: [Modality.TEXT],
          inputAudioTranscription: {
            languageCodes: [],
          },
        },
        callbacks: {
          onopen: () => setStatus("recording"),
          onmessage: handleTranscriptMessage,
          onerror: (event) => {
            setError(event?.message || "Gemini Live connection failed.");
            setStatus("error");
          },
          onclose: () => {
            if (sessionRef.current) setStatus("idle");
          },
        },
      });

      sessionRef.current = session;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      await audioContext.resume();

      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (event) => {
        const activeSession = sessionRef.current;

        if (!activeSession || audioContext.state !== "running") return;

        const input = event.inputBuffer.getChannelData(0);
        const samples = downsampleTo16k(
          new Float32Array(input),
          audioContext.sampleRate
        );

        if (samples.length === 0) return;

        activeSession.sendRealtimeInput({
          audio: {
            data: floatToBase64(samples),
            mimeType: "audio/pcm;rate=16000",
          },
        });
      };

      source.connect(processor);

      // Keep the processing node active without playing microphone audio.
      const silentGain = audioContext.createGain();
      silentGain.gain.value = 0;

      processor.connect(silentGain);
      silentGain.connect(audioContext.destination);

      setStatus("recording");
    } catch (err) {
      await cleanup();
      setStatus("error");
      setError(err.message || "Could not start microphone recording.");
    }
  }

  async function cleanup() {
    if (processorRef.current) {
      processorRef.current.onaudioprocess = null;
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    sourceRef.current?.disconnect();
    sourceRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    sessionRef.current?.close();
    sessionRef.current = null;
  }

  async function stopRecording() {
    setStatus("stopping");
    await cleanup();
    setStatus("idle");
  }

  return (
    <div className="recorder-controls">
      <div className={`mic-circle ${status === "recording" ? "recording" : ""}`}>
        <AudioLines size={28} />
      </div>

      <strong>
        {status === "recording"
          ? "Listening to your speech..."
          : status === "connecting"
            ? "Connecting to Gemini..."
            : status === "stopping"
              ? "Stopping recording..."
              : "Ready to transcribe"}
      </strong>

      <p>
        Speak naturally. Automatic language detection is enabled for
        multilingual speech.
      </p>

      <div className="recording-buttons">
        {status === "recording" ? (
          <button
            type="button"
            className="primary-button"
            onClick={stopRecording}
          >
            <Square size={16} />
            Stop recording
          </button>
        ) : (
          <button
            type="button"
            className="primary-button"
            onClick={startRecording}
            disabled={status === "connecting" || status === "stopping"}
          >
            {status === "connecting" || status === "stopping" ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Mic size={17} />
            )}
            {status === "connecting"
              ? "Connecting..."
              : status === "stopping"
                ? "Stopping..."
                : "Start recording"}
          </button>
        )}
      </div>

      <div className="recording-status" aria-live="polite">
        <span
          className={
            status === "recording" ? "status-indicator active" : "status-indicator"
          }
        />
        {status === "recording"
          ? "Microphone active"
          : status === "error"
            ? "Recording error"
            : "Microphone inactive"}
      </div>

      {error && (
        <p className="message error-message" role="alert">
          {error}
        </p>
      )}

      {preview && (
        <div className="live-preview">
          <span>LIVE TRANSCRIPT</span>
          <p>{preview}</p>
        </div>
      )}
    </div>
  );
}
