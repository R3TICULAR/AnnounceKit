/**
 * AnnounceKit CLI entry point.
 * 
 * Command-line interface for analyzing HTML accessibility announcements.
 */

import { Command } from 'commander';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { 
  validateOptions, 
  parseInput, 
  validateInput, 
  validateDiffMode,
  validateBatchMode
} from './cli/options.js';
import { readHTML, writeOutput, FileIOError } from './cli/io.js';
import { processHTML, processBatch, formatWarnings } from './cli/orchestrator.js';
import { isColorEnabled } from './cli/colors.js';

// Get package.json for version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8')
);

const program = new Command();

program
  .name('announcekit')
  .description('Analyze HTML accessibility announcements and generate screen reader output')
  .version(packageJson.version, '-v, --version', 'Output the current version')
  .helpOption('-h, --help', 'Display help for command');

// Main command with input argument
program
  .argument('[input...]', 'HTML file path(s) or "-" for stdin')
  .option('-o, --output <path>', 'Output file path (default: stdout)')
  .option(
    '-f, --format <format>',
    'Output format: json, text, audit, or both (default: json)',
    'json'
  )
  .option(
    '-s, --screen-reader <reader>',
    'Screen reader: nvda, jaws, voiceover, or all (default: nvda)',
    'nvda'
  )
  .option(
    '--selector <selector>',
    'CSS selector to filter elements'
  )
  .option(
    '--validate',
    'Validate round-trip serialization'
  )
  .option(
    '--diff <file>',
    'Compare with another HTML file (semantic diff mode)'
  )
  .option(
    '--batch',
    'Process multiple files in batch mode'
  )
  .action(async (input, rawOptions) => {
    try {
      // Parse and validate options
      const options = validateOptions(rawOptions);
      const parsedInput = parseInput(input);
      
      // Validate input
      validateInput(parsedInput);
      
      // Validate diff mode
      validateDiffMode(options, parsedInput);
      
      // Validate batch mode
      validateBatchMode(options, parsedInput);
      
      // Handle batch mode
      if (options.batch && parsedInput.inputs && parsedInput.inputs.length > 0) {
        const result = processBatch(parsedInput.inputs, options);
        
        // Write output
        writeOutput(result.output, options.output);
        
        // Display warnings to stderr
        if (result.warnings.length > 0) {
          console.error(formatWarnings(result.warnings, isColorEnabled(process.stderr)));
        }
        
        // Exit with appropriate code
        process.exit(result.exitCode);
        return;
      }
      
      // Read HTML input
      const htmlResult = readHTML(parsedInput.input, parsedInput.isStdin);
      const html = await Promise.resolve(htmlResult);
      
      // Read diff HTML if in diff mode
      let diffHTML: string | undefined;
      if (options.diff) {
        diffHTML = readHTML(options.diff, false) as string;
      }
      
      // Process HTML
      const result = processHTML(html, options, diffHTML);
      
      // Write output
      writeOutput(result.output, options.output);
      
      // Display warnings to stderr
      if (result.warnings.length > 0) {
        console.error(formatWarnings(result.warnings, isColorEnabled(process.stderr)));
      }
      
      // Exit with appropriate code
      process.exit(result.exitCode);
    } catch (error) {
      if (error instanceof FileIOError) {
        console.error(`Error: ${error.message}`);
        process.exit(3); // System error
      }
      
      if (error instanceof Error) {
        console.error(`Error: ${error.message}`);
        process.exit(1); // User error
      }
      
      throw error;
    }
  });

// Add usage examples to help
program.addHelpText('after', `

Examples:
  $ announcekit input.html
  $ announcekit input.html -f text -s nvda
  $ announcekit input.html -f both -s all
  $ announcekit input.html --selector "button"
  $ announcekit input.html --diff old.html
  $ announcekit --batch file1.html file2.html file3.html
  $ cat input.html | announcekit -
  $ announcekit input.html -o output.json
  $ announcekit input.html -f audit

Screen Readers:
  nvda       - NVDA (Windows)
  jaws       - JAWS (Windows)
  voiceover  - VoiceOver (macOS)
  all        - All screen readers

Output Formats:
  json       - Semantic model as JSON
  text       - Screen reader announcement text
  audit      - Developer-friendly audit report
  both       - Both JSON and text

Notes:
  - Screen reader output is heuristic and may differ from actual behavior
  - Use --validate to check serialization round-trip integrity
  - Use --diff to detect accessibility changes between versions
  - Use --batch to process multiple files (continues on individual errors)
`);

program.parse();

