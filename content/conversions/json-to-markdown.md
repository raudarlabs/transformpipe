## What comes across

JSON has no headings or paragraphs, so the converter decides by shape. The file's name, without its extension, becomes the document's heading: `users.json` opens as `# users`.

| In the file | In the Markdown |
| --- | --- |
| An array of objects whose values are all plain | A table, one row per object, keys as columns |
| An array of plain values | A bullet list |
| An object | Its plain fields as bold labels (`**Status:** shipped`), then a heading per nested field (`## Customer`) |
| An array of mixed or nested items | A numbered section per item: `## 1`, `## 2` |
| An object or mixed list three levels below the title | A fenced `json` block, pretty-printed |
| `null` | `_null_`, written rather than skipped |
| An empty array or object | `_Empty list._` or `_Empty object._` |

Columns are collected from every record in the order they first appear, so a field only the tenth record has still gets one, and the others get an empty cell. Keys become words: underscores and hyphens turn into spaces, camelCase is split and the first letter capitalised, so `first_name` reads "First name" and `lastLogin` "Last Login".

## What is left behind

- **The keys as written.** Outside a fenced block, only the reworded form appears.
- **Number formatting.** Numbers are read as numbers, so `42.50` comes out as `42.5`, `1e3` as `1000`, and an integer longer than about 15 digits can lose its last ones. Values in quotes are untouched: `"007"` stays `007`.
- **The table, if one record is nested.** One record holding a list, even an empty one, turns the whole array into numbered sections. Nothing is flattened into dotted column names.
- **Escaping.** Strings are written as they are, so asterisks or underscores in a value are read as Markdown. Inside a table, a pipe is escaped and a line break becomes `<br>`.

## An example

A list of users from an API, saved as `users.json`:

```json
[
  { "id": 1, "first_name": "Ana", "isActive": true, "lastLogin": "2026-10-01" },
  { "id": 2, "first_name": "Ben", "isActive": false, "lastLogin": null },
  { "id": 3, "first_name": "Chloé", "isActive": true, "team": "Docs | Web" }
]
```

It becomes a `# users` heading and this table:

```markdown
| Id | First name | Is Active | Last Login | Team |
| --- | --- | --- | --- | --- |
| 1 | Ana | true | 2026-10-01 |  |
| 2 | Ben | false | _null_ |  |
| 3 | Chloé | true |  | Docs \| Web |
```

## Limits

- A file can be up to 10 MB, and the page takes `.json` only, so a `.jsonl` or `.ndjson` file has to be renamed first. You can also paste the text.
- The file is converted in your browser and is not uploaded. If you are signed in, the document reaches your account only when you press Save, and a saved document can be at most 4 MB.
- The JSON has to be strict. A file that will not parse is refused with "That is not valid JSON" and the browser's own message, which usually names the position.

## Questions

### How do I convert JSON to a Markdown table?

An array of objects whose values are all strings, numbers, booleans or `null` becomes one table. Flatten nested records first, with `jq` for instance, or accept sections instead. [JSON to a Markdown table](/blog/convert-json-to-markdown-table) covers what converts cleanly and what does not.

### What happens to nested JSON?

Each nested field gets a heading, down to three levels below the title. At that level, an object or mixed list becomes a fenced `json` block, while a table or plain list is still drawn.

### Can I convert JSON to Markdown in Python?

There is no Python package; the page converts in the browser. With an account, the API runs the same code: send the file to `POST /api/v1/documents?kind=json-to-markdown&name=users.json` with an API key, using `requests` or any HTTP client, and the result is saved in your account, headed `# users`.

### Does it read JSON Lines?

Yes, once the file ends in `.json`. When the whole file does not parse, each non-empty line is read as a value of its own, so a log of one flat object per line becomes a table. If any line fails, the error from the first attempt is reported.

### Why does it say my file is not valid JSON?

The usual causes are a trailing comma after the last item, single quotes instead of double, and comments, which JSON does not allow. [How to open a .json file](/how-to/open-json) explains how to find the fault from the position in the message.

### Can it turn Markdown back into JSON?

No. The downloads are Markdown, HTML, Word, plain text, EPUB and formats for Confluence, Jira and Slack; JSON is not among them.
