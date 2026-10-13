'use client';

import { Flexbox } from '@lobehub/ui';
import { Button, Text, toast } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import {
  FileText,
  LayoutTemplate,
  Presentation,
  Sparkles,
} from 'lucide-react';
import { memo, useCallback, useState } from 'react';

const styles = createStaticStyles(({ css }) => ({
  card: css`
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    border: 1px solid ${cssVar.colorBorderSecondary};
    border-radius: 16px;
    background: ${cssVar.colorBgContainer};
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:hover {
      border-color: ${cssVar.colorPrimaryBorder};
      box-shadow: 0 8px 24px ${cssVar.colorFillTertiary};
    }
  `,
  grid: css`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    width: 100%;
  `,
  iconWrap: css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    background: ${cssVar.colorFillTertiary};
    color: ${cssVar.colorPrimary};
  `,
  page: css`
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 24px 64px;
  `,
  textarea: css`
    width: 100%;
    min-height: 120px;
    padding: 14px 16px;
    border: 1px solid ${cssVar.colorBorder};
    border-radius: 12px;
    font: inherit;
    color: ${cssVar.colorText};
    background: ${cssVar.colorBgContainer};
    resize: vertical;
  `,
}));

type StudioFormat = 'pptx' | 'pdf' | 'infograph';

const FORMATS: Array<{
  id: StudioFormat;
  title: string;
  description: string;
  icon: typeof Presentation;
}> = [
  {
    id: 'pptx',
    title: 'Presentation (PPTX)',
    description: 'Slide deck for briefings and stakeholder reviews.',
    icon: Presentation,
  },
  {
    id: 'pdf',
    title: 'Report (PDF)',
    description: 'Structured long-form report with headings and summary.',
    icon: FileText,
  },
  {
    id: 'infograph',
    title: 'Infograph',
    description: 'One-page visual summary of key facts and figures.',
    icon: LayoutTemplate,
  },
];

const StudioPage = memo(() => {
  const [format, setFormat] = useState<StudioFormat>('pptx');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const generate = useCallback(async () => {
    if (!topic.trim()) {
      toast.error('Enter a topic or outline first.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/webapi/mcit/studio', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ format, topic: topic.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
      setResult(typeof data.content === 'string' ? data.content : JSON.stringify(data, null, 2));
      toast.success('Studio draft ready');
      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  }, [format, topic]);

  return (
    <div className={styles.page}>
      <Flexbox gap={8} style={{ marginBottom: 28 }}>
        <Flexbox horizontal align="center" gap={10}>
          <Sparkles size={22} />
          <Text as="h1" fontSize={28} weight="bold">
            Studio
          </Text>
        </Flexbox>
        <Text type="secondary">
          Create presentations, PDF reports, and infographs with your configured models (Ollama
          local or cloud). Output stays on this deployment.
        </Text>
      </Flexbox>

      <div className={styles.grid} style={{ marginBottom: 24 }}>
        {FORMATS.map((item) => {
          const Icon = item.icon;
          const active = format === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={styles.card}
              style={
                active
                  ? { borderColor: 'var(--ant-color-primary)', outline: '2px solid var(--ant-color-primary-border)' }
                  : undefined
              }
              onClick={() => setFormat(item.id)}
            >
              <span className={styles.iconWrap}>
                <Icon size={22} />
              </span>
              <Text weight="bold">{item.title}</Text>
              <Text type="secondary" fontSize={13}>
                {item.description}
              </Text>
            </button>
          );
        })}
      </div>

      <Flexbox gap={12}>
        <Text weight="bold">Topic / brief</Text>
        <textarea
          className={styles.textarea}
          placeholder="Describe the document you need (audience, key points, tone)…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <Flexbox horizontal gap={12}>
          <Button loading={loading} type="primary" onClick={() => void generate()}>
            Generate {FORMATS.find((f) => f.id === format)?.title}
          </Button>
        </Flexbox>
      </Flexbox>

      {result ? (
        <Flexbox
          gap={8}
          style={{
            marginTop: 28,
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--ant-color-border-secondary)',
            background: 'var(--ant-color-fill-quaternary)',
            whiteSpace: 'pre-wrap',
            maxHeight: 420,
            overflow: 'auto',
          }}
        >
          <Text weight="bold">Draft output</Text>
          <Text fontSize={13}>{result}</Text>
        </Flexbox>
      ) : null}
    </div>
  );
});

StudioPage.displayName = 'StudioPage';

export default StudioPage;
