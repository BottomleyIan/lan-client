import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  viewChild,
  viewChildren,
} from '@angular/core';
import { map, of, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { DayView } from '../../../shared/day-view/day-view';
import { JournalsApi } from '../../../core/api/journals.api';
import { NgxConnectionBeamComponent } from '@omnedia/ngx-connection-beam';
import type { HandlersTagEdgeDTO } from '../../../core/api/generated/api-types';
import { NotesTag } from '../notes-tag/notes-tag';

@Component({
  selector: 'app-notes-tag-graph',
  imports: [CommonModule, DayView, NotesTag, NgxConnectionBeamComponent],
  templateUrl: './notes-tag-graph.html',
  styleUrl: './notes-tag-graph.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesTagGraph {

  private readonly centerTagRef = viewChild.required('centerTag', { read: ElementRef });
  private readonly tagRefs = viewChildren(NotesTag);


  private readonly journalsApi = inject(JournalsApi);

  readonly tag = input.required<string>();
  protected readonly tag$ = toObservable(this.tag)

  protected readonly relatedTags$ = this.tag$.pipe(
    map((tag) => normalizeTag(tag)),
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

function normalizeTag(tag: string): string | null {
  return tag.trim().length > 0 ? tag.trim() : null;
}
