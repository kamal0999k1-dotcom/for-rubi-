// A single AudioContext is reused for performance.
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // The AudioContext may be in a suspended state in some browsers until a user gesture.
  // We'll try to resume it here.
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
};

/**
 * Plays a pleasant, celebratory melody for correct answers.
 */
export const playCorrectSound = () => {
  try {
    const context = getAudioContext();
    const now = context.currentTime;

    // A master gain node to control the overall volume and fade out
    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    masterGain.gain.setValueAtTime(0.3, now); // Softer volume
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6); // Fade out over the melody's duration

    const playNote = (frequency: number, startTime: number, duration: number) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'sine'; // Soft tone
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.connect(masterGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // A happy, slightly faster and gentler arpeggio (C-E-G-C)
    const noteDuration = 0.09;
    const startTime = now + 0.05; // Add a tiny delay to ensure everything is set up
    playNote(523.25, startTime, noteDuration);                         // C5
    playNote(659.25, startTime + noteDuration, noteDuration);          // E5
    playNote(783.99, startTime + 2 * noteDuration, noteDuration);      // G5
    playNote(1046.50, startTime + 3 * noteDuration, noteDuration * 1.5); // C6 (held longer)

  } catch (error) {
    console.error("Could not play correct sound:", error);
  }
};

/**
 * Plays a gentle, non-discouraging sound for incorrect answers.
 */
export const playWrongSound = () => {
    try {
      const context = getAudioContext();
      const now = context.currentTime;
      const duration = 0.4;

      const masterGain = context.createGain();
      masterGain.connect(context.destination);
      masterGain.gain.setValueAtTime(0.3, now); // Gentle volume
      masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      const playNote = (frequency: number, startTime: number, noteDuration: number) => {
          const oscillator = context.createOscillator();
          oscillator.type = 'sine'; // A soft, gentle tone
          oscillator.frequency.setValueAtTime(frequency, startTime);
          oscillator.connect(masterGain);
          oscillator.start(startTime);
          oscillator.stop(startTime + noteDuration);
      }
      
      // A soft, descending two-note sound ("buh-dump")
      playNote(261.63, now + 0.05, 0.1); // C4
      playNote(220.00, now + 0.15, 0.15); // A3

    } catch (error) {
      console.error("Could not play wrong sound:", error);
    }
  };

/**
 * Plays a bright, quick sound for learning a single word.
 */
export const playWordLearnedSound = () => {
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const duration = 0.3;

    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const playNote = (frequency: number, startTime: number, noteDuration: number) => {
      const oscillator = context.createOscillator();
      oscillator.type = 'triangle'; // A slightly brighter tone than sine
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.connect(masterGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + noteDuration);
    };

    // A quick, bright two-note chime (G5 -> C6)
    playNote(783.99, now + 0.05, 0.1); // G5
    playNote(1046.50, now + 0.15, 0.1); // C6
  } catch (error) {
    console.error("Could not play word learned sound:", error);
  }
};

/**
 * Plays a triumphant melody for completing a level or rhyme.
 */
export const playLevelCompleteSound = () => {
  try {
    const context = getAudioContext();
    const now = context.currentTime;

    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    masterGain.gain.setValueAtTime(0.4, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    const playNote = (frequency: number, startTime: number, duration: number, type: OscillatorType = 'triangle') => {
      const oscillator = context.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, startTime);
      oscillator.connect(masterGain);
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // A triumphant, ascending melody with a final chord
    const noteDuration = 0.12;
    const startTime = now + 0.05;
    playNote(523.25, startTime, noteDuration);                         // C5
    playNote(659.25, startTime + noteDuration, noteDuration);          // E5
    playNote(783.99, startTime + 2 * noteDuration, noteDuration);      // G5
    playNote(1046.50, startTime + 3 * noteDuration, noteDuration * 2); // C6

    // Final chord
    playNote(1046.50, startTime + 5 * noteDuration, noteDuration * 3); // C6
    playNote(1318.51, startTime + 5 * noteDuration, noteDuration * 3); // E6
    playNote(1567.98, startTime + 5 * noteDuration, noteDuration * 3); // G6
  } catch (error) {
    console.error("Could not play level complete sound:", error);
  }
};

/**
 * Plays a subtle, soft "pop" or "bubble" sound for a new round.
 */
export const playNewRoundSound = () => {
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const duration = 0.2;

    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    masterGain.gain.setValueAtTime(0.2, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now); // A5
    oscillator.frequency.exponentialRampToValueAtTime(440, now + duration); // Slide down to A4
    oscillator.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (error) {
    console.error("Could not play new round sound:", error);
  }
};

/**
 * Plays a soft, subtle "whoosh" or "slide" sound for navigating back.
 */
export const playNavigationBackSound = () => {
  try {
    const context = getAudioContext();
    const now = context.currentTime;
    const duration = 0.3;

    const masterGain = context.createGain();
    masterGain.connect(context.destination);
    masterGain.gain.setValueAtTime(0.2, now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    const oscillator = context.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(220, now); // A3
    oscillator.frequency.exponentialRampToValueAtTime(110, now + duration); // Slide down to A2
    oscillator.connect(masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration);
  } catch (error) {
    console.error("Could not play back navigation sound:", error);
  }
};
