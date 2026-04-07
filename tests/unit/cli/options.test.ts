/**
 * Unit tests for CLI option parsing and validation.
 */

import { describe, it, expect } from 'vitest';
import {
  validateOptions,
  parseInput,
  validateInput,
  validateDiffMode,
  type CLIOptions,
  type ParsedInput,
} from '../../../src/cli/options.js';

describe('validateOptions', () => {
  it('should validate and return valid options with defaults', () => {
    const rawOptions = {
      format: 'json',
      screenReader: 'nvda',
      validate: false,
    };

    const options = validateOptions(rawOptions);

    expect(options).toEqual({
      output: undefined,
      format: 'json',
      screenReader: 'nvda',
      selector: undefined,
      validate: false,
      diff: undefined,
      batch: false,
    });
  });

  it('should validate all format options', () => {
    const formats = ['json', 'text', 'audit', 'both'];

    for (const format of formats) {
      const rawOptions = {
        format,
        screenReader: 'nvda',
      };

      const options = validateOptions(rawOptions);
      expect(options.format).toBe(format);
    }
  });

  it('should validate all screen reader options', () => {
    const readers = ['nvda', 'jaws', 'voiceover', 'all'];

    for (const reader of readers) {
      const rawOptions = {
        format: 'json',
        screenReader: reader,
      };

      const options = validateOptions(rawOptions);
      expect(options.screenReader).toBe(reader);
    }
  });

  it('should throw error for invalid format', () => {
    const rawOptions = {
      format: 'invalid',
      screenReader: 'nvda',
    };

    expect(() => validateOptions(rawOptions)).toThrow(
      'Invalid format: invalid. Must be one of: json, text, audit, both'
    );
  });

  it('should throw error for invalid screen reader', () => {
    const rawOptions = {
      format: 'json',
      screenReader: 'invalid',
    };

    expect(() => validateOptions(rawOptions)).toThrow(
      'Invalid screen reader: invalid. Must be one of: nvda, jaws, voiceover, all'
    );
  });

  it('should include output path when provided', () => {
    const rawOptions = {
      format: 'json',
      screenReader: 'nvda',
      output: 'output.json',
    };

    const options = validateOptions(rawOptions);
    expect(options.output).toBe('output.json');
  });

  it('should include selector when provided', () => {
    const rawOptions = {
      format: 'json',
      screenReader: 'nvda',
      selector: 'button',
    };

    const options = validateOptions(rawOptions);
    expect(options.selector).toBe('button');
  });

  it('should set validate flag when provided', () => {
    const rawOptions = {
      format: 'json',
      screenReader: 'nvda',
      validate: true,
    };

    const options = validateOptions(rawOptions);
    expect(options.validate).toBe(true);
  });

  it('should include diff file when provided', () => {
    const rawOptions = {
      format: 'json',
      screenReader: 'nvda',
      diff: 'old.html',
    };

    const options = validateOptions(rawOptions);
    expect(options.diff).toBe('old.html');
  });
});

describe('parseInput', () => {
  it('should parse file path input', () => {
    const parsed = parseInput('input.html');

    expect(parsed).toEqual({
      input: 'input.html',
      isStdin: false,
    });
  });

  it('should parse stdin indicator', () => {
    const parsed = parseInput('-');

    expect(parsed).toEqual({
      input: undefined,
      isStdin: true,
    });
  });

  it('should handle undefined input', () => {
    const parsed = parseInput(undefined);

    expect(parsed).toEqual({
      input: undefined,
      isStdin: false,
    });
  });

  it('should handle empty string input', () => {
    const parsed = parseInput('');

    expect(parsed).toEqual({
      input: undefined,
      isStdin: false,
    });
  });

  it('should parse relative file paths', () => {
    const parsed = parseInput('./test/input.html');

    expect(parsed).toEqual({
      input: './test/input.html',
      isStdin: false,
    });
  });

  it('should parse absolute file paths', () => {
    const parsed = parseInput('/absolute/path/input.html');

    expect(parsed).toEqual({
      input: '/absolute/path/input.html',
      isStdin: false,
    });
  });
});

describe('validateInput', () => {
  it('should not throw for valid file input', () => {
    const parsedInput: ParsedInput = {
      input: 'input.html',
      isStdin: false,
    };

    expect(() => validateInput(parsedInput)).not.toThrow();
  });

  it('should not throw for stdin input', () => {
    const parsedInput: ParsedInput = {
      input: undefined,
      isStdin: true,
    };

    expect(() => validateInput(parsedInput)).not.toThrow();
  });

  it('should throw error when no input provided', () => {
    const parsedInput: ParsedInput = {
      input: undefined,
      isStdin: false,
    };

    expect(() => validateInput(parsedInput)).toThrow(
      'No input provided. Specify an HTML file path or use "-" for stdin.'
    );
  });
});

describe('validateDiffMode', () => {
  it('should not throw for valid diff mode', () => {
    const options: CLIOptions = {
      format: 'json',
      screenReader: 'nvda',
      validate: false,
      diff: 'old.html',
    };

    const parsedInput: ParsedInput = {
      input: 'new.html',
      isStdin: false,
    };

    expect(() => validateDiffMode(options, parsedInput)).not.toThrow();
  });

  it('should not throw when diff is not used', () => {
    const options: CLIOptions = {
      format: 'json',
      screenReader: 'nvda',
      validate: false,
    };

    const parsedInput: ParsedInput = {
      input: 'input.html',
      isStdin: false,
    };

    expect(() => validateDiffMode(options, parsedInput)).not.toThrow();
  });

  it('should throw error when diff mode used with stdin', () => {
    const options: CLIOptions = {
      format: 'json',
      screenReader: 'nvda',
      validate: false,
      diff: 'old.html',
    };

    const parsedInput: ParsedInput = {
      input: undefined,
      isStdin: true,
    };

    expect(() => validateDiffMode(options, parsedInput)).toThrow(
      'Diff mode cannot be used with stdin input'
    );
  });

  it('should throw error when diff mode used without input file', () => {
    const options: CLIOptions = {
      format: 'json',
      screenReader: 'nvda',
      validate: false,
      diff: 'old.html',
    };

    const parsedInput: ParsedInput = {
      input: undefined,
      isStdin: false,
    };

    expect(() => validateDiffMode(options, parsedInput)).toThrow(
      'Diff mode requires an input file'
    );
  });
});

describe('integration tests', () => {
  it('should validate complete valid configuration', () => {
    const rawOptions = {
      format: 'both',
      screenReader: 'all',
      output: 'output.json',
      selector: '.button',
      validate: true,
      diff: 'old.html',
    };

    const options = validateOptions(rawOptions);
    const parsedInput = parseInput('new.html');

    expect(() => validateInput(parsedInput)).not.toThrow();
    expect(() => validateDiffMode(options, parsedInput)).not.toThrow();

    expect(options).toEqual({
      format: 'both',
      screenReader: 'all',
      output: 'output.json',
      selector: '.button',
      validate: true,
      diff: 'old.html',
      batch: false,
    });

    expect(parsedInput).toEqual({
      input: 'new.html',
      isStdin: false,
    });
  });

  it('should validate stdin configuration', () => {
    const rawOptions = {
      format: 'text',
      screenReader: 'nvda',
    };

    const options = validateOptions(rawOptions);
    const parsedInput = parseInput('-');

    expect(() => validateInput(parsedInput)).not.toThrow();
    expect(() => validateDiffMode(options, parsedInput)).not.toThrow();

    expect(parsedInput.isStdin).toBe(true);
  });

  it('should reject invalid complete configuration', () => {
    const rawOptions = {
      format: 'invalid',
      screenReader: 'nvda',
    };

    expect(() => validateOptions(rawOptions)).toThrow();
  });
});
