import {
  ChevronDown,
  Copy,
  Download,
  FileCode2,
  FileInput,
  Link2,
  Loader2,
  Save,
  Settings,
} from 'lucide-react';
import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { pageToMarkdown } from '@shared/from-page';
import { getDocStats } from '@shared/markdown';
import { Dropzone, MAX_FILE_SIZE } from '@/components/Dropzone';
import { DocumentPreview } from '@/components/DocumentPreview';
import { Logo } from '@/components/Logo';
import { CONVERSIONS, DEFAULT_CONVERSION } from '@shared/conversions';
import { conversionForFiles, convertFile } from '@/lib/convert';
import { downloadDoc, saveBlob } from '@/lib/download';
import { formatBytes } from '@/lib/format';
import { useI18n, useT } from '@/lib/i18n/context';
import { INTL_LOCALES } from '@/lib/i18n/locales';
import { markdownToHtml } from '@/lib/markdown';
import { mergedName, mergeMarkdown } from '@/lib/merge';
import { useTheme } from '@/lib/theme';
import { Button } from '@/ui/components/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/components/DropdownMenu';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/components/Tabs';
import { Typography } from '@/ui/components/Typography';
import { copyText, takeHandoff } from './lib/clipboard';
import { type HtmlFlavour, pageHtmlFile } from './lib/page-file';
import { useAccount } from './lib/useAccount';
import { Providers } from './lib/Providers';
import '@/index.css';

/*
 * The viewer: a tab of the extension's own, and the only surface here with room to read.
 *
 * It is where a page converted from the popup is opened at full size, and it is where files are
 * converted — because a popup closes the moment a tab opens in front of it, and a `File` cannot be
 * handed from a closing page to a new one. So the picker lives here: the bytes are read in the page
 * that shows them and go nowhere else. With no account and no network, this is a complete
 * converter for every format the site reads, which is what `src/lib/convert.ts` already was.
 */
/** Every extension any conversion takes, in the order the conversions are declared. */
const ACCEPTS = [...new Set(CONVERSIONS.flatMap((one) => one.extensions))];

interface Loaded {
  title: string;
  name: string;
  markdown: string;
  /** Present when this came from a page rather than a file — see `shared/from-page.ts`. */
  html?: string;
}

function Viewer() {
  const t = useT();
  const { locale } = useI18n();
  const { theme } = useTheme();
  const [document_, setDocument] = useState<Loaded | null>(null);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const account = useAccount();
  const picker = useRef<HTMLInputElement>(null);

  /* Whatever the popup left in session memory, or nothing, which means "ask for files". */
  useEffect(() => {
    const parameters = new URLSearchParams(window.location.search);
    const id = parameters.get('doc');

    if (!id) {
      setBusy(false);

      if (parameters.get('open')) {
        /* Opened for files: the picker is the whole point of the page, so it opens itself. */
        requestAnimationFrame(() => picker.current?.click());
      }

      return;
    }

    void takeHandoff(id).then((found) => {
      /*
       * Either it arrived converted, or it arrived as a page — the right-click menu is handled by
       * the service worker, which has no DOM and so cannot have done the conversion itself.
       */
      if (found?.source) {
        const converted = pageToMarkdown(found.source);

        setDocument(converted);
      } else if (found?.markdown) {
        setDocument({
          title: found.title ?? found.name ?? 'page.md',
          name: found.name ?? 'page.md',
          markdown: found.markdown,
          html: found.html,
        });
      }

      setBusy(false);
    });
  }, []);

  const onFiles = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      /*
       * The picker takes anything, so the conversion is decided by what was picked; the default is
       * only the answer for a file whose extension names no conversion, and that is a rejection.
       */
      const { id, rejected } = conversionForFiles(DEFAULT_CONVERSION, files, t);

      if (rejected) {
        setError(rejected);
        return;
      }

      const total = files.reduce((sum, file) => sum + file.size, 0);

      if (total > MAX_FILE_SIZE) {
        setError(
          t('converter.toolarge.detail', {
            size: formatBytes(total, INTL_LOCALES[locale]),
            limit: formatBytes(MAX_FILE_SIZE, INTL_LOCALES[locale]),
          })
        );
        return;
      }

      const converted = await Promise.all(
        files.map((file) => convertFile(id, file, t))
      );

      const name = mergedName(
        converted.map((one) => one.name),
        t
      );

      setDocument({
        title: name,
        name,
        markdown: mergeMarkdown(
          converted.map((one) => ({ name: one.name, markdown: one.markdown }))
        ),
      });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : String(failure));
    } finally {
      setBusy(false);
    }
  };

  const stats = document_
    ? getDocStats(document_.markdown, markdownToHtml(document_.markdown))
    : null;

  /* No tab to ask for the pictures here, so a page keeps its structure and its image addresses. */
  const saveHtml = async (flavour: HtmlFlavour) => {
    if (!document_ || generating) {
      return;
    }

    setGenerating(true);

    try {
      const file = await pageHtmlFile(
        { ...document_, html: document_.html ?? '' },
        flavour,
        theme
      );

      saveBlob(
        document_.name.replace(/\.md$/, '.html'),
        new Blob([file], { type: 'text/html;charset=utf-8' })
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface-page">
      <header className="sticky top-0 z-10 bg-surface-header/90 backdrop-blur">
        {/* The site's own two pixels of brand, so the tab is recognisably the same product. */}
        <div
          aria-hidden="true"
          className="h-0.5 bg-gradient-to-r from-brand-tertiary via-brand-primary to-transparent"
        />
        <div className="mx-auto flex h-14 w-full max-w-content items-center gap-4 border-stroke border-b px-6">
          <Logo />

          {document_ && (
            <Typography
              variant="span"
              textColor="secondary"
              className="min-w-0 truncate text-sm"
            >
              {document_.title}
              {stats
                ? ` · ${t('ext.stats', {
                    words: stats.words.toLocaleString(),
                    size: formatBytes(
                      new Blob([document_.markdown]).size,
                      INTL_LOCALES[locale]
                    ),
                  })}`
                : ''}
            </Typography>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              leftSlot={<FileInput />}
              onClick={() => picker.current?.click()}
            >
              {t('ext.files')}
            </Button>

            {document_ && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  leftSlot={<Copy />}
                  onClick={async () =>
                    setCopied(await copyText(document_.markdown))
                  }
                >
                  {copied ? t('ext.copied') : t('ext.copy')}
                </Button>

                {/*
                  * A file has no structure to keep beyond what the conversion produced, so it gets
                  * the one HTML the site has always written. A page kept both halves, and the
                  * choice between them belongs to whoever is saving it.
                  */}
                {document_.html ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={generating}
                        leftSlot={
                          generating ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <FileCode2 />
                          )
                        }
                        rightSlot={generating ? undefined : <ChevronDown />}
                      >
                        {generating ? t('ext.generating') : t('ext.download.html')}
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuItem onSelect={() => void saveHtml('snapshot')}>
                        {t('ext.html.page')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => void saveHtml('article')}>
                        {t('ext.html.text')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftSlot={<FileCode2 />}
                    onClick={() =>
                      downloadDoc(
                        document_.name,
                        document_.markdown,
                        Date.now(),
                        theme,
                        'html'
                      )
                    }
                  >
                    {t('ext.download.html')}
                  </Button>
                )}

                {account.connected ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={account.state === 'busy'}
                      leftSlot={
                        account.state === 'busy' ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Save />
                        )
                      }
                      onClick={() =>
                        void account.save(
                          document_.name,
                          document_.markdown,
                          false
                        )
                      }
                    >
                      {account.state === 'done' && !account.link
                        ? t('ext.saved')
                        : t('ext.save')}
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={account.state === 'busy'}
                      leftSlot={<Link2 />}
                      onClick={async () => {
                        const saved = await account.save(
                          document_.name,
                          document_.markdown,
                          true
                        );

                        if (saved?.share?.url) {
                          await copyText(saved.share.url);
                        }
                      }}
                    >
                      {account.link ? t('ext.shared') : t('ext.share')}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="transparent"
                    size="sm"
                    leftSlot={<Settings />}
                    onClick={() => chrome.runtime.openOptionsPage()}
                  >
                    {t('ext.connect')}
                  </Button>
                )}

                <Button
                  size="sm"
                  leftSlot={<Download />}
                  onClick={() =>
                    downloadDoc(
                      document_.name,
                      document_.markdown,
                      Date.now(),
                      theme,
                      'md'
                    )
                  }
                >
                  {t('ext.download')}
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* The one input in the extension, and it is a plain file picker — no permission, no API. */}
      <input
        ref={picker}
        type="file"
        multiple
        hidden
        onChange={(event) => {
          void onFiles([...(event.target.files ?? [])]);
          event.target.value = '';
        }}
      />

      <main className="mx-auto w-full max-w-content flex-1 px-6 py-8">
        {busy && (
          <div className="flex items-center justify-center gap-2 py-24 text-ink-secondary">
            <Loader2 className="size-4 animate-spin" />
            {t('ext.converting')}
          </div>
        )}

        {!busy && error && (
          <Typography variant="p" textColor="destructive" className="py-8">
            {error}
          </Typography>
        )}

        {/*
          * The site's own dropzone, not a rectangle drawn again here: it already takes a drop,
          * opens a picker, names what it accepts and says the file is read in this browser. The
          * only thing it needs telling is that here it accepts everything — a page with one
          * conversion asks for that conversion's extensions; this page asks for all of them.
          */}
        {!busy && !document_ && !error && (
          <Dropzone
            extensions={ACCEPTS}
            title={t('ext.viewer.empty', { count: CONVERSIONS.length })}
            hint={t('ext.viewer.hint')}
            onFiles={(files) => void onFiles(files)}
          />
        )}

        {!busy && document_ && (
          <Tabs defaultValue="preview" className="flex flex-col gap-4">
            <TabsList>
              <TabsTrigger value="preview">
                {t('converter.tab.preview')}
              </TabsTrigger>
              <TabsTrigger value="source">
                {t('converter.tab.markdown')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview">
              <DocumentPreview html={markdownToHtml(document_.markdown)} />
            </TabsContent>

            <TabsContent value="source">
              <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-stroke bg-surface-card p-4 font-mono text-sm">
                {document_.markdown}
              </pre>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Providers>
      <Viewer />
    </Providers>
  </StrictMode>
);
