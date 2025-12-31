import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, ParamMap, RouterLink } from '@angular/router';
import { NotesApi } from '../../../core/api/notes.api';
import { map, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { MarkdownBody } from '../../../shared/markdown/markdown-body';
import type { HandlersNoteDTO } from '../../../core/api/generated/api-types';

@Component({
  selector: 'app-notes-page',
  imports: [CommonModule, RouterLink, Panel, MarkdownBody],
  templateUrl: './notes-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly notesApi = inject(NotesApi);

  protected readonly tag = toSignal(
    this.route.paramMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.paramMap) },
  );

  protected readonly notes$ = this.route.paramMap.pipe(
    map((params) => normalizeTag(params)),
    switchMap((tag) => this.notesApi.getNotes(tag ? { tag } : undefined)),
  );

  protected readonly title = computed(() => {
    const tag = this.tag();
    return tag ? `Notes: ${tag}` : 'Notes';
  });

  protected trackNoteId(_: number, note: HandlersNoteDTO): number | string {
    return note.id ?? note.hash ?? `${note.year}-${note.month}-${note.day}-${note.position}`;
  }
}

function normalizeTag(params: ParamMap): string | null {
  const tag = params.get('tag');
  return tag && tag.trim().length > 0 ? tag.trim() : null;
}
