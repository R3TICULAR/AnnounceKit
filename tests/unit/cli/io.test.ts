/**
 * Unit tests for CLI I/O operations.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { writeFileSync, unlinkSync, mkdirSync, rmdirSync, existsSync } from 'fs';
import { join } from 'path';
import {
  readHTMLFromFile,
  writeOutputToFile,
  writeOutputToStdout,
  readHTML,
  writeOutput,
  FileIOError,
} from '../../../src/cli/io.js';

const TEST_DIR = join(process.cwd(), 'tests', 'fixtures', 'io-test');
const TEST_FILE = join(TEST_DIR, 'test.html');
const OUTPUT_FILE = join(TEST_DIR, 'output.txt');

describe('readHTMLFromFile', () => {
  beforeEach(() => {
    // Create test directory
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    try {
      if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE);
      if (existsSync(OUTPUT_FILE)) unlinkSync(OUTPUT_FILE);
      if (existsSync(TEST_DIR)) rmdirSync(TEST_DIR);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should read HTML from valid file', () => {
    const html = '<button>Click me</button>';
    writeFileSync(TEST_FILE, html, 'utf-8');

    const content = readHTMLFromFile(TEST_FILE);

    expect(content).toBe(html);
  });

  it('should read empty file', () => {
    writeFileSync(TEST_FILE, '', 'utf-8');

    const content = readHTMLFromFile(TEST_FILE);

    expect(content).toBe('');
  });

  it('should read file with UTF-8 characters', () => {
    const html = '<button>Clíck mé 你好</button>';
    writeFileSync(TEST_FILE, html, 'utf-8');

    const content = readHTMLFromFile(TEST_FILE);

    expect(content).toBe(html);
  });

  it('should throw FileIOError for non-existent file', () => {
    const nonExistentFile = join(TEST_DIR, 'does-not-exist.html');

    expect(() => readHTMLFromFile(nonExistentFile)).toThrow(FileIOError);
    expect(() => readHTMLFromFile(nonExistentFile)).toThrow(
      `File not found: ${nonExistentFile}`
    );
  });

  it('should throw FileIOError with ENOENT code for non-existent file', () => {
    const nonExistentFile = join(TEST_DIR, 'does-not-exist.html');

    try {
      readHTMLFromFile(nonExistentFile);
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(FileIOError);
      expect((error as FileIOError).code).toBe('ENOENT');
      expect((error as FileIOError).path).toBe(nonExistentFile);
    }
  });

  it('should throw FileIOError for directory path', () => {
    expect(() => readHTMLFromFile(TEST_DIR)).toThrow(FileIOError);
    expect(() => readHTMLFromFile(TEST_DIR)).toThrow(
      `Path is a directory, not a file: ${TEST_DIR}`
    );
  });

  it('should throw FileIOError with EISDIR code for directory', () => {
    try {
      readHTMLFromFile(TEST_DIR);
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(FileIOError);
      expect((error as FileIOError).code).toBe('EISDIR');
    }
  });
});

describe('writeOutputToFile', () => {
  beforeEach(() => {
    // Create test directory
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    try {
      if (existsSync(OUTPUT_FILE)) unlinkSync(OUTPUT_FILE);
      if (existsSync(TEST_DIR)) rmdirSync(TEST_DIR);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should write content to file', () => {
    const content = 'Test output';

    writeOutputToFile(OUTPUT_FILE, content);

    const written = readHTMLFromFile(OUTPUT_FILE);
    expect(written).toBe(content);
  });

  it('should write empty content', () => {
    writeOutputToFile(OUTPUT_FILE, '');

    const written = readHTMLFromFile(OUTPUT_FILE);
    expect(written).toBe('');
  });

  it('should write UTF-8 content', () => {
    const content = 'Test 你好 Clíck';

    writeOutputToFile(OUTPUT_FILE, content);

    const written = readHTMLFromFile(OUTPUT_FILE);
    expect(written).toBe(content);
  });

  it('should overwrite existing file', () => {
    writeOutputToFile(OUTPUT_FILE, 'First');
    writeOutputToFile(OUTPUT_FILE, 'Second');

    const written = readHTMLFromFile(OUTPUT_FILE);
    expect(written).toBe('Second');
  });

  it('should throw FileIOError for directory path', () => {
    expect(() => writeOutputToFile(TEST_DIR, 'content')).toThrow(FileIOError);
    expect(() => writeOutputToFile(TEST_DIR, 'content')).toThrow(
      `Path is a directory, not a file: ${TEST_DIR}`
    );
  });

  it('should throw FileIOError with EISDIR code for directory', () => {
    try {
      writeOutputToFile(TEST_DIR, 'content');
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(FileIOError);
      expect((error as FileIOError).code).toBe('EISDIR');
    }
  });
});

describe('writeOutputToStdout', () => {
  it('should write to stdout without throwing', () => {
    // This test just ensures the function doesn't throw
    // We can't easily capture stdout in tests
    expect(() => writeOutputToStdout('Test output')).not.toThrow();
  });

  it('should handle empty content', () => {
    expect(() => writeOutputToStdout('')).not.toThrow();
  });

  it('should handle UTF-8 content', () => {
    expect(() => writeOutputToStdout('Test 你好')).not.toThrow();
  });
});

describe('readHTML', () => {
  beforeEach(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    try {
      if (existsSync(TEST_FILE)) unlinkSync(TEST_FILE);
      if (existsSync(TEST_DIR)) rmdirSync(TEST_DIR);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should read from file when not stdin', () => {
    const html = '<button>Test</button>';
    writeFileSync(TEST_FILE, html, 'utf-8');

    const content = readHTML(TEST_FILE, false);

    expect(content).toBe(html);
  });

  it('should return Promise for stdin', () => {
    const result = readHTML(undefined, true);

    expect(result).toBeInstanceOf(Promise);
  });

  it('should throw FileIOError when no input specified', () => {
    expect(() => readHTML(undefined, false)).toThrow(FileIOError);
    expect(() => readHTML(undefined, false)).toThrow('No input source specified');
  });
});

describe('writeOutput', () => {
  beforeEach(() => {
    if (!existsSync(TEST_DIR)) {
      mkdirSync(TEST_DIR, { recursive: true });
    }
  });

  afterEach(() => {
    try {
      if (existsSync(OUTPUT_FILE)) unlinkSync(OUTPUT_FILE);
      if (existsSync(TEST_DIR)) rmdirSync(TEST_DIR);
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should write to file when output path provided', () => {
    const content = 'Test output';

    writeOutput(content, OUTPUT_FILE);

    const written = readHTMLFromFile(OUTPUT_FILE);
    expect(written).toBe(content);
  });

  it('should write to stdout when no output path', () => {
    // Just ensure it doesn't throw
    expect(() => writeOutput('Test output')).not.toThrow();
  });

  it('should write to stdout when output path is undefined', () => {
    expect(() => writeOutput('Test output', undefined)).not.toThrow();
  });
});

describe('FileIOError', () => {
  it('should create error with message', () => {
    const error = new FileIOError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Test error');
    expect(error.name).toBe('FileIOError');
  });

  it('should create error with code', () => {
    const error = new FileIOError('Test error', 'ENOENT');

    expect(error.code).toBe('ENOENT');
  });

  it('should create error with path', () => {
    const error = new FileIOError('Test error', 'ENOENT', '/path/to/file');

    expect(error.path).toBe('/path/to/file');
  });

  it('should create error with all properties', () => {
    const error = new FileIOError('Test error', 'EACCES', '/path/to/file');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('EACCES');
    expect(error.path).toBe('/path/to/file');
    expect(error.name).toBe('FileIOError');
  });
});
