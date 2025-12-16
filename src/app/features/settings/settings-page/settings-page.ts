import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { map, shareReplay } from 'rxjs';
import type { Observable } from 'rxjs';
import type { HandlersFolderDTO } from '../../../core/api/generated/api-types';
import { Panel } from '../../../ui/panel/panel';
import { FoldersApi } from '../../../core/api/folders.api';

type FolderRow = {
  readonly id: string;
  readonly path: string;
  readonly availability: string;
  readonly lastScanStatus: string;
  readonly lastScanAt: string;
};

@Component({
  selector: 'app-settings-page',
  imports: [CommonModule, Panel],
  templateUrl: './settings-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly foldersApi = inject(FoldersApi);

  protected readonly folders$: Observable<FolderRow[]> = this.foldersApi.getFolders().pipe(
    map((folders) => folders.map((folder, index) => this.mapFolder(folder, index))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  private mapFolder(folder: HandlersFolderDTO, index: number): FolderRow {
    return {
      id: String(folder.id ?? folder.path ?? `folder-${index}`),
      path: folder.path ?? 'Unknown path',
      availability: folder.available === false ? 'Unavailable' : 'Available',
      lastScanStatus: folder.last_scan_status ?? '—',
      lastScanAt: folder.last_scan_at ?? 'Never',
    };
  }
}
