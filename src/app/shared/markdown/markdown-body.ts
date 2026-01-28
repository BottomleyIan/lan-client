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
const IMAGE_LINE_PATTERN = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const YOUTUBE_LINK_PATTERN = /\[youtube\]\(([^)]+)\)/gi;

function formatMarkdownBody(markdown: string): string {
  if (!markdown) {
    return '';
  }
  const normalized = normalizeSingleLineBreaks(markdown);
  const { bodyText, trailingImages } = splitTrailingImageLines(normalized);
  const withAssets = replaceAssetLinks(bodyText);
  const withYoutube = replaceYoutubeLinks(withAssets);
  const withTags = replaceTagLinks(withYoutube);
  const imageHtml = renderImageGroup(trailingImages);
  if (!imageHtml) {
    return withTags;
  }
  return `${withTags}\n\n${imageHtml}`;
}

function normalizeSingleLineBreaks(markdown: string): string {
  const text = markdown.replace(/\r\n/g, '\n');
  const lines = text.split('\n');
  const output: string[] = [];
  let inFence = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const isFence = /^\s*```/.test(line);

    if (isFence) {
      output.push(line);
      inFence = !inFence;
      continue;
    }

    output.push(line);

    if (inFence) {
      continue;
    }

    const nextLine = lines[index + 1];
    if (nextLine === undefined) {
      continue;
    }

    const nextIsFence = /^\s*```/.test(nextLine);
    if (nextIsFence) {
      continue;
    }

    if (line.length > 0 && nextLine.length > 0) {
      output.push('');
    }
  }

  return output.join('\n');
}

function splitTrailingImageLines(markdown: string): {
  bodyText: string;
  trailingImages: string[];
} {
  const lines = markdown.split('\n');
  let endIndex = lines.length - 1;
  while (endIndex >= 0 && lines[endIndex].trim().length === 0) {
    endIndex -= 1;
  }
  const trailingImages: string[] = [];
  while (endIndex >= 0 && IMAGE_LINE_PATTERN.test(lines[endIndex] ?? '')) {
    trailingImages.unshift(lines[endIndex] ?? '');
    endIndex -= 1;
    while (endIndex >= 0 && lines[endIndex].trim().length === 0) {
      endIndex -= 1;
    }
  }
  const bodyLines = lines.slice(0, endIndex + 1);
  return { bodyText: bodyLines.join('\n').trimEnd(), trailingImages };
}

function replaceAssetLinks(markdown: string): string {
  return markdown.replace(ASSET_LINK_PATTERN, (_match, altText, assetPath) => {
    const url = `${apiUrl('api/journals/assets')}?path=${encodeURIComponent(assetPath)}`;
    return `![${altText}](${url})`;
  });
}

function replaceTagLinks(markdown: string): string {
  return markdown.replace(TAG_LINK_PATTERN, (match, rawTag) => {
    const tag = rawTag.trim();
    if (!tag) {
      return match;
    }
    const href = `/notes?tag=${encodeURIComponent(tag)}`;
    return `<a class="tag-link text-tokyo-accent-orange" href="${href}">${escapeHtml(tag)}</a>`;
  });
}

function replaceYoutubeLinks(markdown: string): string {
  return markdown.replace(YOUTUBE_LINK_PATTERN, (match, rawUrl) => {
    const url = rawUrl.trim();
    const videoId = extractYoutubeId(url);
    if (!videoId) {
      return match;
    }
    const thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    const safeUrl = escapeHtml(url);
    return `<a class="markdown-youtube" href="${safeUrl}" target="_blank" rel="noreferrer"><img class="markdown-youtube-image" src="${thumbnail}" alt="YouTube video" loading="lazy" /><span class="sr-only">YouTube video</span></a>`;
  });
}

function renderImageGroup(lines: string[]): string {
  if (lines.length === 0) {
    return '';
  }
  const images = lines
    .map((line) => replaceAssetLinks(line))
    .map((line) => line.match(IMAGE_LINE_PATTERN))
    .filter((match): match is RegExpMatchArray => !!match)
    .map((match) => {
      const altText = escapeHtml(match[1] ?? '');
      const url = match[2] ?? '';
      return `<img class="markdown-image" src="${url}" alt="${altText}" loading="lazy" />`;
    });
  if (images.length === 0) {
    return '';
  }
  return `<div class="markdown-image-grid">\n${images.join('\n')}\n</div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function extractYoutubeId(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    return id ?? null;
  }
  if (!host.endsWith('youtube.com')) {
    return null;
  }
  if (url.pathname === '/watch') {
    return url.searchParams.get('v');
  }
  const pathParts = url.pathname.split('/').filter(Boolean);
  if (pathParts[0] === 'embed' || pathParts[0] === 'shorts') {
    return pathParts[1] ?? null;
  }
  return null;
}
