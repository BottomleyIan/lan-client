import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, interval, map } from 'rxjs';

export type RepeatMode = 'off' | 'one' | 'all';

export type PlayerServiceTrack = {
  id: string;
  title: string;
  artist?: string;
  durationMs?: number;
  genre?: string;
  year?: string;
  imageUrl?: string;
  rating: number;
};

export interface PlayerState {
  queue: PlayerServiceTrack[];
  currentIndex: number; // -1 when nothing selected
  isPlaying: boolean;
  repeat: RepeatMode;
  shuffle: boolean;
  volume: number; // 0 to 1
  positionMs: number;
}

const initialState: PlayerState = {
  queue: [],
  currentIndex: -1,
  isPlaying: false,
  repeat: 'off',
  shuffle: false,
  volume: 0.7,
  positionMs: 0,
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
  readonly shuffle$ = this.state$.pipe(
    map((s) => s.shuffle),
    distinctUntilChanged(),
  );

  readonly currentTrack$ = this.state$.pipe(
    map((s) => (s.currentIndex >= 0 ? (s.queue[s.currentIndex] ?? null) : null)),
    distinctUntilChanged(),
  );
  readonly positionMs$ = this.state$.pipe(
    map((s) => s.positionMs),
    distinctUntilChanged(),
  );

  // Synchronous snapshot helper for command handlers
  private get snapshot(): PlayerState {
    return this.stateSubject.value;
  }

  constructor() {
    interval(1000).subscribe(() => {
      const s = this.snapshot;
      if (!s.isPlaying) {
        return;
      }
      const current = s.currentIndex >= 0 ? s.queue[s.currentIndex] : null;
      const durationMs = current?.durationMs ?? 0;
      if (durationMs <= 0) {
        return;
      }
      const nextPosition = Math.min(s.positionMs + 1000, durationMs);
      this.setState({ positionMs: nextPosition });
      if (nextPosition >= durationMs) {
        this.setState({ isPlaying: false });
      }
    });
  }

  private setState(patch: Partial<PlayerState>): void {
    this.stateSubject.next({ ...this.snapshot, ...patch });
  }

  play(): void {
    const s = this.snapshot;
    if (s.queue.length === 0) return;
    if (s.currentIndex === -1) {
      const startIndex = s.shuffle ? this.nextShuffleIndex(-1, s.queue.length) : 0;
      this.setState({ currentIndex: startIndex, isPlaying: true, positionMs: 0 });
      return;
    }
    this.setState({ isPlaying: true });
  }

  pause(): void {
    this.setState({ isPlaying: false });
  }

  playAt(index: number): void {
    const s = this.snapshot;
    if (index < 0 || index >= s.queue.length) return;
    this.setState({ currentIndex: index, isPlaying: true, positionMs: 0 });
  }

  next(): void {
    const s = this.snapshot;
    if (s.queue.length === 0) return;

    if (s.shuffle) {
      const nextIndex = this.nextShuffleIndex(s.currentIndex, s.queue.length);
      if (nextIndex >= 0) {
        this.setState({ currentIndex: nextIndex, isPlaying: true, positionMs: 0 });
      }
      return;
    }

    const atEnd = s.currentIndex >= s.queue.length - 1;
    if (atEnd) {
      if (s.repeat === 'all') this.setState({ currentIndex: 0, isPlaying: true, positionMs: 0 });
      else this.setState({ isPlaying: false }); // stop
      return;
    }
    this.setState({ currentIndex: s.currentIndex + 1, isPlaying: true, positionMs: 0 });
  }

  previous(): void {
    const s = this.snapshot;
    if (s.queue.length === 0) return;
    if (s.shuffle) {
      const prevIndex = this.nextShuffleIndex(s.currentIndex, s.queue.length);
      if (prevIndex >= 0) {
        this.setState({ currentIndex: prevIndex, isPlaying: true, positionMs: 0 });
      }
      return;
    }
    const prev = Math.max(0, s.currentIndex - 1);
    this.setState({ currentIndex: prev, isPlaying: true, positionMs: 0 });
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

  toggleShuffle(): void {
    this.setState({ shuffle: !this.snapshot.shuffle });
  }

  private nextShuffleIndex(currentIndex: number, length: number): number {
    if (length <= 0) return -1;
    if (length === 1) return 0;
    if (currentIndex < 0 || currentIndex >= length) {
      return Math.floor(Math.random() * length);
    }
    let nextIndex = currentIndex;
    while (nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * length);
    }
    return nextIndex;
  }

  updateTrackInQueue(trackId: string, patch: Partial<PlayerServiceTrack>): void {
    const s = this.snapshot;
    const idx = s.queue.findIndex((t) => t.id === trackId);
    if (idx < 0) return;

    const updated = { ...s.queue[idx], ...patch };
    const newQueue = s.queue.slice();
    newQueue[idx] = updated;
    this.setState({ queue: newQueue });
  }

  stop(): void {
    this.setState({ isPlaying: false, currentIndex: -1, positionMs: 0 });
  }

  setQueue(queue: PlayerServiceTrack[], opts?: { autoplay?: boolean; startIndex?: number }): void {
    const autoplay = opts?.autoplay ?? false;

    const prev = this.snapshot;
    const prevTrackId = prev.currentIndex >= 0 ? prev.queue[prev.currentIndex]?.id : null;

    let nextIndex =
      opts?.startIndex ?? (prevTrackId ? queue.findIndex((t) => t.id === prevTrackId) : -1);

    if (nextIndex < 0) nextIndex = queue.length ? 0 : -1;
    const nextTrackId = nextIndex >= 0 ? (queue[nextIndex]?.id ?? null) : null;
    const shouldResetPosition = prevTrackId !== nextTrackId;

    this.stateSubject.next({
      ...prev,
      queue,
      currentIndex: nextIndex,
      isPlaying: autoplay ? nextIndex >= 0 : prev.isPlaying, // keep play state unless explicitly autoplay
      positionMs: shouldResetPosition ? 0 : prev.positionMs,
    });
  }

  seek(positionMs: number): void {
    const s = this.snapshot;
    const current = s.currentIndex >= 0 ? s.queue[s.currentIndex] : null;
    const durationMs = current?.durationMs ?? 0;
    const clamped = Math.min(Math.max(0, positionMs), durationMs);
    this.setState({ positionMs: clamped });
  }
}
