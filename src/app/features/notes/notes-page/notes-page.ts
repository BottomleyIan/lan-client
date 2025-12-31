import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, of, switchMap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { Panel } from '../../../ui/panel/panel';
import { DayView } from '../../../shared/day-view/day-view';
import { JournalsApi } from '../../../core/api/journals.api';
import { NgxConnectionBeamComponent } from '@omnedia/ngx-connection-beam';
import type { HandlersTagEdgeDTO } from '../../../core/api/generated/api-types';
import { NotesTag } from '../notes-tag/notes-tag';

@Component({
  selector: 'app-notes-page',
  imports: [CommonModule, Panel, DayView, NotesTag, NgxConnectionBeamComponent],
  templateUrl: './notes-page.html',
  styleUrl: './notes-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesPage {
  private readonly route = inject(ActivatedRoute);
  private readonly journalsApi = inject(JournalsApi);
  private readonly centerTagRef = viewChild.required('centerTag', { read: ElementRef });
  private readonly tagRefs = viewChildren(NotesTag);

  protected readonly tag = toSignal(
    this.route.paramMap.pipe(map((params) => normalizeTag(params))),
    { initialValue: normalizeTag(this.route.snapshot.paramMap) },
  );

  protected readonly relatedTags$ = this.route.paramMap.pipe(
    map((params) => normalizeTag(params)),
    switchMap((tag) => {
      if (!tag) {
        return of<HandlersTagEdgeDTO[]>([]);
      }
      return this.journalsApi.getTagGraph(tag).pipe(
        map((graph) => graph.related ?? []),
        map((related) =>
          [...related]
            .filter((edge) => edge.tag)
            .sort((a, b) => (b.count ?? 0) - (a.count ?? 0))
            .slice(0, 6),
        ),
      );
    }),
  );

  protected readonly relatedSlots$ = this.relatedTags$.pipe(
    map((related) =>
      Array.from({ length: 6 }, (_, index) => {
        const edge = related[index];
        return {
          index,
          tag: edge?.tag ?? null,
          count: edge?.count ?? 0,
        };
      }),
    ),
  );

  protected readonly tagElements = computed(() => this.tagRefs().map((tag) => tag.element));
  protected readonly centerElement = computed(() => this.centerTagRef().nativeElement);
  protected readonly beamsReady = computed(() => this.tagElements().length === 6);

  protected curvatureFor(index: number): number {
    if (index <= 1) {
      return 20;
    }
    if (index <= 3) {
      return 0;
    }
    return -20;
  }
}

function normalizeTag(params: ParamMap): string | null {
  const tag = params.get('tag');
  return tag && tag.trim().length > 0 ? tag.trim() : null;
}
