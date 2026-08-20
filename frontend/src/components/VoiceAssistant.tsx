"use client";

import React, { useState } from "react";
import { Mic, MicOff, Loader2, Send } from "lucide-react";
import api from "@/lib/api";

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
  prototype: SpeechRecognition;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface ExtractedItem {
  item_name: string;
  quantity?: number;
  unit?: string;
}

interface VoiceResponse {
  status: string;
  extracted_items: ExtractedItem[];
  reply: string;
}

interface VoiceAssistantProps {
  onItemsExtracted: (items: ExtractedItem[], reply: string) => void;
}

export default function VoiceAssistant({ onItemsExtracted }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [manualText, setManualText] = useState("");

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    setLoading(true);
    setFeedback(`Processing: "${text}"...`);

    try {
      const res = await api.post<VoiceResponse>("/api/v1/voice/process-voice", {
        transcript: text,
      });

      if (res.data.status === "success") {
        onItemsExtracted(res.data.extracted_items, res.data.reply);
        setFeedback(res.data.reply);
        setManualText("");
      }
    } catch (err: unknown) {
      console.error(err);
      setFeedback("Backend error: Check if FastAPI terminal is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    const SpeechRecognitionConstructor =
      (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).SpeechRecognition ||
      (window as Window & { SpeechRecognition?: SpeechRecognitionConstructor; webkitSpeechRecognition?: SpeechRecognitionConstructor }).webkitSpeechRecognition;

    if (!SpeechRecognitionConstructor) {
      setFeedback("Browser voice recognition support nahi karta. Chrome use karein ya niche type karein.");
      return;
    }

    const recognition = new SpeechRecognitionConstructor();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setFeedback("Mic active: Bolna shuru karein...");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      processTranscript(transcript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      if (event.error === "not-allowed") {
        setFeedback("Mic permission blocked hai. Browser URL bar me permission allow karein.");
      } else if (event.error === "no-speech") {
        setFeedback("Koi awaaz detect nahi hui. Dubara koshish karein.");
      } else {
        setFeedback(`Voice error: ${event.error}`);
      }
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl max-w-md mx-auto my-6 text-center">
      <h2 className="text-xl font-semibold text-white mb-2">Voice Grocery Ordering</h2>
      <p className="text-xs text-slate-400 mb-6">
        Mic dabakar bole ya niche type karein (e.g. '2 kilo aloo aur 1 bread')
      </p>

      {/* Voice Mic Button */}
      <button
        onClick={startListening}
        disabled={isListening || loading}
        className={`relative flex items-center justify-center w-20 h-20 rounded-full transition-all duration-300 ${
          isListening
            ? "bg-rose-500 shadow-lg shadow-rose-500/50 animate-pulse"
            : loading
            ? "bg-amber-500"
            : "bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30"
        }`}
      >
        {loading ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : isListening ? (
          <MicOff className="w-8 h-8 text-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </button>

      {/* Direct Text Input Fallback */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          processTranscript(manualText);
        }}
        className="flex w-full mt-6 gap-2"
      >
        <input
          type="text"
          value={manualText}
          onChange={(e) => setManualText(e.target.value)}
          placeholder="Ya yaha type karein..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
        <button
          type="submit"
          disabled={loading || !manualText}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Status / Reply Message Box */}
      {feedback && (
        <div className="mt-4 p-3 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-emerald-400 max-w-sm w-full">
          {feedback}
        </div>
      )}
    </div>
  );
}