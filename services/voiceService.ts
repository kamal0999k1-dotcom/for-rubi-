
let selectedVoice: SpeechSynthesisVoice | null = null;
let voicesLoadedPromise: Promise<void> | null = null;

const loadVoices = (): Promise<void> => {
  return new Promise((resolve) => {
    const checkVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prefer female voices
        selectedVoice = 
          voices.find(voice => voice.lang.startsWith('en') && (voice.name.includes('Female') || voice.name.includes('Google') || voice.name.includes('Samantha') || voice.name.includes('Zoe'))) ||
          voices.find(voice => voice.lang.startsWith('en')) ||
          voices[0];
        resolve();
        return true;
      }
      return false;
    };

    if (!checkVoices()) {
      window.speechSynthesis.onvoiceschanged = () => {
        checkVoices();
      };
    }
  });
};

export const initializeVoices = () => {
  if (!voicesLoadedPromise) {
    voicesLoadedPromise = loadVoices();
  }
  return voicesLoadedPromise;
};

export const speak = async (text: string, onEnd?: () => void) => {
  if (!voicesLoadedPromise) {
    await initializeVoices();
  } else {
    await voicesLoadedPromise;
  }
  
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }
  utterance.pitch = 1.2; // Higher pitch for a "girly" sound
  utterance.rate = 1.0; // Standard speed
  utterance.volume = 1;

  if (onEnd) {
    utterance.onend = onEnd;
  }
  
  window.speechSynthesis.speak(utterance);
};
