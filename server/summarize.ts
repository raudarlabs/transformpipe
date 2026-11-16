import type { OpenAILanguageModelResponsesOptions } from '@ai-sdk/openai';

/*
 * The AI half of the app: one call, one model, cached on the row it describes.
 *
 * Talks to OpenAI's API directly with a paid key. It was Google's Gemini on a free AI Studio key
 * until November 2026, and the free tier was the problem: Google's terms for it let Google use what
 * is sent to improve its products, and a privacy policy has to say so — which is not something to
 * say about other people's documents, and not something an app review lets pass. OpenAI does not
 * train on API traffic, and `store: false` below keeps the response off its servers too. (The
 * Vercel AI Gateway was tried before Gemini and rate-limited free accounts together.) Loaded
 * lazily, like `mammoth` in `v1.ts`, so no request that isn't asking for a summary pays for it.
 */

/** Without a key the endpoint refuses cleanly, the way sign-in does when `NEON_AUTH_BASE_URL` is
 * unset — see `server/auth.ts`. */
export function summaryEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

/*
 * What the model is asked for, written once for the two ways of asking.
 *
 * It was three to five sentences of plain prose, and read like the back of a book: enough to say
 * what a document was about and nothing a person could act on. Now a paragraph for what it is and
 * where it lands, and then the particulars — the numbers, names, decisions and dates — because
 * those are what somebody who will not read the whole thing actually needs from it. A list is the
 * one piece of Markdown allowed, which is why the app renders the answer rather than printing it.
 */
const INSTRUCTIONS = [
  'You summarise a Markdown document for someone who needs its substance without reading all of it.',
  'Write in the language the document is written in.',
  'Begin with one paragraph of three to five sentences: what the document is, what it is for, and what it concludes, decides or asks for.',
  'Then, after a blank line, a Markdown bullet list of the specifics that carry it — figures, names, decisions, dates, requirements, open questions — one per bullet, each a full sentence.',
  'Four to eight bullets for a long document and fewer for a short one: never pad, and never repeat the paragraph.',
  'No headings, no bold, no restating the title, and no preamble such as "Here is a summary".',
].join(' ');

/*
 * The mini model first, and the nano one when the mini will not answer.
 *
 * Both are reasoning models told not to reason: a summary is reading, not working something out,
 * and reasoning is time before the first word, which a reader watching an empty tab notices. The
 * nano model is the fallback rather than the default for the reason Flash-Lite was under Gemini: a
 * smaller model gets figures wrong more often, and a careful summary beats a fast one, but a
 * slightly less careful one beats an error.
 *
 * `store: false` because OpenAI otherwise keeps a response for later retrieval, and nothing here
 * ever asks for one back.
 */
const MODELS = ['gpt-5.4-mini', 'gpt-5.4-nano'] as const;

const OPTIONS = {
  reasoningEffort: 'none',
  textVerbosity: 'low',
  store: false,
} satisfies OpenAILanguageModelResponsesOptions;

/* The slice is a token budget, not a judgement about long documents: a summary only needs to have
 * read the thing once. */
async function request(markdown: string, model: (typeof MODELS)[number]) {
  const { openai } = await import('@ai-sdk/openai');

  return {
    model: openai(model),
    system: INSTRUCTIONS,
    prompt: markdown.slice(0, 60_000),
    maxOutputTokens: 1200,
    // One retry, not the default two: past that the next model is the better bet than a third wait.
    maxRetries: 1,
    providerOptions: { openai: OPTIONS },
  };
}

/** A summary of a document's Markdown source, in one piece — for the API and the assistant tools. */
export async function summarize(markdown: string): Promise<string> {
  const { generateText } = await import('ai');
  let failure: unknown = new Error('The model returned nothing');

  for (const model of MODELS) {
    try {
      const { text } = await generateText(await request(markdown, model));
      const summary = text.trim();

      if (summary) {
        return summary;
      }
    } catch (cause) {
      failure = cause;
    }
  }

  throw failure instanceof Error ? failure : new Error(String(failure));
}

/**
 * The same summary as it is written, a piece at a time — for the app, where a reader watching a
 * blank box concludes nothing is happening.
 *
 * A model that fails before its first word hands over to the next one; one that fails part-way
 * throws, because text already on somebody's screen cannot be taken back and started again under
 * it. An error arrives as a part of the stream rather than as an exception, and a summary that
 * stopped in the middle must not be mistaken for a short one.
 */
export async function* summarizeStream(markdown: string): AsyncGenerator<string> {
  const { streamText } = await import('ai');
  let failure: unknown = new Error('The model returned nothing');

  for (const model of MODELS) {
    let wrote = false;

    try {
      const result = streamText({ ...(await request(markdown, model)), onError: () => undefined });

      for await (const part of result.stream) {
        if (part.type === 'text-delta' && part.text) {
          wrote = true;
          yield part.text;
        } else if (part.type === 'error') {
          throw part.error instanceof Error ? part.error : new Error(String(part.error));
        }
      }

      if (wrote) {
        return;
      }
    } catch (cause) {
      if (wrote) {
        throw cause;
      }

      failure = cause;
    }
  }

  throw failure instanceof Error ? failure : new Error(String(failure));
}

/**
 * Why a summary did not happen, in a sentence for the person who asked.
 *
 * What the provider says is written for a developer — "Failed after 3 attempts. Last error:
 * AI_APICallError: You exceeded your current quota, please check your plan and billing details" — and it
 * went onto the screen as it was. The two failures that are nobody's fault and pass on their own
 * are named as that; anything else keeps a short form of the provider's words, and the whole of
 * them goes to the log, where the person who can act on it will look.
 */
export function summaryFailure(cause: unknown): string {
  const said = cause instanceof Error ? cause.message : String(cause ?? '');

  console.warn('summary: %s', said);

  if (/quota|rate.?limit|RESOURCE_EXHAUSTED|insufficient_quota|\b429\b/i.test(said)) {
    return 'The summariser has used up its allowance for the moment. Try again in a minute.';
  }

  if (/high demand|overloaded|UNAVAILABLE|\b503\b|try again later/i.test(said)) {
    return 'The summariser is busy right now. Try again in a minute.';
  }

  const short = said.replace(/^Failed after \d+ attempts\. Last error: /, '').replace(/^AI_\w+: /, '');

  return `Could not summarise this document: ${short.slice(0, 160) || 'the model did not answer'}`;
}
