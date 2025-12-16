import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { finalize, map, shareReplay, startWith, Subject, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import type { HandlersFolderDTO } from '../../../core/api/generated/api-types';
import { Panel } from '../../../ui/panel/panel';
import { FoldersApi } from '../../../core/api/folders.api';
import { IconButton } from '../../../ui/icon-button/icon-button';

type FolderRow = {
  readonly id: string;
  readonly folderId: number | null;
  readonly path: string;
  readonly availability: string;
  readonly lastScanStatus: string;
  readonly lastScanAt: string;
};

@Component({
  selector: 'app-settings-page',
  imports: [CommonModule, Panel, IconButton],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly foldersApi = inject(FoldersApi);
  private readonly refreshFolders$ = new Subject<void>();
  private readonly deletingIds = signal<Set<string>>(new Set());

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
        this.refreshFolders$.next();
      });
  }
}
