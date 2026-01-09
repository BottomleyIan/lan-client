import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MarkdownComponent } from 'ngx-markdown';
import { apiUrl } from '../../core/api/api-url';

@Component({
  selector: 'app-markdown-body',
  imports: [CommonModule, MarkdownComponent],
  template: `<markdown class="prose prose-invert max-w-none" [data]="formatted()" lineNumbers>
  </markdown>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarkdownBody {
  readonly markdown = input('');

  protected readonly formatted = computed(() => formatMarkdownBody(this.markdown()));
}

const ASSET_LINK_PATTERN = /!\[([^\]]*)\]\(\.\.\/assets\/([^)]+)\)/g;
const TAG_LINK_PATTERN = /\[\[([^\]]+)\]\]/g;

function formatMarkdownBody(markdown: string): string {
  if (!markdown) {
    return '';
  }
  const normalized = normalizeSingleLineBreaks(markdown);
  const withAssets = normalized.replace(ASSET_LINK_PATTERN, (_match, altText, assetPath) => {
    const url = `${apiUrl('api/journals/assets')}?path=${encodeURIComponent(assetPath)}`;
    return `![${altText}](${url})`;
  });
  return withAssets.replace(TAG_LINK_PATTERN, (match, rawTag) => {
    const tag = rawTag.trim();
    if (!tag) {
      return match;
    }
    const href = `/notes?tag=${encodeURIComponent(tag)}`;
    return `<a class="tag-link text-tokyo-accent-orange" href="${href}">${escapeHtml(tag)}</a>`;
  });
}

function normalizeSingleLineBreaks(markdown: string): string {
  const text = markdown.replace(/\r\n/g, '\n');
  let result = '';
  let newlineCount = 0;

  for (const char of text) {
    if (char === '\n') {
      newlineCount += 1;
      continue;
    }

    if (newlineCount === 1) {
      result += '\n\n';
    } else if (newlineCount > 1) {
      result += '\n'.repeat(newlineCount);
    }
    newlineCount = 0;
    result += char;
  }

  if (newlineCount === 1) {
    result += '\n\n';
  } else if (newlineCount > 1) {
    result += '\n'.repeat(newlineCount);
  }

  return result;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
