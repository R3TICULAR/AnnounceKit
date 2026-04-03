# Changelog

All notable changes to AnnounceKit will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-01-15

### Added
- Initial release of AnnounceKit CLI
- HTML parsing with error recovery (jsdom)
- Accessibility tree extraction following ARIA specification
- Canonical Announcement Model (JSON-serializable, deterministic)
- NVDA heuristic renderer
- JAWS heuristic renderer
- VoiceOver heuristic renderer
- Developer-friendly audit report renderer
- CSS selector filtering
- Semantic diff between two HTML inputs
- Round-trip validation mode
- Batch processing for multiple files
- CI-friendly exit codes (0, 1, 2, 3)
- Property-based tests with fast-check
- Full TypeScript type definitions
