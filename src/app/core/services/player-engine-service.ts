import { Injectable, DestroyRef, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { PlayerService } from './player-service';
import { trackUrl } from '../api/track-url';

@Injectable({ providedIn: 'root' })
export class PlayerEngineService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly player = inject(PlayerService);
  private readonly audio = new Audio();
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;

  constructor() {
    this.audio.crossOrigin = 'anonymous';
    // When track or play state changes, apply to audio
    combineLatest([this.player.currentTrack$, this.player.isPlaying$, this.player.volume$])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([track, isPlaying, volume]) => {
        if (!track) {
          this.audio.pause();
          this.audio.src = '';
          this.player.updatePositionFromEngine(0);
          return;
        }

        const url = trackUrl(track.id);
        if (this.audio.src !== url) {
          this.audio.src = url;
          this.audio.load();
        }

        this.audio.volume = volume;
        if (isPlaying) void this.audio.play();
        else this.audio.pause();
      });

    // When track ends, go next
    this.audio.addEventListener('ended', () => this.player.next());
    this.audio.addEventListener('timeupdate', () => {
      const positionMs = Math.floor(this.audio.currentTime * 1000);
      this.player.updatePositionFromEngine(positionMs);
    });
    this.audio.addEventListener('loadedmetadata', () => {
      this.player.updatePositionFromEngine(Math.floor(this.audio.currentTime * 1000));
    });

    this.player.seek$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((positionMs) => {
      this.audio.currentTime = positionMs / 1000;
    });
  }

  getAnalyser(): AnalyserNode | null {
    if (typeof AudioContext === 'undefined') {
      return null;
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (!this.sourceNode) {
      this.sourceNode = this.audioContext.createMediaElementSource(this.audio);
    }

    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.7;
      this.sourceNode.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
    }

    if (this.audioContext.state === 'suspended') {
      void this.audioContext.resume();
    }

    return this.analyser;
  }
}
