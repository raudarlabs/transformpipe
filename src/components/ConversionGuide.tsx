import { useEffect, useMemo, useState } from 'react';
import type { ConversionId } from '@shared/conversions';
import { DocumentPreview } from '@/components/DocumentPreview';
import { conversionGuide } from '@/lib/conversion-guides';
import { useI18n } from '@/lib/i18n/context';
import { markdownToHtml } from '@/lib/markdown';

/*
 * The guide under a converter, in the reader's language: see `src/lib/conversion-guides.ts`.
 *
 * Fetched when the page opens, so it is a chunk of its own rather than part of the bundle, and
 * drawn by the same preview an article is drawn by. Nothing is shown until it arrives. The
 * prerendered page already carries the same text for anybody who has not run the script.
 */
export function ConversionGuide({ id }: { id: ConversionId }) {
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

  const html = useMemo(() => (markdown ? markdownToHtml(markdown) : ''), [markdown]);

  if (!html) {
    return null;
  }

  return (
    <section className="mt-6 w-full border-stroke border-t pt-10">
      <DocumentPreview html={html} className="md-article article-body mx-auto max-w-3xl" />
    </section>
  );
}
