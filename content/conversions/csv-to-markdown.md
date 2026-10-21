## What comes across

The first row becomes the header, and every row after it a row of the table. The file's name, without its extension, goes above it as a heading, so `orders.csv` opens as `# orders`.

A `.tsv` is always split on tabs. Anything else is split on whichever of comma, tab, semicolon or pipe appears most often on the first line outside quotes, with the comma as the fallback. A semicolon-separated export from a European copy of Excel needs no setting, and a decimal comma such as `3,50` stays in its cell.

Quoting follows RFC 4180:

| In the file | In the Markdown |
| --- | --- |
| A comma inside a quoted field | Stays in the cell |
| A doubled quote inside a quoted field | One literal quote mark |
| A line break inside a quoted field | `<br>`, because a table row cannot run over two lines |
| A pipe character in a value | Escaped with a backslash, so it does not end the cell |
| A backslash in a value | Doubled, so it is shown rather than read as an escape |
| Blank lines, a byte-order mark | Dropped |

Values stay text, as written: `42.50` keeps its trailing zero and `007` its leading zeros. Only the spaces at either end of a cell are trimmed.

## What is left behind

- **Alignment.** Every column gets a plain `---`, so numbers are not right-aligned; change one to `---:` by hand for that.
- **Escaping beyond pipes.** Asterisks, underscores and backticks in a value are left alone, so a cell holding `*urgent*` renders in italics.
- **Anything a spreadsheet adds.** A CSV holds values only, with no formulas, colours or second sheet. For a workbook, drop the `.xlsx` itself here and the Excel converter reads it instead.

## An example

An order export with a comma, a line break and doubled quotes inside quoted fields, and a pipe in an unquoted one:

```csv
id,customer,note,total
1001,"Smith, Jane","Leave at the door
Ring twice",42.50
1002,"Acme ""North"" Ltd",,19.99
1003,Brown | Co,*urgent*,7.00
```

Saved as `orders.csv`, it becomes a `# orders` heading and this table:

```markdown
| id | customer | note | total |
| --- | --- | --- | --- |
| 1001 | Smith, Jane | Leave at the door<br>Ring twice | 42.50 |
| 1002 | Acme "North" Ltd |  | 19.99 |
| 1003 | Brown \| Co | *urgent* | 7.00 |
```

## Limits

- A file can be up to 10 MB. Several dropped at once count together towards that limit and become one document, each table under its own heading.
- The file is converted in your browser and is not uploaded. If you are signed in, the table reaches your account only when you press Save, and a saved document can be at most 4 MB.
- Shorter rows are padded with empty cells. A row longer than the header, often from a stray trailing comma, adds a column with an empty header.
- An empty file is refused with "That file has no rows in it."

## Questions

### How do I convert a CSV to a Markdown table?

Upload the file, or paste its text: cells copied out of a spreadsheet arrive tab-separated, and the tabs are picked up. The main button downloads a `.md` file, and the menu beside it has HTML, Word and plain text. [Converting a CSV to a Markdown table](/blog/convert-csv-to-markdown-table) goes through the files that usually go wrong.

### What does a Markdown table look like?

A header row, a separator row of dashes, then one line per row, with pipes between the cells. Tables come from GitHub Flavored Markdown, not core CommonMark, so a strictly CommonMark renderer shows the pipes as text. [Markdown tables that survive conversion](/blog/markdown-tables-that-survive-conversion) covers every way one breaks.

### Does it handle semicolons, tabs and quoted commas?

Yes: the delimiter is detected from the first line, a `.tsv` is always tab-separated, and anything inside a quoted field stays in its cell.

### My file has no header row. What happens?

The first row is always the header, and there is no setting to change that. Add a line of column names at the top before converting, or the first record will sit in the header.

### Why do accented letters come out garbled?

The file is read as UTF-8, so a CSV saved in an older encoding such as Windows-1252 loses its accented letters. Save it again as UTF-8, which Excel offers as "CSV UTF-8". [How to open a .csv file](/how-to/open-csv) covers the other import problems.

### Can it turn a Markdown table back into a CSV?

No. The downloads are Markdown, HTML, Word, plain text, EPUB and formats for Confluence, Jira and Slack; CSV is not among them.
