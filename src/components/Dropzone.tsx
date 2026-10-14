import { CloudUpload, FileText } from 'lucide-react';
import { uploadLimit } from '@shared/limits';
import { formatBytes } from '@/lib/format';
import { useI18n } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { type DragEvent, type ChangeEvent, useRef, useState } from 'react';
import { useT } from '@/lib/i18n/context';
import { Button } from '@/ui/components/Button';
import { Typography } from '@/ui/components/Typography';
import { cn } from '@/ui/lib/utils';

interface DropzoneProps {
  isBusy?: boolean;
  /** What this conversion takes, with the dots. Shown, and given to the file picker. */
  extensions: string[];
  title: string;
  hint: string;
  /** Several files are chained into one document, in the order they arrive. */
  onFiles: (files: File[]) => void;
}

export function Dropzone({
  isBusy = false,
  extensions,
  title,
  hint,
  onFiles,
}: DropzoneProps) {
  const t = useT();
  const { locale } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files ?? []);

    if (files.length > 0) {
      onFiles(files);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length > 0) {
      onFiles(files);
    }

    // allow re-picking the same file
    event.target.value = '';
  };

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-xl border border-dropzone-border border-dashed px-6 py-14 text-center',
        'dot-grid bg-surface-card transition-colors duration-base',
        isDragging && 'border-dropzone-border-active bg-dropzone-bg-active',
        isBusy && 'pointer-events-none opacity-disabled'
      )}
    >
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
        <CloudUpload className="size-7" />
      </span>

      <div className="flex flex-col items-center gap-1.5">
        <Typography variant="lead" weight="bold" textColor="primary">
          {title}
        </Typography>
        <Typography variant="p" textColor="secondary" align="center">
          {hint}
        </Typography>
      </div>

      <Button
        variant="primary"
        size="md"
        leftSlot={<FileText />}
        onClick={() => inputRef.current?.click()}
      >
        {t('converter.dropzone.choose')}
      </Button>

      <Typography variant="span" textColor="light" className="text-xs">
        {/* One sentence with the extensions dropped into it, so a translator can move them. */}
        {t('converter.dropzone.limits', {
          extensions: extensions.join(', '),
          limit: formatBytes(uploadLimit(extensions), INTL_LOCALES[locale]),
        })}
      </Typography>

      <input
        ref={inputRef}
        type="file"
        accept={extensions.join(',')}
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
