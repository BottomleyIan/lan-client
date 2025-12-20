import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-slider',
  template: `
    <div class="flex w-full items-center">
      <input
        type="range"
        class="bg-tokyo-surface-0 focus-visible:ring-tokyo-accent-cyan/70 h-2 w-full cursor-pointer appearance-none border-none focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed"
        [class.tokyo-glow-cyan]="isDragging()"
        [class.opacity-60]="disabled()"
        [min]="min()"
        [max]="max()"
        [step]="step()"
        [value]="value()"
        [disabled]="disabled()"
        [attr.aria-label]="label()"
        [attr.aria-valuemin]="min()"
        [attr.aria-valuemax]="max()"
        [attr.aria-valuenow]="value()"
        [style.accent-color]="accentColor()"
        (input)="handleInput($event)"
        (pointerdown)="startDrag()"
        (pointerup)="endDrag()"
        (pointercancel)="endDrag()"
        (keydown)="startDrag()"
        (keyup)="endDrag()"
        (blur)="endDrag()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Slider {
  readonly value = input<number>(0);
  readonly min = input<number>(0);
  readonly max = input<number>(100);
  readonly step = input<number>(1);
  readonly label = input<string>('Slider');
  readonly disabled = input(false);
  readonly valueChange = output<number>();

  protected readonly isDragging = signal(false);
  protected readonly accentColor = computed(() => 'var(--color-tokyo-accent-cyan)');

  protected handleInput(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    if (!target) {
      return;
    }
    const next = Number(target.value);
    if (Number.isNaN(next)) {
      return;
    }
    this.valueChange.emit(next);
  }

  protected startDrag(): void {
    this.isDragging.set(true);
  }

  protected endDrag(): void {
    this.isDragging.set(false);
  }
}
