import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlayerService } from './player-service';
import { PlayerEngineService } from './player-engine-service';

const BAND_COUNT = 10;

@Injectable({ providedIn: 'root' })
export class EqualizerService {
  private readonly player = inject(PlayerService);
  private readonly engine = inject(PlayerEngineService);

  private readonly isPlaying = toSignal(this.player.isPlaying$, { initialValue: false });
  private readonly levels = signal<number[]>(Array(BAND_COUNT).fill(0));
  private analyser: AnalyserNode | null = null;
  private analyserData: Uint8Array<ArrayBuffer> | null = null;
  private rafId: number | null = null;

  readonly bands = computed(() => this.levels());

  constructor() {
    effect(() => {
      const playing = this.isPlaying();
      if (playing) {
        this.start();
      } else {
        this.stopWithDecay();
      }
    });
  }

  private start(): void {
    if (this.rafId) {
      return;
    }

    try {
      this.analyser = this.engine.getAnalyser();
    } catch (error) {
      // If the browser blocks AudioContext or media source setup, fall back to synthetic values.
      this.analyser = null;
    }

    if (!this.analyser) {
      this.levels.set(Array(BAND_COUNT).fill(0));
      return;
    }

    this.analyserData = new Uint8Array(this.analyser.frequencyBinCount);
    this.rafId = requestAnimationFrame(() => this.updateFromAnalyser());
  }

  private stopWithDecay(): void {
    this.stop();
    // Smoothly decay to zero
    this.levels.update((current) => current.map((v) => Math.max(0, v * 0.6 - 0.05)));
    if (this.levels().some((v) => v > 0.02)) {
      setTimeout(() => this.stopWithDecay(), 120);
    } else {
      this.levels.set(Array(BAND_COUNT).fill(0));
    }
  }

  private stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private updateFromAnalyser(): void {
    if (!this.analyser || !this.analyserData) {
      this.levels.set(Array(BAND_COUNT).fill(0));
      return;
    }

    this.analyser.getByteFrequencyData(this.analyserData);
    const bands = this.computeBands(this.analyserData);
    const total = bands.reduce((sum, v) => sum + v, 0);
    if (total < 0.001) {
      // Analyzer blocked (CORS) or muted; hold at zero.
      this.levels.set(Array(BAND_COUNT).fill(0));
    } else {
      this.levels.update((current) =>
        current.map((value, index) => {
          const target = bands[index] ?? 0;
          return Math.min(1, Math.max(0, value * 0.55 + target * 0.45));
        }),
      );
    }

    this.rafId = requestAnimationFrame(() => this.updateFromAnalyser());
  }

  private computeBands(data: Uint8Array): number[] {
    const binsPerBand = Math.max(1, Math.floor(data.length / BAND_COUNT));
    const bands: number[] = [];
    for (let i = 0; i < BAND_COUNT; i += 1) {
      const start = i * binsPerBand;
      const end = Math.min(data.length, start + binsPerBand);
      let sum = 0;
      for (let j = start; j < end; j += 1) {
        sum += data[j] ?? 0;
      }
      const avg = sum / (end - start || 1);
      bands.push(Math.pow(avg / 255, 0.9)); // slight emphasis on higher values
    }
    return bands;
  }
}
