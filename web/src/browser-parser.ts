/**
 * Browser-compatible HTML parser adapter.
 *
 * Drop-in replacement for `src/parser/html-parser.ts` that uses the browser's
 * native DOMParser API instead of jsdom. Exposes the same ParseResult interface
 * so the extractor module requires zero changes.
 *
 * All types are defined locally — no imports from the Node.js module — so
 * jsdom is never pulled into the browser bundle.
 */

// ---------------------------------------------------------------------------
// Types (mirrored from src/parser/html-parser.ts)
// ---------------------------------------------------------------------------

export interface ParsingWarning {
  message: string;
  line?: number;
  column?: number;
}

export interface ParseResult {
  document: Document;
  warnings: ParsingWarning[];
}

/**
 * Thrown when HTML input is empty or parsing fails completely.
 * Mirrors the class in src/parser/html-parser.ts.
 */
export class ParsingError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ParsingError';
  }
}

/**
 * Validates that an HTML string is not empty or whitespace-only.
 * @throws ParsingError if the string is empty.
 */
export function validateHTMLNotEmpty(html: string): void {
  if (!html || html.trim().length === 0) {
    throw new ParsingError('HTML input is empty or contains only whitespace');
  }
}

// ---------------------------------------------------------------------------
// Browser DOMParser adapter
// ---------------------------------------------------------------------------

/**
 * Parses an HTML string into a DOM document using the browser's native DOMParser.
 */
export function parseHTML(html: string): ParseResult {
  const warnings: ParsingWarning[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    warnings.push({
      message: `Parser error: ${parserError.textContent?.trim() ?? 'unknown error'}`,
    });
  }

  if (!doc.documentElement) {
    warnings.push({ message: 'Document has no root element. HTML may be severely malformed.' });
  }

  if (!doc.body) {
    warnings.push({ message: 'Document has no body element. HTML may be malformed.' });
  }

  return { document: doc, warnings };
}
