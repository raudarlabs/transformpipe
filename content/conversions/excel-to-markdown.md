## What comes across

Every sheet with at least one filled row becomes a Markdown table, in workbook order, hidden sheets included. One such sheet gives one table under a heading made from the file name. Two or more give that heading and a list of the sheet names, then each sheet under its own heading, separated by horizontal rules.

The first row of each sheet becomes the header row, and shorter rows are padded with empty cells.

| In the workbook | In the Markdown |
| --- | --- |
| Text | The text, trimmed at both ends |
| A number | The stored value: `1250`, not `£1,250.00` |
| A date | An ISO date such as `2026-07-14` |
| TRUE and FALSE | `true` and `false` |
| A formula | The result saved with the file |
| A line break in a cell | `<br>` |
| A pipe character | Escaped, so it does not end the cell |
| An empty row between rows | A row of empty cells |

## What is left behind

Anything that is not a value. Number formats go first: currency symbols, thousands separators, chosen decimal places and percentages, so 10% comes out as `0.1`. A date with a time keeps only the date, and a time on its own comes out as the date `1899-12-30`. Fonts, colours, borders, column widths, conditional formatting, comments, charts and pictures are not read.

A merged cell keeps its value in the first cell, and the cells it covered come out empty. A link keeps its words and loses its address. A formula that ended in an error such as `#DIV/0!` gives an empty cell.

Asterisks and underscores in a cell are not escaped, so `**draft**` shows in bold once rendered.

## An example

`q3-budget.xlsx` has three sheets. "Q3 budget" holds two purchases with dates, costs formatted in pounds and a TRUE or FALSE column, one name broken over two lines, and a total row of `=SUM(D2:D3)`. "Suppliers" has a pipe in one name and a discount formatted as a percentage. The third sheet is empty.

  ```markdown
  # q3-budget

  - Q3 budget
  - Suppliers

  ---

  # Q3 budget

  | Item | Owner | Due | Cost | Approved |
  | --- | --- | --- | --- | --- |
  | Laptop stands | Priya | 2026-07-14 | 1250 | true |
  | Monitor arms<br>(pair) | Sam | 2026-08-01 | 480.5 | false |
  | Total |  |  | 1730.5 |  |

  ---

  # Suppliers

  | Supplier | Lead time | Discount |
  | --- | --- | --- |
  | Ergodesk \| UK | 5 days | 0.1 |
  | Northlight | 2 weeks |  |
  ```

The empty sheet, the pound signs and the percentage are gone, and the total is the figure Excel saved.

## Limits

A file can be up to 50 MB. Several workbooks dropped together share that 50 MB and become one document.

The page takes `.xlsx` only: `.xls`, `.xlsm` and `.ods` are refused, so save a copy as `.xlsx` first. A `.csv` dropped here goes to the CSV converter instead. A chart sheet, a chart moved to a sheet of its own, currently makes the conversion fail with an error, so delete it from a copy first; a chart on an ordinary sheet is simply skipped.

A title or blank row above the column names becomes the header, and data that starts lower down or further right keeps the empty rows and columns before it. Delete them before converting; empty rows and columns after the data are dropped.

Signed in, a document you save can hold up to 4 MB of Markdown. Opening an `.xlsx` without Excel is covered in [how to open an .xlsx file](/how-to/open-xlsx), and what CSV and copy and paste lose instead in [Excel to Markdown table: every route](/blog/convert-excel-to-markdown-table).

## Questions

### How do I convert Excel to Markdown?

Drop the `.xlsx` on this page or choose it with the button. The tables appear on screen, ready to copy or to download as a `.md` file named after the workbook.

### Does it convert every sheet, including hidden ones?

Yes, every sheet with a filled row, in workbook order. There is no way to pick one sheet, so delete the others from a copy of the file if you want only one.

### Are formulas kept?

No, only their results: each formula cell gives the value Excel stored when the file was last saved. A workbook written by a script that never calculated its formulas gives empty cells instead.

### Can it turn a Markdown table into Excel?

No. Nothing here writes `.xlsx` or `.csv`; the downloads are Markdown, HTML, plain text, Word, EPUB and the Confluence, Jira and Slack formats.

### Is the workbook uploaded?

No. It is unpacked and converted in your browser, and the file never leaves your computer. Nothing from it is sent unless you are signed in and press Save, which keeps the Markdown, not the workbook.
