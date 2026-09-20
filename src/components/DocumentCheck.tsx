import { checkDocument, type Problem } from '@shared/check';
import { CircleCheck, TriangleAlert } from 'lucide-react';
import { useMemo } from 'react';
import { useT } from '@/lib/i18n/context';
import { Typography } from '@/ui/components/Typography';

interface DocumentCheckProps {
  markdown: string;
}

/**
 * What a reader would trip over, listed beside the document rather than fixed in it.
 *
 * The one rule this panel keeps is that it changes nothing. Every finding is a single edit in a
 * source the person is already looking at, and a checker that makes those edits itself is one
 * nobody can hand a document they care about — the value is in being told, not in being tidied.
 *
 * Each key is `check.<problem>`, so a problem added to the checker is a string added to the five
 * locales and nothing else here.
 */
export function DocumentCheck({ markdown }: DocumentCheckProps) {
  const t = useT();
  const findings = useMemo(() => checkDocument(markdown), [markdown]);

  if (findings.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-xl border border-stroke bg-surface-page p-6">
        <CircleCheck className="mt-0.5 size-5 shrink-0 text-brand-tertiary" />
        <span className="flex flex-col gap-1">
          <Typography variant="span" weight="medium">
            {t('check.clean')}
          </Typography>
          <Typography variant="span" textColor="secondary" className="text-sm">
            {t('check.clean.detail')}
          </Typography>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-stroke bg-surface-page p-6">
      <Typography variant="p" textColor="secondary" className="text-sm">
        {t('check.lede')}
      </Typography>

      <ul className="flex flex-col gap-2">
        {findings.map((finding, index) => (
          <li
            className="flex items-start gap-3 rounded-lg border border-stroke bg-surface-card p-3"
            key={`${finding.problem}-${finding.line}-${index}`}
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />

            <span className="flex min-w-0 flex-col gap-0.5">
              <Typography variant="span" className="text-sm">
                {t(`check.${finding.problem}` as `check.${Problem}`)}
              </Typography>

              <Typography
                variant="span"
                textColor="secondary"
                className="break-words text-xs"
              >
                {t('check.line', { line: String(finding.line) })}
                {' · '}
                <code className="font-mono">{finding.subject}</code>
                {finding.suggestion
                  ? ` · ${t('check.suggestion', { anchor: `#${finding.suggestion}` })}`
                  : ''}
              </Typography>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
