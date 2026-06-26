"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: { transcript: string };
}

interface SpeechRecognitionResultList {
  readonly length: number;
  readonly [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error?: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

export type SpeechErrorKey =
  | "student.chat.speechNotSupported"
  | "student.chat.speechMicDenied"
  | "student.chat.speechCaptureFailed";

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speechLang(locale: Locale): string {
  if (locale === "ar") return "ar-SA";
  if (locale === "hi") return "hi-IN";
  return "en-US";
}

export function useSpeechRecognition(locale: Locale = "en") {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [errorKey, setErrorKey] = useState<SpeechErrorKey | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    setIsSupported(!!getSpeechRecognition());
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const start = useCallback(
    (onTranscript: (text: string, isFinal: boolean) => void) => {
      const Ctor = getSpeechRecognition();
      if (!Ctor) {
        setErrorKey("student.chat.speechNotSupported");
        return;
      }

      setErrorKey(null);
      const recognition = new Ctor();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = speechLang(locale);

      recognition.onresult = (event) => {
        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) final += transcript;
          else interim += transcript;
        }
        if (final) onTranscript(final.trim(), true);
        else if (interim) onTranscript(interim.trim(), false);
      };

      recognition.onerror = (event) => {
        const code = (event as Event & { error?: string }).error;
        if (code !== "aborted") {
          setErrorKey(
            code === "not-allowed"
              ? "student.chat.speechMicDenied"
              : "student.chat.speechCaptureFailed"
          );
        }
        setIsListening(false);
      };

      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    },
    [locale]
  );

  const toggle = useCallback(
    (onTranscript: (text: string, isFinal: boolean) => void) => {
      if (isListening) stop();
      else start(onTranscript);
    },
    [isListening, start, stop]
  );

  return { isListening, isSupported, errorKey, toggle, stop };
}
