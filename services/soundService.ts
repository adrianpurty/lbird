/**
 * LeadBid Pro - Tactical UI Sound Engine
 * Synthesizes real-time electronic transients using Web Audio API.
 */

class SoundService {
  private audioCtx: AudioContext | null = null;

  private init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Generates a short electronic blip.
   * @param type Waveform type
   * @param freq Base frequency
   */
  public playClick(isButton: boolean = false) {
    try {
      this.init();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Randomize frequency slightly for "different" sounds every time
      // Buttons get a higher, sharper chirp
      const baseFreq = isButton ? 880 : 440;
      const freqVar = Math.random() * 400;
      osc.frequency.setValueAtTime(baseFreq + freqVar, now);
      
      // Sweep frequency down for a "tactile" feel
      osc.frequency.exponentialRampToValueAtTime((baseFreq + freqVar) * 0.5, now + 0.1);

      // Randomize waveform for variety
      const types: OscillatorType[] = ['sine', 'triangle', 'square'];
      osc.type = isButton ? 'triangle' : types[Math.floor(Math.random() * 2)];

      // Volume Envelope (Quick attack, exponential decay)
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(isButton ? 0.08 : 0.04, now + 0.002);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      // Silent fail if audio is blocked or unsupported
      console.debug('Audio Node Suppressed');
    }
  }
}

export const soundService = new SoundService();