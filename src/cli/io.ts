/**
 * File I/O operations for CLI.
 */

import { readFileSync, writeFileSync } from 'fs';
import { stdin } from 'process';

/**
 * Error thrown when file operations fail.
 */
export class FileIOError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly path?: string
  ) {
    super(message);
    this.name = 'FileIOError';
  }
}

/**
 * Reads HTML content from a file.
 * 
 * @param filePath - Path to HTML file
 * @returns HTML content as string
 * @throws FileIOError if file cannot be read
 */
export function readHTMLFromFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      throw new FileIOError(
        `File not found: ${filePath}`,
        'ENOENT',
        filePath
      );
    }
    
    if (error.code === 'EACCES') {
      throw new FileIOError(
        `Permission denied: ${filePath}`,
        'EACCES',
        filePath
      );
    }
    
    if (error.code === 'EISDIR') {
      throw new FileIOError(
        `Path is a directory, not a file: ${filePath}`,
        'EISDIR',
        filePath
      );
    }
    
    throw new FileIOError(
      `Failed to read file: ${filePath}. ${error.message}`,
      error.code,
      filePath
    );
  }
}

/**
 * Reads HTML content from stdin.
 * 
 * @returns Promise that resolves to HTML content as string
 * @throws FileIOError if stdin cannot be read
 */
export async function readHTMLFromStdin(): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    
    stdin.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    
    stdin.on('end', () => {
      const content = Buffer.concat(chunks).toString('utf-8');
      resolve(content);
    });
    
    stdin.on('error', (error: Error) => {
      reject(new FileIOError(
        `Failed to read from stdin: ${error.message}`,
        'STDIN_ERROR'
      ));
    });
    
    // Handle case where stdin is closed immediately
    stdin.resume();
  });
}

/**
 * Writes output to a file.
 * 
 * @param filePath - Path to output file
 * @param content - Content to write
 * @throws FileIOError if file cannot be written
 */
export function writeOutputToFile(filePath: string, content: string): void {
  try {
    writeFileSync(filePath, content, 'utf-8');
  } catch (error: any) {
    if (error.code === 'EACCES') {
      throw new FileIOError(
        `Permission denied: ${filePath}`,
        'EACCES',
        filePath
      );
    }
    
    if (error.code === 'ENOSPC') {
      throw new FileIOError(
        `No space left on device: ${filePath}`,
        'ENOSPC',
        filePath
      );
    }
    
    if (error.code === 'EISDIR') {
      throw new FileIOError(
        `Path is a directory, not a file: ${filePath}`,
        'EISDIR',
        filePath
      );
    }
    
    throw new FileIOError(
      `Failed to write file: ${filePath}. ${error.message}`,
      error.code,
      filePath
    );
  }
}

/**
 * Writes output to stdout.
 * 
 * @param content - Content to write
 */
export function writeOutputToStdout(content: string): void {
  console.log(content);
}

/**
 * Reads HTML from file or stdin based on parsed input.
 * 
 * @param filePath - File path (undefined for stdin)
 * @param isStdin - Whether to read from stdin
 * @returns HTML content as string (or Promise for stdin)
 */
export function readHTML(
  filePath: string | undefined,
  isStdin: boolean
): string | Promise<string> {
  if (isStdin) {
    return readHTMLFromStdin();
  }
  
  if (!filePath) {
    throw new FileIOError('No input source specified');
  }
  
  return readHTMLFromFile(filePath);
}

/**
 * Writes output to file or stdout based on options.
 * 
 * @param content - Content to write
 * @param outputPath - Output file path (undefined for stdout)
 */
export function writeOutput(content: string, outputPath?: string): void {
  if (outputPath) {
    writeOutputToFile(outputPath, content);
  } else {
    writeOutputToStdout(content);
  }
}
