import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize, map, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import type { HandlersFolderDTO } from '../../../core/api/generated/api-types';
import { Panel } from '../../../ui/panel/panel';
import { FoldersApi } from '../../../core/api/folders.api';
import { TableDirective } from '../../../ui/directives/table';
import { TableHeadDirective } from '../../../ui/directives/thead';
import { AddFolderForm } from '../add-folder-form/add-folder-form';
import { IconButtonDanger } from '../../../ui/icon-button/icon-button-danger';
import { IconButtonPrimary } from '../../../ui/icon-button/icon-button-primary';
import { SettingsList } from '../settings-list/settings-list';

type FolderRow = {
  readonly id: string;
  readonly folderId: number | null;
  readonly path: string;
  readonly availability: string;
  readonly lastScanStatus: string;
  readonly lastScanAt: string;
};

type ColorSample = {
  readonly name: string;
  readonly cssVar: string;
};

const COLOR_SAMPLES: readonly ColorSample[] = [
  { name: 'Surface 0', cssVar: 'var(--color-tokyo-surface-0)' },
  { name: 'Surface 1', cssVar: 'var(--color-tokyo-surface-1)' },
  { name: 'Surface 2', cssVar: 'var(--color-tokyo-surface-2)' },
  { name: 'Surface 3', cssVar: 'var(--color-tokyo-surface-3)' },
  { name: 'Border', cssVar: 'var(--color-tokyo-border)' },
  { name: 'Text', cssVar: 'var(--color-tokyo-text)' },
  { name: 'Text Muted', cssVar: 'var(--color-tokyo-text-muted)' },
  { name: 'Text Subtle', cssVar: 'var(--color-tokyo-text-subtle)' },
  { name: 'Accent Purple', cssVar: 'var(--color-tokyo-accent-purple)' },
  { name: 'Accent Blue', cssVar: 'var(--color-tokyo-accent-blue)' },
  { name: 'Accent Cyan', cssVar: 'var(--color-tokyo-accent-cyan)' },
  { name: 'Accent Green', cssVar: 'var(--color-tokyo-accent-green)' },
  { name: 'Accent Orange', cssVar: 'var(--color-tokyo-accent-orange)' },
  { name: 'Accent Red', cssVar: 'var(--color-tokyo-accent-red)' },
  { name: 'Accent Yellow', cssVar: 'var(--color-tokyo-accent-yellow)' },
  { name: 'Accent Pink', cssVar: 'var(--color-tokyo-accent-pink)' },
];

@Component({
  selector: 'app-settings-page',
  imports: [
    CommonModule,
    Panel,
    IconButtonDanger,
    IconButtonPrimary,
    TableDirective,
    TableHeadDirective,
    AddFolderForm,
    SettingsList,
  ],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly foldersApi = inject(FoldersApi);
  private readonly refreshFolders$ = new Subject<void>();
  private readonly deletingIds = signal<Set<string>>(new Set());
  private readonly scanningIds = signal<Set<string>>(new Set());

  protected readonly folders$: Observable<FolderRow[]> = this.refreshFolders$.pipe(
    startWith(void 0),
    switchMap(() => this.foldersApi.getFolders()),
    map((folders) => folders.map((folder, index) => this.mapFolder(folder, index))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private mapFolder(folder: HandlersFolderDTO, index: number): FolderRow {
    return {
      id: String(folder.id ?? folder.path ?? `folder-${index}`),
      folderId: folder.id ?? null,
      path: folder.path ?? 'Unknown path',
      availability: folder.available === false ? 'Unavailable' : 'Available',
      lastScanStatus: folder.last_scan_status ?? '—',
      lastScanAt: folder.last_scan_at ?? 'Never',
    };
  }

  protected isDeleting(id: string): boolean {
    return this.deletingIds().has(id);
  }

  protected isScanning(id: string): boolean {
    return this.scanningIds().has(id);
  }

  protected deleteFolder(folder: FolderRow): void {
    if (folder.folderId === null) {
      return;
    }

    const nextIds = new Set(this.deletingIds());
    nextIds.add(folder.id);
    this.deletingIds.set(nextIds);

    this.foldersApi
      .deleteFolder(folder.folderId)
      .pipe(
        finalize(() => {
          const cleared = new Set(this.deletingIds());
          cleared.delete(folder.id);
          this.deletingIds.set(cleared);
        }),
      )
      .subscribe(() => {
        this.refreshFolders();
      });
  }

  protected refreshFolders(): void {
    this.refreshFolders$.next();
  }

  protected scanFolder(folder: FolderRow): void {
    if (folder.folderId === null || this.isScanning(folder.id)) {
      return;
    }

    const nextIds = new Set(this.scanningIds());
    nextIds.add(folder.id);
    this.scanningIds.set(nextIds);

    this.foldersApi
      .scanFolder(folder.folderId)
      .pipe(
        finalize(() => {
          const cleared = new Set(this.scanningIds());
          cleared.delete(folder.id);
          this.scanningIds.set(cleared);
        }),
      )
      .subscribe(() => {
        this.refreshFolders();
      });
  }

  protected readonly colorSamples = COLOR_SAMPLES;
}
