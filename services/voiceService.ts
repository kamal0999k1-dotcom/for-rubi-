
import { GoogleGenAI, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const initializeVoices = async () => {
  // No-op for Gemini TTS
  return Promise.resolve();
};

let currentAudio: HTMLAudioElement | null = null;

export const stopSpeaking = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  window.speechSynthesis.cancel();
};

const fallbackToBrowserTTS = (text: string, onEnd?: () => void) => {
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.2;
    utterance.rate = 1.0;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
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
              prebuiltVoiceConfig: { voiceName: 'Puck' }, // 'Puck' is sweet, youthful and different from 'Kore'
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
    const audio = new Audio();
    
    // Use a promise to handle loading errors
    const playPromise = new Promise<void>((resolve, reject) => {
      audio.oncanplaythrough = () => {
        audio.play().then(resolve).catch(reject);
      };
      audio.onerror = () => reject(new Error("Audio source failed to load"));
      audio.src = audioSrc;
    });

    currentAudio = audio;
    
    if (onEnd) {
      audio.onended = () => {
        currentAudio = null;
        onEnd();
      };
    }

    await playPromise;
    
  } catch (error) {
    // Log quota errors more gracefully
    if (error instanceof Error && error.message.includes("429")) {
      console.warn("Gemini TTS Quota Exceeded. Falling back to browser voice.");
    } else {
      console.error("Gemini TTS Error:", error);
    }
    
    // Fallback to browser TTS if Gemini fails (e.g., Quota Exceeded)
    fallbackToBrowserTTS(text, onEnd);
  }
};
