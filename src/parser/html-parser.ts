/**
 * HTML parsing using jsdom.
 * 
 * Provides lenient parsing with error recovery for malformed HTML.
 */

import { JSDOM } from 'jsdom';

/**
 * Parsing error class.
 */
export class ParsingError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'ParsingError';
  }
}

/**
 * Parsing warning.
 */
export interface ParsingWarning {
  message: string;
  line?: number;
  column?: number;
}

/**
 * Result of HTML parsing.
 */
export interface ParseResult {
  /** Parsed DOM document */
  document: Document;
  
  /** Warnings encountered during parsing */
  warnings: ParsingWarning[];
}

/**
 * Parses HTML string into a DOM document.
 * 
 * Uses jsdom with lenient parsing mode to handle malformed HTML.
 * Emits warnings for issues but continues processing.
 * 
 * @param html - HTML string to parse
 * @returns Parse result with document and warnings
 * @throws ParsingError if parsing fails completely
 */
export function parseHTML(html: string): ParseResult {
  const warnings: ParsingWarning[] = [];

  try {
    // Create JSDOM instance with lenient parsing
    const dom = new JSDOM(html, {
      contentType: 'text/html',
      // Include useful defaults for accessibility tree extraction
      includeNodeLocations: false,
      storageQuota: 0,
    });

    const document = dom.window.document;

    // Check for parsing errors in the document
    // jsdom doesn't expose parse errors directly, but we can check for common issues
    if (!document.documentElement) {
      warnings.push({
        message: 'Document has no root element. HTML may be severely malformed.',
      });
    }

    // Check if body exists (should be created even for empty HTML)
    if (!document.body) {
      warnings.push({
        message: 'Document has no body element. HTML may be malformed.',
      });
    }

    return {
      document,
      warnings,
    };
  } catch (error) {
    // jsdom parsing failed completely
    throw new ParsingError(
      `Failed to parse HTML: ${error instanceof Error ? error.message : String(error)}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Parses HTML and returns just the document (throws on warnings).
 * 
 * Convenience function for cases where warnings should be treated as errors.
 * 
 * @param html - HTML string to parse
 * @returns Parsed DOM document
 * @throws ParsingError if parsing fails or warnings are present
 */
export function parseHTMLStrict(html: string): Document {
  const result = parseHTML(html);

  if (result.warnings.length > 0) {
    const warningMessages = result.warnings.map((w) => w.message).join('; ');
    throw new ParsingError(`HTML parsing warnings: ${warningMessages}`);
  }

  return result.document;
}

/**
 * Validates that HTML string is not empty.
 * 
 * @param html - HTML string to validate
 * @throws ParsingError if HTML is empty or whitespace-only
 */
export function validateHTMLNotEmpty(html: string): void {
  if (!html || html.trim().length === 0) {
    throw new ParsingError('HTML input is empty or contains only whitespace');
  }
}
