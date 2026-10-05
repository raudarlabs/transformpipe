import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useT } from '@/lib/i18n/context';
import { useEscapeInFullscreen } from '@/lib/use-escape-in-fullscreen';
import { IconButton } from '@/ui/components/IconButton';

/*
 * One table, on the whole screen.
 *
 * The diagram viewer's sibling, and deliberately not the same thing: a table is text, and scaling
 * text to fit is how it becomes unreadable — so this does not zoom. It gives the table the whole
 * width of the screen at its own size, scrolls both ways when that is still not enough, and keeps
 * the header row in sight while the rows go past under it.
 *
 * App-only, like the diagram's: the button is added to the live preview, never to the markup a
 * download is made from.
 */
export function TableViewer({ table, onClose }: { table: string; onClose: () => void }) {
  const t = useT();

  useEscapeInFullscreen();

  useEffect(() => {
    const keys = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const scroll = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', keys);

    return () => {
      document.body.style.overflow = scroll;
      document.removeEventListener('keydown', keys);
    };
  }, [onClose]);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('table.viewer')}
      className="fixed inset-0 z-[60] flex flex-col bg-surface-page"
    >
      <div className="flex items-center justify-end gap-1 border-stroke border-b px-3 py-2">
        {/* biome-ignore lint/a11y/noAutofocus: a dialog that opens over everything is closed from here */}
        <IconButton variant="secondary" size="sm" aria-label={t('diagram.close')} onClick={onClose} autoFocus>
          <X />
        </IconButton>
      </div>

      {/* The table's own scroll box, both ways, with the header row stuck to its top. */}
      <div className="md-doc md-table-viewer min-h-0 flex-1 overflow-auto p-6">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: the preview's own table, sanitised when the document was rendered */}
        <div dangerouslySetInnerHTML={{ __html: table }} />
      </div>
    </div>,
    /* Into whatever is full screen, if anything is, for the reason DiagramViewer gives. */
    document.fullscreenElement ?? document.body
  );
}
