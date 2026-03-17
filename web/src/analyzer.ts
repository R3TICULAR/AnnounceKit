/**
 * Analyzer service — the sole business logic layer for the web app.
 *
 * This module is plain TypeScript with no Lit dependency. It is the only
 * file in web/src/ that imports from @core. All Lit components call into
 * this module indirectly via <ak-app>; they never import from @core directly.
 */

import {
  buildAccessibilityTree,
  buildAccessibilityTreeWithSelector,
  SelectorError,
} from '@core/extractor/tree-builder.js';
import { renderNVDA } from '@core/renderer/nvda-renderer.js';
import { renderJAWS } from '@core/renderer/jaws-renderer.js';
import { renderVoiceOver } from '@core/renderer/voiceover-renderer.js';
import { renderAuditReport } from '@core/renderer/audit-renderer.js';
import { diffAccessibilityTrees } from '@core/diff/diff-algorithm.js';
import { serializeModel, deserializeModel, modelsEqual } from '@core/model/serialization.js';
import type { AnnouncementModel } from '@core/model/types.js';
import type { SemanticDiff } from '@core/diff/types.js';
import { parseHTML, validateHTMLNotEmpty, ParsingError } from './browser-parser.js';
import { SIZE_LIMIT_BYTES } from './constants.js';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type { SemanticDiff };

/** One of the four screen reader options available in the UI. */
export type ScreenReaderOption = 'NVDA' | 'JAWS' | 'VoiceOver' | 'All';

/** Pre-rendered output for a single matched element. */
export interface AnalysisEntry {
  /** The canonical accessibility model for this element. */
  model: AnnouncementModel;
  /** Pre-rendered announcement text for each screen reader. */
  announcements: {
    nvda: string;
    jaws: string;
    voiceover: string;
  };
  /** Pre-rendered audit report text. */
  audit: string;
  /** Pretty-printed JSON of the canonical model. */
  json: string;
}

/** Full result returned by runAnalysis / runDiffAnalysis. */
export interface AnalysisResult {
  /** One entry per matched element (or one for full-document analysis). */
  entries: AnalysisEntry[];
  /** All warnings collected during parse + tree build. */
  warnings: Array<{ message: string }>;
  /** Semantic diff (only populated when runDiffAnalysis is used). */
  diff?: SemanticDiff;
}

/** Parameters for a standard analysis run. */
export interface AnalysisParams {
  html: string;
  cssSelector?: string;
}

/** Parameters for a diff analysis run. */
export interface DiffAnalysisParams {
  htmlBefore: string;
  htmlAfter: string;
  cssSelector?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Enforces the configurable size limit before any parsing occurs. */
function assertWithinSizeLimit(html: string): void {
  const byteLength = new TextEncoder().encode(html).length;
  if (byteLength > SIZE_LIMIT_BYTES) {
    throw new ParsingError(
      `HTML input exceeds the ${SIZE_LIMIT_BYTES / (1024 * 1024)} MB size limit ` +
        `(${(byteLength / (1024 * 1024)).toFixed(2)} MB). ` +
        `Reduce the input size or increase SIZE_LIMIT_BYTES in constants.ts.`
    );
  }
}

/** Builds an AnalysisEntry from a single AnnouncementModel. */
function buildEntry(model: AnnouncementModel): AnalysisEntry {
  return {
    model,
    announcements: {
      nvda: renderNVDA(model),
      jaws: renderJAWS(model),
      voiceover: renderVoiceOver(model),
    },
    audit: renderAuditReport(model),
    json: serializeModel(model, { pretty: true }),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Runs accessibility analysis on a single HTML string.
 *
 * @param params.html        - Raw HTML to analyse
 * @param params.cssSelector - Optional CSS selector to filter elements
 * @returns AnalysisResult with one entry per matched element
 * @throws ParsingError  if the HTML is empty or exceeds SIZE_LIMIT_BYTES
 * @throws SelectorError if the CSS selector is syntactically invalid or matches nothing
 */
export function runAnalysis(params: AnalysisParams): AnalysisResult {
  const { html, cssSelector } = params;

  validateHTMLNotEmpty(html);
  assertWithinSizeLimit(html);

  const { document, warnings: parseWarnings } = parseHTML(html);
  const allWarnings: Array<{ message: string }> = parseWarnings.map((w) => ({
    message: w.message,
  }));

  let entries: AnalysisEntry[];

  if (cssSelector) {
    const results = buildAccessibilityTreeWithSelector(document.body, cssSelector);

    if (results.length === 0) {
      throw new SelectorError(
        `No elements match selector: "${cssSelector}"`
      );
    }

    entries = results.map((r) => {
      allWarnings.push(...r.warnings.map((w) => ({ message: w.message })));
      return buildEntry(r.model);
    });
  } else {
    const result = buildAccessibilityTree(document.body);
    allWarnings.push(...result.warnings.map((w) => ({ message: w.message })));
    entries = [buildEntry(result.model)];
  }

  return { entries, warnings: allWarnings };
}

/**
 * Runs a semantic diff between two HTML strings.
 *
 * @param params.htmlBefore  - The "before" HTML
 * @param params.htmlAfter   - The "after" HTML
 * @param params.cssSelector - Optional CSS selector applied to both inputs
 * @returns AnalysisResult with entries for the "after" HTML and a diff field
 * @throws ParsingError  if either HTML is empty or exceeds SIZE_LIMIT_BYTES
 * @throws SelectorError if the CSS selector is invalid or matches nothing in either input
 */
export function runDiffAnalysis(params: DiffAnalysisParams): AnalysisResult {
  const { htmlBefore, htmlAfter, cssSelector } = params;

  const beforeResult = runAnalysis({ html: htmlBefore, cssSelector });
  const afterResult = runAnalysis({ html: htmlAfter, cssSelector });

  // Diff the root nodes of the first entry from each side.
  const diff = diffAccessibilityTrees(
    beforeResult.entries[0].model.root,
    afterResult.entries[0].model.root
  );

  return {
    entries: afterResult.entries,
    warnings: [...beforeResult.warnings, ...afterResult.warnings],
    diff,
  };
}

/**
 * Validates that a model survives a JSON round-trip without data loss.
 *
 * Used by the optional validation mode and property tests.
 *
 * @param model - Model to validate
 * @returns true if the round-trip produces an equivalent model
 */
export function validateRoundTrip(model: AnnouncementModel): boolean {
  const json = serializeModel(model, { pretty: false });
  const restored = deserializeModel(json);
  return modelsEqual(model, restored);
}
