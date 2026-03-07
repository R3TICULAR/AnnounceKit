/**
 * CLI option types and validation.
 */

export type OutputFormat = 'json' | 'text' | 'audit' | 'both';
export type ScreenReader = 'nvda' | 'jaws' | 'voiceover' | 'all';

export interface CLIOptions {
  /** Output file path (undefined = stdout) */
  output?: string;
  
  /** Output format */
  format: OutputFormat;
  
  /** Screen reader to simulate */
  screenReader: ScreenReader;
  
  /** CSS selector to filter elements */
  selector?: string;
  
  /** Enable round-trip validation */
  validate: boolean;
  
  /** Second HTML file for diff mode */
  diff?: string;
  
  /** Enable batch processing mode */
  batch: boolean;
}

export interface ParsedInput {
  /** Input source: file path, stdin, or undefined */
  input?: string;
  
  /** Whether input is from stdin */
  isStdin: boolean;
  
  /** Multiple input files for batch mode */
  inputs?: string[];
}

/**
 * Validates and normalizes CLI options.
 * 
 * @param rawOptions - Raw options from Commander
 * @returns Validated options
 * @throws Error if options are invalid
 */
export function validateOptions(rawOptions: any): CLIOptions {
  const format = rawOptions.format as string;
  const screenReader = rawOptions.screenReader as string;
  
  // Validate format
  const validFormats: OutputFormat[] = ['json', 'text', 'audit', 'both'];
  if (!validFormats.includes(format as OutputFormat)) {
    throw new Error(
      `Invalid format: ${format}. Must be one of: ${validFormats.join(', ')}`
    );
  }
  
  // Validate screen reader
  const validReaders: ScreenReader[] = ['nvda', 'jaws', 'voiceover', 'all'];
  if (!validReaders.includes(screenReader as ScreenReader)) {
    throw new Error(
      `Invalid screen reader: ${screenReader}. Must be one of: ${validReaders.join(', ')}`
    );
  }
  
  return {
    output: rawOptions.output,
    format: format as OutputFormat,
    screenReader: screenReader as ScreenReader,
    selector: rawOptions.selector,
    validate: rawOptions.validate || false,
    diff: rawOptions.diff,
    batch: rawOptions.batch || false,
  };
}

/**
 * Parses and validates input argument(s).
 * 
 * @param input - Input argument from Commander (can be array in batch mode)
 * @returns Parsed input information
 */
export function parseInput(input?: string | string[]): ParsedInput {
  // Handle array input (batch mode)
  if (Array.isArray(input)) {
    if (input.length === 0) {
      return {
        input: undefined,
        isStdin: false,
        inputs: [],
      };
    }
    
    // Check if any input is stdin
    if (input.includes('-')) {
      throw new Error('Batch mode cannot be used with stdin input');
    }
    
    return {
      input: undefined,
      isStdin: false,
      inputs: input,
    };
  }
  
  // Handle single input
  if (!input) {
    return {
      input: undefined,
      isStdin: false,
    };
  }
  
  if (input === '-') {
    return {
      input: undefined,
      isStdin: true,
    };
  }
  
  return {
    input,
    isStdin: false,
  };
}

/**
 * Validates that required input is provided.
 * 
 * @param parsedInput - Parsed input information
 * @throws Error if no input is provided
 */
export function validateInput(parsedInput: ParsedInput): void {
  const hasInputs = parsedInput.inputs && parsedInput.inputs.length > 0;
  
  if (!parsedInput.input && !parsedInput.isStdin && !hasInputs) {
    throw new Error(
      'No input provided. Specify an HTML file path or use "-" for stdin.'
    );
  }
}

/**
 * Validates diff mode requirements.
 * 
 * @param options - CLI options
 * @param parsedInput - Parsed input information
 * @throws Error if diff mode is invalid
 */
export function validateDiffMode(
  options: CLIOptions,
  parsedInput: ParsedInput
): void {
  if (options.diff) {
    if (parsedInput.isStdin) {
      throw new Error('Diff mode cannot be used with stdin input');
    }
    
    if (!parsedInput.input) {
      throw new Error('Diff mode requires an input file');
    }
    
    if (parsedInput.inputs && parsedInput.inputs.length > 0) {
      throw new Error('Diff mode cannot be used with batch mode');
    }
  }
}

/**
 * Validates batch mode requirements.
 * 
 * @param options - CLI options
 * @param parsedInput - Parsed input information
 * @throws Error if batch mode is invalid
 */
export function validateBatchMode(
  options: CLIOptions,
  parsedInput: ParsedInput
): void {
  if (options.batch) {
    if (parsedInput.isStdin) {
      throw new Error('Batch mode cannot be used with stdin input');
    }
    
    if (options.diff) {
      throw new Error('Batch mode cannot be used with diff mode');
    }
    
    if (!parsedInput.inputs || parsedInput.inputs.length === 0) {
      throw new Error('Batch mode requires multiple input files');
    }
  }
}
