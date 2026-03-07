/**
 * Integration tests for batch processing functionality.
 */

import { describe, it, expect } from 'vitest';
import { processBatch } from '../../src/cli/orchestrator.js';
import type { CLIOptions } from '../../src/cli/options.js';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const fixturesDir = join(__dirname, '../fixtures');

describe('Batch Processing', () => {
  const defaultOptions: CLIOptions = {
    format: 'json',
    screenReader: 'nvda',
    validate: false,
    batch: true,
  };

  describe('processBatch', () => {
    it('should process multiple valid files successfully', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
        join(fixturesDir, 'batch-test-2.html'),
        join(fixturesDir, 'batch-test-3.html'),
      ];

      const result = processBatch(filePaths, defaultOptions);

      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(3);
      
      // All files should succeed
      expect(result.results.every(r => r.success)).toBe(true);
      
      // Each result should have output
      expect(result.results.every(r => r.output)).toBeTruthy();
      
      // Combined output should include all file paths
      expect(result.output).toContain('batch-test-1.html');
      expect(result.output).toContain('batch-test-2.html');
      expect(result.output).toContain('batch-test-3.html');
      
      // Should include summary
      expect(result.output).toContain('Summary');
      expect(result.output).toContain('Total files: 3');
      expect(result.output).toContain('Successful: 3');
      expect(result.output).toContain('Failed: 0');
    });

    it('should continue processing when one file fails', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
        join(fixturesDir, 'nonexistent-file.html'), // This will fail
        join(fixturesDir, 'batch-test-2.html'),
      ];

      const result = processBatch(filePaths, defaultOptions);

      expect(result.exitCode).toBe(2); // Should fail overall
      expect(result.results).toHaveLength(3);
      
      // First file should succeed
      expect(result.results[0].success).toBe(true);
      expect(result.results[0].filePath).toContain('batch-test-1.html');
      
      // Second file should fail
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].filePath).toContain('nonexistent-file.html');
      expect(result.results[1].error).toBeTruthy();
      
      // Third file should still be processed and succeed
      expect(result.results[2].success).toBe(true);
      expect(result.results[2].filePath).toContain('batch-test-2.html');
      
      // Summary should reflect mixed results
      expect(result.output).toContain('Successful: 2');
      expect(result.output).toContain('Failed: 1');
    });

    it('should handle malformed HTML gracefully in batch mode', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
        join(fixturesDir, 'batch-test-invalid.html'),
      ];

      const result = processBatch(filePaths, defaultOptions);

      // Should succeed (malformed HTML is parsed with recovery)
      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(2);
      
      // Both should succeed (jsdom handles malformed HTML)
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);
      
      // May have warnings for malformed HTML
      expect(result.results[1].warnings.length).toBeGreaterThanOrEqual(0);
    });

    it('should format output correctly for text format', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
        join(fixturesDir, 'batch-test-2.html'),
      ];

      const options: CLIOptions = {
        ...defaultOptions,
        format: 'text',
      };

      const result = processBatch(filePaths, options);

      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(2);
      
      // Output should contain screen reader text
      expect(result.results[0].output).toContain('button');
      expect(result.results[1].output).toContain('heading');
    });

    it('should format output correctly for audit format', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-2.html'),
      ];

      const options: CLIOptions = {
        ...defaultOptions,
        format: 'audit',
      };

      const result = processBatch(filePaths, options);

      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(1);
      
      // Output should contain audit report sections
      expect(result.results[0].output).toContain('Accessibility Audit Report');
    });

    it('should handle empty file list', () => {
      const result = processBatch([], defaultOptions);

      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(0);
      expect(result.output).toContain('Total files: 0');
    });

    it('should collect warnings from all files', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
        join(fixturesDir, 'batch-test-invalid.html'),
      ];

      const result = processBatch(filePaths, defaultOptions);

      // Warnings array should exist
      expect(Array.isArray(result.warnings)).toBe(true);
      
      // Each result should have warnings array
      expect(result.results.every(r => Array.isArray(r.warnings))).toBe(true);
    });

    it('should work with selector option in batch mode', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
        join(fixturesDir, 'batch-test-2.html'),
      ];

      const options: CLIOptions = {
        ...defaultOptions,
        selector: 'button',
      };

      const result = processBatch(filePaths, options);

      // First file has button, should succeed
      expect(result.results[0].success).toBe(true);
      
      // Second file has no button, should fail with selector error
      expect(result.results[1].success).toBe(false);
      expect(result.results[1].error).toContain('No elements match selector');
    });

    it('should work with validation mode in batch mode', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
        join(fixturesDir, 'batch-test-2.html'),
      ];

      const options: CLIOptions = {
        ...defaultOptions,
        validate: true,
      };

      const result = processBatch(filePaths, options);

      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(2);
      
      // All should pass validation
      expect(result.results.every(r => r.success)).toBe(true);
      expect(result.results.every(r => r.output?.includes('Validation passed'))).toBe(true);
    });

    it('should work with all screen readers in batch mode', () => {
      const filePaths = [
        join(fixturesDir, 'batch-test-1.html'),
      ];

      const options: CLIOptions = {
        ...defaultOptions,
        format: 'text',
        screenReader: 'all',
      };

      const result = processBatch(filePaths, options);

      expect(result.exitCode).toBe(0);
      expect(result.results).toHaveLength(1);
      
      // Output should contain all screen reader sections
      expect(result.results[0].output).toContain('NVDA');
      expect(result.results[0].output).toContain('JAWS');
      expect(result.results[0].output).toContain('VoiceOver');
    });
  });
});
