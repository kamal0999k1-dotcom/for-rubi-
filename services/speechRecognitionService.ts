// FIX: Add type definitions for the Web Speech API and correct constructor retrieval
// to resolve TypeScript errors for browser-specific APIs that are not part of standard DOM typings.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}

const SpeechRecognition: SpeechRecognitionStatic | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
let recognition: SpeechRecognition | null = null;
let isListening = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.lang = 'en-US';
  recognition.interimResults = false;
}

export const startListening = (
  onResult: (transcript: string) => void,
  onError: (error: string) => void
) => {
  if (!recognition || isListening) {
    if(!recognition) console.error("Speech recognition not supported.");
    return;
  }

  recognition.onresult = (event: SpeechRecognitionEvent) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    isListening = false;
    onResult(transcript);
  };

  recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
    isListening = false;
    onError(event.error);
  };
  
  recognition.onend = () => {
    isListening = false;
  };

  try {
    recognition.start();
    isListening = true;
  } catch (e) {
    console.error("Could not start recognition service: ", e);
    isListening = false;
  }
};

export const stopListening = () => {
  if (recognition && isListening) {
    recognition.stop();
    isListening = false;
  }
};
