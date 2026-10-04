export const speakInHindi = (text: string, onEnd?: () => void) => {
  if (!('speechSynthesis' in window)) {
    alert('आपके ब्राउज़र में आवाज़ (Speech) की सुविधा उपलब्ध नहीं है।');
    return;
  }

  // Cancel any active speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'hi-IN';
  utterance.rate = 0.95; // Slightly measured pace for clarity
  utterance.pitch = 1.0;

  // Attempt to select Hindi voice if available
  const voices = window.speechSynthesis.getVoices();
  const hindiVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('HI'));
  if (hindiVoice) {
    utterance.voice = hindiVoice;
  }

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
