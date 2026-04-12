/**
 * CLI orchestration - wires all components together.
 */

import { parseHTML } from '../parser/index.js';
import { buildAccessibilityTree, buildAccessibilityTreeWithSelector } from '../extractor/index.js';
import { serializeModel, deserializeModel, modelsEqual } from '../model/serialization.js';
import { renderNVDA } from '../renderer/nvda-renderer.js';
import { renderJAWS } from '../renderer/jaws-renderer.js';
import { renderVoiceOver } from '../renderer/voiceover-renderer.js';
import { renderAuditReport } from '../renderer/audit-renderer.js';
import { diffAccessibilityTrees, formatDiffAsJSON, formatDiffAsText } from '../diff/index.js';
import { isColorEnabled, createColors } from './colors.js';
import type { CLIOptions } from './options.js';
import type { AnnouncementModel } from '../model/types.js';

export interface ProcessResult {
  /** Output content to write */
  output: string;
  
  /** Exit code */
  exitCode: number;
  
  /** Warnings encountered during processing */
  warnings: string[];
}

export interface BatchResult {
  /** File path that was processed */
  filePath: string;
  
  /** Whether processing succeeded */
  success: boolean;
  
  /** Output content (if successful) */
  output?: string;
  
  /** Error message (if failed) */
  error?: string;
  
  /** Warnings encountered */
  warnings: string[];
}

export interface BatchProcessResult {
  /** Results for each file */
  results: BatchResult[];
  
  /** Combined output */
  output: string;
  
  /** Exit code (0 if all succeeded, 2 if any failed) */
  exitCode: number;
  
  /** All warnings */
  warnings: string[];
}

/**
 * Processes HTML input and generates output based on options.
 * 
 * @param html - HTML content to process
 * @param options - CLI options
 * @param diffHTML - Optional second HTML for diff mode
 * @returns Process result with output and exit code
 */
export function processHTML(
  html: string,
  options: CLIOptions,
  diffHTML?: string
): ProcessResult {
  const warnings: string[] = [];
  
  // Determine whether to colorize output:
  // Colors only when stdout is a TTY, format is not JSON, and output is not going to a file
  const colorize = isColorEnabled(process.stdout) && options.format !== 'json' && !options.output;
  
  try {
    // Handle diff mode
    if (options.diff && diffHTML) {
      return processDiff(html, diffHTML, options, warnings, colorize);
    }
    
    // Handle validation mode
    if (options.validate) {
      return processValidation(html, options, warnings);
    }
    
    // Normal processing mode
    return processNormal(html, options, warnings, colorize);
  } catch (error) {
    if (error instanceof Error) {
      return {
        output: `Error: ${error.message}`,
        exitCode: 2, // Content error
        warnings,
      };
    }
    throw error;
  }
}

/**
 * Processes HTML in normal mode (extract and render).
 */
function processNormal(
  html: string,
  options: CLIOptions,
  warnings: string[],
  colorize: boolean
): ProcessResult {
  // Parse HTML
  const doc = parseHTML(html);
  
  // Collect warnings from parser
  if (doc.warnings.length > 0) {
    warnings.push(...doc.warnings.map(w => w.message));
  }
  
  // Build accessibility tree
  let model: AnnouncementModel;
  
  if (options.selector) {
    // Use selector filtering
    const results = buildAccessibilityTreeWithSelector(doc.document.body, options.selector);
    
    if (results.length === 0) {
      return {
        output: `Error: No elements match selector: ${options.selector}`,
        exitCode: 2,
        warnings,
      };
    }
    
    // Use first matching element
    model = results[0].model;
    
    // Collect warnings
    for (const result of results) {
      if (result.warnings.length > 0) {
        warnings.push(...result.warnings.map(w => w.message));
      }
    }
  } else {
    // Build tree from body
    const result = buildAccessibilityTree(doc.document.body);
    model = result.model;
    
    if (result.warnings.length > 0) {
      warnings.push(...result.warnings.map(w => w.message));
    }
  }
  
  // Generate output based on format
  const output = formatOutput(model, options, colorize);
  
  return {
    output,
    exitCode: 0,
    warnings,
  };
}

/**
 * Processes HTML in diff mode.
 */
function processDiff(
  html1: string,
  html2: string,
  options: CLIOptions,
  warnings: string[],
  _colorize: boolean
): ProcessResult {
  // Parse both HTML files
  const doc1 = parseHTML(html1);
  const doc2 = parseHTML(html2);
  
  // Collect warnings
  warnings.push(...doc1.warnings.map(w => w.message), ...doc2.warnings.map(w => w.message));
  
  // Build accessibility trees
  const result1 = buildAccessibilityTree(doc1.document.body);
  const result2 = buildAccessibilityTree(doc2.document.body);
  
  warnings.push(...result1.warnings.map(w => w.message), ...result2.warnings.map(w => w.message));
  
  // Compute diff
  const diff = diffAccessibilityTrees(result1.model.root, result2.model.root);
  
  // Format diff output
  let output: string;
  if (options.format === 'json') {
    output = formatDiffAsJSON(diff);
  } else {
    output = formatDiffAsText(diff);
  }
  
  return {
    output,
    exitCode: 0,
    warnings,
  };
}

/**
 * Processes HTML in validation mode.
 */
function processValidation(
  html: string,
  _options: CLIOptions,
  warnings: string[]
): ProcessResult {
  // Parse and extract
  const doc = parseHTML(html);
  warnings.push(...doc.warnings.map(w => w.message));
  
  const result = buildAccessibilityTree(doc.document.body);
  warnings.push(...result.warnings.map(w => w.message));
  
  const model = result.model;
  
  // Serialize
  const serialized = serializeModel(model);
  
  // Deserialize
  const deserialized = deserializeModel(serialized);
  
  // Compare
  const isEqual = modelsEqual(model, deserialized);
  
  if (isEqual) {
    return {
      output: 'Validation passed: Model serialization is consistent',
      exitCode: 0,
      warnings,
    };
  } else {
    return {
      output: 'Validation failed: Model serialization is inconsistent',
      exitCode: 2,
      warnings,
    };
  }
}

/**
 * Formats output based on format option.
 */
function formatOutput(model: AnnouncementModel, options: CLIOptions, colorize: boolean): string {
  const { format, screenReader } = options;
  
  // Handle audit format
  if (format === 'audit') {
    return renderAuditReport(model, colorize);
  }
  
  // Handle JSON format
  if (format === 'json') {
    return serializeModel(model);
  }
  
  // Handle text format
  if (format === 'text') {
    return formatScreenReaderOutput(model, screenReader, colorize);
  }
  
  // Handle both format
  if (format === 'both') {
    const json = serializeModel(model);
    const text = formatScreenReaderOutput(model, screenReader, colorize);
    const c = createColors(colorize);
    return `${c.sectionHeader('=== JSON Output ===')}\n${json}\n\n${c.sectionHeader('=== Screen Reader Output ===')}\n${text}`;
  }
  
  throw new Error(`Unknown format: ${format}`);
}

/**
 * Formats screen reader output based on selected reader(s).
 */
function formatScreenReaderOutput(
  model: AnnouncementModel,
  screenReader: string,
  colorize: boolean
): string {
  if (screenReader === 'all') {
    const nvda = renderNVDA(model, colorize);
    const jaws = renderJAWS(model, colorize);
    const voiceover = renderVoiceOver(model, colorize);
    const c = createColors(colorize);
    
    return [
      c.sectionHeader('=== NVDA ==='),
      nvda,
      '',
      c.sectionHeader('=== JAWS ==='),
      jaws,
      '',
      c.sectionHeader('=== VoiceOver ==='),
      voiceover,
    ].join('\n');
  }
  
  switch (screenReader) {
    case 'nvda':
      return renderNVDA(model, colorize);
    case 'jaws':
      return renderJAWS(model, colorize);
    case 'voiceover':
      return renderVoiceOver(model, colorize);
    default:
      throw new Error(`Unknown screen reader: ${screenReader}`);
  }
}

/**
 * Formats warnings for display.
 */
export function formatWarnings(warnings: string[], colorize?: boolean): string {
  if (warnings.length === 0) {
    return '';
  }
  
  const c = createColors(colorize ?? false);
  
  const header = colorize
    ? c.warning(c.bold('=== Warnings ==='))
    : '=== Warnings ===';
  
  const lines = [
    '',
    header,
    ...warnings.map(w => colorize ? `${c.warning('⚠️')}  ${w}` : `⚠️  ${w}`),
    '',
  ];
  
  return lines.join('\n');
}

/**
 * Processes multiple HTML files in batch mode.
 * 
 * @param filePaths - Array of file paths to process
 * @param options - CLI options
 * @returns Batch process result with all outputs
 */
export function processBatch(
  filePaths: string[],
  options: CLIOptions
): BatchProcessResult {
  const results: BatchResult[] = [];
  const allWarnings: string[] = [];
  let anyFailed = false;
  
  // Process each file independently
  for (const filePath of filePaths) {
    try {
      // Read HTML from file
      const { readFileSync } = require('fs');
      const html = readFileSync(filePath, 'utf-8');
      
      // Process HTML
      const result = processHTML(html, options);
      
      results.push({
        filePath,
        success: result.exitCode === 0,
        output: result.output,
        warnings: result.warnings,
      });
      
      allWarnings.push(...result.warnings);
      
      if (result.exitCode !== 0) {
        anyFailed = true;
      }
    } catch (error) {
      // Continue processing other files on error
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      results.push({
        filePath,
        success: false,
        error: errorMessage,
        warnings: [],
      });
      
      anyFailed = true;
    }
  }
  
  // Format combined output
  const output = formatBatchOutput(results, options);
  
  return {
    results,
    output,
    exitCode: anyFailed ? 2 : 0,
    warnings: allWarnings,
  };
}

/**
 * Formats batch processing results.
 */
function formatBatchOutput(results: BatchResult[], _options: CLIOptions): string {
  const lines: string[] = [];
  
  // Add header
  lines.push('=== Batch Processing Results ===');
  lines.push('');
  
  // Add results for each file
  for (const result of results) {
    lines.push(`File: ${result.filePath}`);
    
    if (result.success) {
      lines.push('Status: ✓ Success');
      
      if (result.warnings.length > 0) {
        lines.push(`Warnings: ${result.warnings.length}`);
      }
      
      lines.push('');
      lines.push('--- Output ---');
      lines.push(result.output || '');
    } else {
      lines.push('Status: ✗ Failed');
      lines.push(`Error: ${result.error}`);
    }
    
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  
  // Add summary
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  lines.push('=== Summary ===');
  lines.push(`Total files: ${results.length}`);
  lines.push(`Successful: ${successCount}`);
  lines.push(`Failed: ${failCount}`);
  
  return lines.join('\n');
}
