// Generar sonido de tambor usando Web Audio API
export const playDrumRoll = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Crear una serie de golpes de tambor
  const times = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2, 1.35, 1.5, 1.65];
  
  times.forEach((time) => {
    // Oscilador para el tono del tambor
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Frecuencia baja para simular tambor
    oscillator.frequency.setValueAtTime(80, audioContext.currentTime + time);
    oscillator.frequency.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.1);
    
    // Envelope del sonido
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + time);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + time + 0.1);
    
    oscillator.start(audioContext.currentTime + time);
    oscillator.stop(audioContext.currentTime + time + 0.1);
  });
};

export const playCymbalCrash = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Crear ruido blanco para simular platillo
  const bufferSize = audioContext.sampleRate * 0.5;
  const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
  const data = buffer.getChannelData(0);
  
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioContext.createBufferSource();
  noise.buffer = buffer;
  
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();
  
  noise.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  filter.type = 'highpass';
  filter.frequency.setValueAtTime(3000, audioContext.currentTime);
  
  gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  noise.start(audioContext.currentTime);
  noise.stop(audioContext.currentTime + 0.5);
};

export const playWinSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  
  // Secuencia ascendente de notas para victoria
  const notes = [262, 330, 392, 523]; // C, E, G, C (acorde mayor)
  
  notes.forEach((freq, index) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
    
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + index * 0.15);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.3);
    
    oscillator.start(audioContext.currentTime + index * 0.15);
    oscillator.stop(audioContext.currentTime + index * 0.15 + 0.3);
  });
};
