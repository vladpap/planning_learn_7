import {useEffect, useMemo, useRef, useState} from 'react';

import {Card} from '@astryxdesign/core/Card';
import {Outline} from '@astryxdesign/core/Outline';
import type {OutlineItem} from '@astryxdesign/core/Outline';
import {HStack, VStack} from '@astryxdesign/core/Stack';
import {Heading, Text} from '@astryxdesign/core/Text';
import MarkdownIt from 'markdown-it';
import markdownItAnchor from 'markdown-it-anchor';
import markdownItTaskLists from 'markdown-it-task-lists';

const markdown = new MarkdownIt({html: true, linkify: true, typographer: true})
  .use(markdownItAnchor)
  .use(markdownItTaskLists, {label: true});

export function DocumentView() {
  const [html, setHtml] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let isCancelled = false;

    fetch(new URL('plan.md', document.baseURI).toString())
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.text();
      })
      .then(text => {
        if (!isCancelled) setHtml(markdown.render(text));
      })
      .catch(() => {
        if (!isCancelled) setError('Не удалось загрузить plan.md');
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const root = articleRef.current;
    if (!root) return;

    const items = Array.from(root.querySelectorAll('h2, h3')).map((heading, index) => {
      const id = `doc-heading-${index}`;
      heading.id = id;
      const rawLabel = heading.textContent ?? '';
      const weekMatch = rawLabel.match(/^Неделя (\d+) \((\d+\.\d+)/);
      return {
        id,
        label: weekMatch ? `Неделя ${weekMatch[1]} · ${weekMatch[2]}` : rawLabel,
        level: Number(heading.tagName.slice(1)),
      };
    });
    setOutline(items);
  }, [html]);

  const status = useMemo(() => {
    if (error) return 'error';
    if (!html) return 'loading';
    return 'ready';
  }, [error, html]);

  return (
    <VStack gap={4}>
      <VStack gap={1}>
        <Heading level={1}>Документ</Heading>
        <Text type="supporting">
          Полный текст плана в Markdown — с оглавлением, таблицами и подсветкой
          структуры, как в Yank Note.
        </Text>
      </VStack>

      {status === 'loading' && <Text type="supporting">Загружаем документ…</Text>}
      {status === 'error' && (
        <Card variant="red" padding={4}>
          <Text type="body">{error}</Text>
        </Card>
      )}

      {status === 'ready' && (
        <div className="doc-layout">
          <Card padding={5}>
            <article
              ref={articleRef}
              className="markdown-body"
              // The Markdown source is our own file from the same build.
              dangerouslySetInnerHTML={{__html: html}}
            />
          </Card>
          <aside className="doc-outline">
            <Card padding={3}>
              <HStack gap={2} vAlign="center">
                <Text type="label">Содержание</Text>
              </HStack>
              <Outline items={outline} label="Содержание документа" density="compact" />
            </Card>
          </aside>
        </div>
      )}
    </VStack>
  );
}
