# Implementation Plan: AnnounceKit CLI

## Overview

This implementation plan breaks down the AnnounceKit CLI into incremental, testable tasks. The approach follows a bottom-up strategy: establish core data models first, then build extraction logic, add rendering capabilities, and finally wire everything through the CLI interface.

The implementation uses TypeScript + Node.js with jsdom for HTML parsing, Commander.js for CLI, Vitest for unit testing, and fast-check for property-based testing.

## Tasks

- [x] 1. Project setup and infrastructure
  - Initialize Node.js project with TypeScript configuration
  - Set up pnpm workspace and install core dependencies (jsdom, commander, vitest, fast-check, tsup)
  - Configure TypeScript compiler options (strict mode, ESM output)
  - Set up build tooling with tsup for single-file executable
  - Create project directory structure (src/, tests/, fixtures/)
  - Configure Vitest with snapshot testing support
  - Set up basic package.json scripts (build, test, dev)
  - _Requirements: 12.1, 12.2_

- [ ] 2. Implement core data model interfaces
  - [ ] 2.1 Create TypeScript interfaces for Canonical Announcement Model
    - Define ModelVersion, AccessibleRole, AccessibleState, AccessibleValue, FocusInfo interfaces
    - Define AccessibleNode and AnnouncementModel interfaces
    - Add JSDoc comments documenting each interface and field
    - Export all interfaces from core module
    - _Requirements: 3.1, 3.2_

  - [ ]* 2.2 Write property test for model serialization round-trip
    - **Property 5: Model Serialization Round Trip**
    - **Validates: Requirements 3.2, 11.1, 11.4**
    - Create arbitrary generators for all model types
    - Test that serialize → deserialize produces equivalent model
    - Verify all fields preserved with correct types

  - [ ] 2.3 Implement model validation functions
    - Create validation function for AccessibleRole enum values
    - Create validation function for AccessibleState constraints
    - Create validation function for tree structure integrity (no cycles)
    - Add error messages for validation failures
    - _Requirements: 3.1, 11.3_

  - [ ]* 2.4 Write unit tests for model validation
    - Test valid models pass validation
    - Test invalid roles are rejected
    - Test invalid state values are rejected
    - Test circular references are detected

- [ ] 3. Implement JSON serialization layer
  - [ ] 3.1 Create JSON serialization functions
    - Implement serializeModel() with deterministic property ordering
    - Implement deserializeModel() with validation
    - Add version field to serialized output
    - Add metadata (extractedAt timestamp, optional sourceHash)
    - _Requirements: 3.2, 3.5_

  - [ ]* 3.2 Write property test for deterministic output
    - **Property 6: Deterministic Output**
    - **Validates: Requirements 3.3, 3.5**
    - Test that same model serializes to identical JSON multiple times
    - Verify property ordering is consistent
    - Verify no randomness in output

  - [ ]* 3.3 Write unit tests for serialization edge cases
    - Test empty model serialization
    - Test deeply nested node serialization
    - Test optional fields (description, value) handling
    - Test deserialization error handling for invalid JSON

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement HTML parsing layer
  - [ ] 5.1 Create HTML parser using jsdom
    - Initialize jsdom with lenient parsing mode
    - Implement parseHTML() function accepting string input
    - Configure error recovery for malformed HTML
    - Return DOM document object
    - _Requirements: 1.1, 1.3_

  - [ ]* 5.2 Write property test for parser robustness
    - **Property 1: Parser Robustness**
    - **Validates: Requirements 1.1, 1.3**
    - Generate random HTML strings (valid and malformed)
    - Test parser never crashes or hangs
    - Verify parser returns DOM or clear error message

  - [ ] 5.3 Implement error handling for parsing failures
    - Catch jsdom parsing errors
    - Emit warnings for malformed HTML with line numbers
    - Continue processing with recovered DOM
    - _Requirements: 1.3, 9.2, 9.4_

  - [ ]* 5.4 Write unit tests for HTML parsing
    - Test valid HTML parsing
    - Test malformed HTML with unclosed tags
    - Test invalid nesting recovery
    - Test empty input handling
    - Test large document handling

- [ ] 6. Implement ARIA name computation
  - [ ] 6.1 Implement accessible name computation algorithm
    - Implement aria-label resolution
    - Implement aria-labelledby resolution with ID references
    - Implement text content fallback for elements
    - Implement alt text for images
    - Handle circular aria-labelledby references (emit warning, break cycle)
    - Implement name computation priority order per ARIA spec
    - _Requirements: 2.3, 2.8_

  - [ ]* 6.2 Write unit tests for name computation
    - Test aria-label takes precedence
    - Test aria-labelledby with single ID
    - Test aria-labelledby with multiple IDs (concatenation)
    - Test text content fallback
    - Test alt text for images
    - Test circular reference handling
    - Test missing ID reference handling

  - [ ] 6.3 Implement accessible description computation
    - Implement aria-describedby resolution
    - Implement title attribute fallback
    - Handle missing ID references with warnings
    - _Requirements: 2.4_

  - [ ]* 6.4 Write unit tests for description computation
    - Test aria-describedby with single ID
    - Test aria-describedby with multiple IDs
    - Test title attribute fallback
    - Test missing ID reference handling

- [ ] 7. Implement role extraction
  - [ ] 7.1 Implement role computation logic
    - Map HTML elements to implicit ARIA roles (button, a[href], h1-h6, nav, main, etc.)
    - Extract explicit role attribute values
    - Validate roles against AccessibleRole type
    - Emit warnings for invalid/unsupported roles
    - Use implicit role as fallback for invalid explicit roles
    - _Requirements: 2.2, 14.1-14.7_

  - [ ]* 7.2 Write unit tests for role extraction
    - Test implicit roles for native elements (button, a, h1, nav, etc.)
    - Test explicit role attribute override
    - Test invalid role handling
    - Test role="presentation" and role="none"
    - Test all 23 supported roles from V1 scope

- [ ] 8. Implement state and property extraction
  - [ ] 8.1 Implement state extraction for ARIA attributes
    - Extract aria-expanded (boolean)
    - Extract aria-checked (boolean | 'mixed')
    - Extract aria-pressed (boolean | 'mixed')
    - Extract aria-selected (boolean)
    - Extract aria-disabled (boolean)
    - Extract aria-invalid (boolean)
    - Extract aria-required (boolean)
    - Extract aria-readonly (boolean)
    - Extract aria-current (enum values)
    - Extract aria-hidden (boolean)
    - Extract aria-level for headings (number)
    - Extract aria-posinset and aria-setsize for lists (numbers)
    - _Requirements: 2.5, 2.6, 15.1-15.9_

  - [ ]* 8.2 Write unit tests for state extraction
    - Test each supported ARIA attribute extraction
    - Test boolean value parsing (true/false strings)
    - Test mixed state handling
    - Test numeric value parsing (level, posinset, setsize)
    - Test invalid attribute values (emit warning, ignore)

  - [ ] 8.3 Implement value extraction for form controls
    - Extract current value for textbox, checkbox, radio, combobox
    - Extract min/max for range widgets
    - Format value text representation
    - _Requirements: 2.6, 14.4_

  - [ ]* 8.4 Write unit tests for value extraction
    - Test textbox value extraction
    - Test checkbox checked state as value
    - Test select element value extraction
    - Test input[type=range] min/max/current

- [ ] 9. Implement focus information extraction
  - [ ] 9.1 Implement focusability detection
    - Detect natively focusable elements (a[href], button, input, select, textarea)
    - Detect tabindex attribute presence and value
    - Determine focusable boolean based on element type and tabindex
    - Extract explicit tabindex value if present
    - _Requirements: 3.1_

  - [ ]* 9.2 Write unit tests for focus detection
    - Test native focusable elements
    - Test tabindex="0" makes element focusable
    - Test tabindex="-1" makes element programmatically focusable
    - Test tabindex > 0 values
    - Test disabled elements are not focusable

- [ ] 10. Implement accessibility tree builder
  - [ ] 10.1 Create tree traversal and node construction
    - Traverse DOM tree depth-first
    - For each element, compute role, name, description, state, value, focus
    - Filter inaccessible elements (aria-hidden="true", role="presentation", role="none")
    - Build AccessibleNode instances with children arrays
    - Preserve parent-child relationships in tree structure
    - _Requirements: 2.1, 2.7, 3.4_

  - [ ]* 10.2 Write property test for semantic model completeness
    - **Property 2: Semantic Model Completeness**
    - **Validates: Requirements 2.2, 2.3, 2.5, 2.6, 3.1**
    - Generate random accessible HTML
    - Test all accessible elements have role, name, state, focus
    - Verify no required fields are missing

  - [ ]* 10.3 Write property test for hierarchical structure preservation
    - **Property 7: Hierarchical Structure Preservation**
    - **Validates: Requirements 3.4**
    - Generate nested HTML structures
    - Test parent-child relationships preserved in model
    - Verify tree depth matches HTML nesting

  - [ ]* 10.4 Write property test for inaccessible element filtering
    - **Property 4: Inaccessible Element Filtering**
    - **Validates: Requirements 2.7**
    - Generate HTML with aria-hidden and presentational roles
    - Test filtered elements not in model
    - Test children of aria-hidden elements also filtered

  - [ ]* 10.5 Write unit tests for tree building
    - Test simple single-element tree
    - Test nested elements (list with listitems)
    - Test aria-hidden filtering
    - Test role="presentation" filtering
    - Test deeply nested structures
    - Test empty document handling

- [ ] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement CSS selector filtering
  - [ ] 12.1 Add selector filtering to tree builder
    - Accept optional CSS selector parameter
    - Use jsdom querySelector/querySelectorAll to find matching elements
    - Build accessibility tree only for matching elements and their descendants
    - Return error if no elements match selector
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 12.2 Write property test for CSS selector filtering
    - **Property 8: CSS Selector Filtering**
    - **Validates: Requirements 8.1, 8.2**
    - Generate HTML with multiple accessible elements
    - Test selector matches all and only expected elements
    - Verify no false positives or false negatives

  - [ ]* 12.3 Write unit tests for selector filtering
    - Test simple selector (e.g., "button")
    - Test complex selector (e.g., ".class > button[aria-label]")
    - Test multiple matches
    - Test no matches (error case)
    - Test selector with aria-hidden elements

- [ ] 13. Implement NVDA renderer
  - [ ] 13.1 Create NVDA announcement text generator
    - Implement renderNode() for each supported role
    - Format button announcements: "[name], button, [state]"
    - Format link announcements: "[name], link"
    - Format heading announcements: "[name], heading level [N]"
    - Format checkbox announcements: "[name], checkbox, [checked/not checked]"
    - Format textbox announcements: "[name], edit, [value]"
    - Format landmark announcements: "[name], [landmark type]"
    - Include state announcements (expanded/collapsed, pressed, disabled, invalid, required)
    - Traverse tree and concatenate announcements
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ]* 13.2 Write unit tests for NVDA renderer
    - Test button announcement format
    - Test link announcement format
    - Test heading with level announcement
    - Test checkbox checked/unchecked
    - Test expanded/collapsed state
    - Test disabled state
    - Test invalid state
    - Test nested elements (list with items)

- [ ] 14. Implement VoiceOver renderer
  - [ ] 14.1 Create VoiceOver announcement text generator
    - Implement renderNode() for each supported role
    - Format button announcements: "[name], button"
    - Format link announcements: "[name], link"
    - Format heading announcements: "heading level [N], [name]"
    - Format checkbox announcements: "[name], checkbox, [checked/unchecked]"
    - Format textbox announcements: "[name], edit text, [value]"
    - Format landmark announcements: "[landmark type], [name]"
    - Include state announcements with VoiceOver-specific phrasing
    - Traverse tree and concatenate announcements
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ]* 14.2 Write unit tests for VoiceOver renderer
    - Test button announcement format
    - Test link announcement format
    - Test heading with level announcement (order difference from NVDA)
    - Test checkbox checked/unchecked
    - Test expanded/collapsed state
    - Test disabled state
    - Test invalid state
    - Test nested elements (list with items)

- [ ] 15. Implement semantic diff functionality
  - [ ] 15.1 Create diff algorithm for accessibility trees
    - Implement tree comparison algorithm
    - Identify added nodes (present in new tree, not in old)
    - Identify removed nodes (present in old tree, not in new)
    - Identify changed nodes (same path, different properties)
    - Generate JSON path for each node (e.g., "root.children[0].children[1]")
    - Create SemanticDiff output structure
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

  - [ ]* 15.2 Write property test for diff completeness
    - **Property 10: Semantic Diff Completeness**
    - **Validates: Requirements 13.3, 13.4, 13.5, 13.6**
    - Generate two random models
    - Test all differences detected
    - Verify no false positives or false negatives

  - [ ]* 15.3 Write unit tests for semantic diff
    - Test added node detection
    - Test removed node detection
    - Test changed property detection (name, role, state)
    - Test unchanged trees (empty diff)
    - Test deeply nested changes

  - [ ] 15.4 Implement diff output formatting
    - Format diff as structured JSON
    - Include old and new values for changed properties
    - Include JSON paths for all changes
    - Make output diff-friendly for CI tools
    - _Requirements: 13.6, 12.4_

  - [ ]* 15.5 Write unit tests for diff formatting
    - Test JSON output structure
    - Test readability of diff output
    - Test empty diff formatting

- [ ] 16. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 17. Implement CLI interface
  - [ ] 17.1 Set up Commander.js CLI framework
    - Initialize Commander program
    - Define command name, version, description
    - Add --version flag
    - Add --help flag with usage examples
    - _Requirements: 10.1, 10.2_

  - [ ] 17.2 Implement command-line argument parsing
    - Add input option (file path or stdin indicator)
    - Add --output/-o option for output file path
    - Add --format/-f option (json, text, both)
    - Add --screen-reader/-s option (nvda, voiceover)
    - Add --selector option for CSS selector filtering
    - Add --validate flag for round-trip validation mode
    - Add --diff option for semantic diff mode (second HTML file path)
    - Set default values (format: json, screen-reader: nvda, output: stdout)
    - _Requirements: 1.4, 1.5, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3, 8.1, 11.2, 13.1_

  - [ ]* 17.3 Write unit tests for argument parsing
    - Test default values
    - Test file input parsing
    - Test stdin input parsing
    - Test output format options
    - Test screen reader selection
    - Test selector option
    - Test validate flag
    - Test diff mode option
    - Test invalid arguments (error handling)

- [ ] 18. Implement file I/O operations
  - [ ] 18.1 Create file reading functions
    - Implement readHTMLFromFile() using fs.readFileSync
    - Implement readHTMLFromStdin() using process.stdin
    - Handle file not found errors with clear messages
    - Handle permission errors with clear messages
    - _Requirements: 1.1, 1.2, 1.4, 1.5, 9.3_

  - [ ] 18.2 Create file writing functions
    - Implement writeOutputToFile() using fs.writeFileSync
    - Implement writeOutputToStdout() using console.log
    - Handle write permission errors
    - Handle disk full errors
    - _Requirements: 6.4, 6.5, 9.3_

  - [ ]* 18.3 Write unit tests for file I/O
    - Test file reading with valid path
    - Test file reading with invalid path (error)
    - Test stdin reading
    - Test file writing
    - Test stdout writing
    - Test permission errors

- [ ] 19. Implement CLI orchestration and output formatting
  - [ ] 19.1 Wire all components together in main CLI function
    - Parse command-line arguments
    - Read HTML input (file or stdin)
    - Parse HTML using HTML parser
    - Extract accessibility tree
    - Build semantic model
    - Apply CSS selector filtering if specified
    - Serialize model to JSON if requested
    - Render announcement text if requested
    - Write output (file or stdout)
    - Handle errors and exit with appropriate codes
    - _Requirements: 3.1, 6.1, 6.2, 6.3, 7.2, 7.3, 9.1, 9.5, 12.1_

  - [ ] 19.2 Implement output formatting for different modes
    - Format JSON output with pretty printing
    - Format text output with announcement text
    - Format combined output (JSON + text)
    - Format diff output with structured changes
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 19.3 Implement error handling and user feedback
    - Catch and format parsing errors
    - Catch and format extraction errors
    - Catch and format I/O errors
    - Display error messages with context (file path, line number)
    - Display warnings for malformed HTML and invalid ARIA
    - Exit with code 0 on success, 1 on user error, 2 on content error, 3 on system error
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [ ]* 19.4 Write integration tests for CLI end-to-end
    - Test full flow: file input → JSON output
    - Test full flow: stdin input → text output
    - Test full flow: file input → both outputs
    - Test selector filtering end-to-end
    - Test diff mode end-to-end
    - Test error cases (file not found, invalid HTML, no selector matches)

- [ ] 20. Implement validation mode
  - [ ] 20.1 Create round-trip validation function
    - Parse HTML and extract model
    - Serialize model to JSON
    - Deserialize JSON back to model
    - Compare original and deserialized models
    - Report any inconsistencies
    - _Requirements: 11.2, 11.3, 11.4_

  - [ ]* 20.2 Write unit tests for validation mode
    - Test successful validation (no inconsistencies)
    - Test validation failure detection
    - Test validation output format

- [ ] 21. Implement batch processing support
  - [ ] 21.1 Add batch mode to CLI
    - Accept multiple file paths as input
    - Process each file independently
    - Collect results for all files
    - Output combined results or individual files
    - Continue processing on individual file errors
    - _Requirements: 12.5_

  - [ ]* 21.2 Write integration tests for batch processing
    - Test multiple file processing
    - Test error handling in batch mode (one file fails, others continue)
    - Test output format for batch results

- [ ] 22. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 23. Create documentation
  - [ ] 23.1 Write README.md
    - Add project overview and purpose
    - Add installation instructions
    - Add usage examples for common scenarios
    - Add CLI options reference
    - Add supported elements and ARIA attributes list
    - Add limitations and disclaimer about heuristic rendering
    - Add CI integration examples
    - _Requirements: 10.1, 10.3, 10.4, 10.5, 14.8, 15.10, 16.1-16.7_

  - [ ] 23.2 Write API documentation
    - Document all exported interfaces and types
    - Document public functions with JSDoc
    - Add usage examples for programmatic API
    - Document error types and handling

  - [ ] 23.3 Create example fixtures and test cases
    - Create example HTML files for common components (button, form, navigation)
    - Create expected output files (JSON and text)
    - Add examples to documentation
    - _Requirements: 4.5, 5.5_

- [ ] 24. Set up CI/CD pipeline
  - [ ] 24.1 Create GitHub Actions workflow (or equivalent)
    - Run all unit tests on push
    - Run all property tests with 100 iterations
    - Run integration tests
    - Generate and upload coverage report (target: 80%+)
    - Run build and verify executable creation
    - Fail on snapshot changes (require explicit update)
    - _Requirements: 12.1, 12.3_

  - [ ] 24.2 Add performance benchmarks
    - Create benchmark suite for typical component HTML
    - Track execution time (target: <5 seconds)
    - Alert on performance regressions >20%
    - _Requirements: 12.2_

  - [ ] 24.3 Configure release automation
    - Set up semantic versioning
    - Automate npm package publishing
    - Generate changelog from commits
    - Create GitHub releases with binaries

- [ ] 25. Final validation and polish
  - [ ] 25.1 Run full test suite and verify coverage
    - Ensure all unit tests pass
    - Ensure all property tests pass
    - Ensure all integration tests pass
    - Verify code coverage meets 80% target
    - Review and update snapshots if needed

  - [ ] 25.2 Manual testing of CLI
    - Test CLI with real-world component HTML
    - Verify output quality for NVDA and VoiceOver
    - Test error messages are clear and helpful
    - Test help and version commands
    - Test all CLI options and combinations

  - [ ] 25.3 Final documentation review
    - Review README for clarity and completeness
    - Verify all examples work correctly
    - Check that limitations are clearly documented
    - Ensure installation instructions are accurate

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows a bottom-up approach: data model → extraction → rendering → CLI
- All code should include TypeScript type annotations and JSDoc comments
- Error handling should be comprehensive with clear, actionable error messages
