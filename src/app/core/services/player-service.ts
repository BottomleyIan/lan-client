import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map } from 'rxjs';

export type RepeatMode = 'off' | 'one' | 'all';

export type PlayerServiceTrack = {
  id: string;
  title: string;
  artist?: string;
  durationMs?: number;
  genre?: string;
  year?: string;
  imageUrl?: string;
};

export interface PlayerState {
  queue: PlayerServiceTrack[];
  currentIndex: number; // -1 when nothing selected
  isPlaying: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  volume: number; // 0 to 1
}

const initialState: PlayerState = {
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  repeat: 'off',
  shuffle: false,
  volume: 0.7,
};

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly stateSubject = new BehaviorSubject<PlayerState>(initialState);
  readonly state$ = this.stateSubject.asObservable();

  // Derived streams (use these in components)
  readonly queue$ = this.state$.pipe(map((s) => s.queue));
  readonly currentIndex$ = this.state$.pipe(
    map((s) => s.currentIndex),
    distinctUntilChanged(),
  );
  readonly isPlaying$ = this.state$.pipe(
    map((s) => s.isPlaying),
    distinctUntilChanged(),
  );
  readonly volume$ = this.state$.pipe(
    map((s) => s.volume),
    distinctUntilChanged(),
  );

  readonly currentTrack$ = this.state$.pipe(
    map((s) => (s.currentIndex >= 0 ? (s.queue[s.currentIndex] ?? null) : null)),
    distinctUntilChanged((a, b) => a?.id === b?.id),
  );

  // Synchronous snapshot helper for command handlers
  private get snapshot(): PlayerState {
    return this.stateSubject.value;
  }

  private setState(patch: Partial<PlayerState>): void {
    this.stateSubject.next({ ...this.snapshot, ...patch });
  }

  /** Add a track to the end of the queue. If nothing is playing, start it. */
  enqueue(track: PlayerServiceTrack): void {
    const s = this.snapshot;
    const newQueue = [...s.queue, track];

    // If queue was empty (or nothing selected), start playing the newly enqueued track
    if (s.queue.length === 0 || s.currentIndex === -1) {
      this.stateSubject.next({
        ...s,
        queue: newQueue,
        currentIndex: 0,
        isPlaying: true,
      });
      return;
    }

    this.setState({ queue: newQueue });
  }

  /** Optionally: enqueue many */
  enqueueMany(tracks: PlayerServiceTrack[]): void {
    tracks.forEach((t) => this.enqueue(t));
  }

  play(): void {
    const s = this.snapshot;
    if (s.queue.length === 0) return;
    if (s.currentIndex === -1) this.setState({ currentIndex: 0 });
    this.setState({ isPlaying: true });
  }

  pause(): void {
    this.setState({ isPlaying: false });
  }

  playAt(index: number): void {
    const s = this.snapshot;
    if (index < 0 || index >= s.queue.length) return;
    this.setState({ currentIndex: index, isPlaying: true });
  }

  next(): void {
    const s = this.snapshot;
    if (s.queue.length === 0) return;

    const atEnd = s.currentIndex >= s.queue.length - 1;
    if (atEnd) {
      if (s.repeat === 'all') this.setState({ currentIndex: 0, isPlaying: true });
      else this.setState({ isPlaying: false }); // stop
      return;
    }
    this.setState({ currentIndex: s.currentIndex + 1, isPlaying: true });
  }

  previous(): void {
    const s = this.snapshot;
    if (s.queue.length === 0) return;
    const prev = Math.max(0, s.currentIndex - 1);
    this.setState({ currentIndex: prev, isPlaying: true });
  }

  clearQueue(): void {
    this.stateSubject.next(initialState);
  }

  setVolume(volume: number): void {
    const clamped = Math.min(1, Math.max(0, volume));
    this.setState({ volume: clamped });
  }

  volumeUp(step = 0.1): void {
    this.setVolume(this.snapshot.volume + step);
  }

  volumeDown(step = 0.1): void {
    this.setVolume(this.snapshot.volume - step);
  }
}
