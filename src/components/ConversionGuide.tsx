import { useEffect, useMemo, useState } from 'react';
import type { ConversionId } from '@shared/conversions';
import { DocumentPreview } from '@/components/DocumentPreview';
import { conversionGuide } from '@/lib/conversion-guides';
import { type GuideQuestion, splitGuide } from '@/lib/guide-questions';
import { useI18n } from '@/lib/i18n/context';
import { markdownToHtml } from '@/lib/markdown';

/*
 * The guide under a converter, in the reader's language: see `src/lib/conversion-guides.ts`.
 *
 * Fetched when the page opens, so it is a chunk of its own rather than part of the bundle, and
 * drawn by the same preview an article is drawn by. Nothing is shown until it arrives. The
 * prerendered page already carries the same text for anybody who has not run the script.
 */
export function ConversionGuide({
  id,
  onQuestions,
}: {
  id: ConversionId;
  /** The guide's questions, handed to the page's FAQ, which asks them above the shared ones. */
  onQuestions?: (questions: GuideQuestion[]) => void;
}) {
  const { locale } = useI18n();
  const [markdown, setMarkdown] = useState<string | null>(null);

  useEffect(() => {
    let wanted = true;

    setMarkdown(null);
    void conversionGuide(id, locale).then((text) => {
      if (wanted) {
        setMarkdown(text);
      }
    });

    return () => {
      wanted = false;
    };
  }, [id, locale]);

  /* The guide without its last section: the questions go to the page's FAQ instead (guide-questions.ts). */
  const split = useMemo(() => (markdown ? splitGuide(markdown) : null), [markdown]);
  const html = useMemo(() => (split ? markdownToHtml(split.body) : ''), [split]);

  useEffect(() => {
    onQuestions?.(split?.questions ?? []);
  }, [split, onQuestions]);

  if (!html) {
    return null;
  }

  return (
    <section className="mt-6 w-full border-stroke border-t pt-10">
      <DocumentPreview html={html} className="md-article article-body mx-auto max-w-3xl" />
    </section>
  );
}
