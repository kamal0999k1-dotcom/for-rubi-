
import { GoogleGenAI, Modality } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Falling back to browser speech.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const initializeVoices = async () => {
  // No-op for Gemini TTS
  return Promise.resolve();
};

let currentAudio: HTMLAudioElement | null = null;
const persistentAudio = new Audio();

/**
 * Unlocks audio on mobile devices. Should be called on a user gesture (click).
 */
export const unlockAudio = () => {
  // Play a silent sound to unlock the Audio element
  persistentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
  persistentAudio.play().catch(e => console.warn("Audio unlock failed:", e));
  
  // Unlock SpeechSynthesis
  if (window.speechSynthesis) {
    const utterance = new SpeechSynthesisUtterance("");
    window.speechSynthesis.speak(utterance);
    window.speechSynthesis.cancel();
  }
  
  // Unlock AudioContext if used elsewhere
  const context = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (context.state === 'suspended') {
    context.resume();
  }
};

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  persistentAudio.pause();
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

const fallbackToBrowserTTS = (text: string, onEnd?: () => void) => {
  try {
    if (!window.speechSynthesis) {
      console.error("Speech Synthesis not supported in this browser.");
      if (onEnd) onEnd();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.2;
    utterance.rate = 1.0;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = (e) => {
        console.error("SpeechSynthesisUtterance Error:", e);
        onEnd();
      };
    }
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Browser TTS Fallback Error:", e);
    if (onEnd) onEnd();
  }
};

const audioCache: Map<string, string> = new Map();

export const speak = async (text: string, onEnd?: () => void) => {
  stopSpeaking();
  
  const ai = getAIClient();
  
  if (!ai) {
    fallbackToBrowserTTS(text, onEnd);
    return;
  }
  
  try {
    let base64Audio = audioCache.get(text);
    
    if (!base64Audio) {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say cheerfully and sweetly for a 4-year-old: ${text}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Puck' },
            },
          },
        },
      });

      base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      
      if (base64Audio && base64Audio.length >= 100) {
        audioCache.set(text, base64Audio);
      }
    }
    
    if (!base64Audio || base64Audio.length < 100) {
      throw new Error("Invalid or missing audio data from Gemini TTS");
    }

    const audioSrc = `data:audio/mp3;base64,${base64Audio}`;
    
    // Use the persistent audio element for better mobile support
    persistentAudio.src = audioSrc;
    currentAudio = persistentAudio;
    
    if (onEnd) {
      persistentAudio.onended = () => {
        currentAudio = null;
        onEnd();
      };
    }

    await persistentAudio.play();
    
  } catch (error) {
    // Log quota or auth errors more gracefully
    if (error instanceof Error && (error.message.includes("429") || error.message.includes("401") || error.message.includes("403"))) {
      console.warn("Gemini TTS issue (Quota/Auth). Falling back to browser voice.");
    } else {
      console.error("Gemini TTS Error:", error);
    }
    
    // Fallback to browser TTS if Gemini fails
    fallbackToBrowserTTS(text, onEnd);
  }
};
