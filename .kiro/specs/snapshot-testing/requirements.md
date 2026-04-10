# Requirements Document

## Introduction

AnnounceKit predicts screen reader output for HTML. With the core engine now covering full page content, the next step is announcement snapshot testing — the ability to save a baseline of expected screen reader output and compare against it in CI/CD pipelines. This enables teams to enforce screen reader output as a contract, catching accessibility regressions on every pull request, similar to visual regression testing but for the auditory experience.

The feature has four pillars: (1) a snapshot mode for the CLI that saves and compares announcement baselines, (2) a spec file format that lets teams author expected screen reader output patterns, (3) CI/CD integration flags for machine-readable output and non-zero exit codes on regressions, and (4) baseline management commands for updating and organizing snapshots.

## Glossary

- **CLI**: The `announcekit` command-line interface defined in `src/cli.ts` and its supporting modules in `src/cli/`.
- **AnnouncementModel**: The root data structure (`src/model/types.ts`) containing the accessibility tree, version, and metadata.
- **Snapshot**: A JSON file containing a saved AnnouncementModel plus rendered screen reader text for one or more screen readers, used as a baseline for comparison.
- **Snapshot_Directory**: The directory where Snapshot files are stored (default: `.announcekit/snapshots/`).
- **Snapshot_Comparator**: The module responsible for comparing a current AnnouncementModel and rendered output against a saved Snapshot and producing a diff result.
- **Spec_File**: A JSON file (`.announcekit-spec` or `.a11y-spec.json`) authored by teams that defines expected screen reader output patterns for specific HTML files or CSS selectors.
- **Spec_Validator**: The module responsible for loading a Spec_File, running the CLI analysis on the referenced HTML, and checking that actual output matches the declared expectations.
- **Expectation**: A single entry in a Spec_File that declares a CSS selector and the expected screen reader output pattern (contains or matches).
- **Screen_Reader_Output**: The rendered text produced by one of the three renderers (NVDA, JAWS, VoiceOver) for a given AnnouncementModel.
- **Diff_Report**: A human-readable summary of differences between two Snapshots or between actual output and a Spec_File, showing added, removed, and modified announcements.
- **CI_Mode**: A CLI output mode optimized for continuous integration environments, suppressing color codes and producing machine-readable output.
- **Serialization_Module**: The module (`src/model/serialization.ts`) responsible for deterministic JSON serialization and deserialization of AnnouncementModels.

## Requirements

### Requirement 1: Save Snapshot to Directory

**User Story:** As a developer, I want to save the current analysis output as a snapshot file in a specified directory, so that I can establish a baseline of expected screen reader output.

#### Acceptance Criteria

1. WHEN the `--snapshot <dir>` flag is provided, THE CLI SHALL analyze the input HTML file and write the result as a Snapshot file in the specified directory.
2. THE CLI SHALL derive the Snapshot file name from the input file name by appending `.snap` (e.g., `index.html` produces `index.html.snap`).
3. THE CLI SHALL create the Snapshot_Directory and any intermediate directories if they do not exist.
4. THE Snapshot file SHALL be a JSON file containing the full AnnouncementModel and a `screenReaderOutput` object with rendered text keyed by screen reader name.
5. WHEN the `--screen-reader` option is set to a single reader (nvda, jaws, or voiceover), THE Snapshot file SHALL contain rendered text for that reader only.
6. WHEN the `--screen-reader all` option is used, THE Snapshot file SHALL contain rendered text for all three screen readers (nvda, jaws, voiceover).
7. IF the Snapshot_Directory path is not writable, THEN THE CLI SHALL print an error message to stderr and exit with code 3.

### Requirement 2: Compare Against Saved Snapshot

**User Story:** As a developer, I want the CLI to compare the current analysis output against a saved snapshot and report differences, so that I can detect accessibility regressions.

#### Acceptance Criteria

1. WHEN the `--snapshot <dir>` flag is provided without `--update-snapshot`, THE CLI SHALL load the existing Snapshot file from the directory and compare it against the current analysis output.
2. WHEN the current output matches the saved Snapshot, THE CLI SHALL print a success message to stdout and exit with code 0.
3. WHEN the current output differs from the saved Snapshot, THE CLI SHALL print a Diff_Report to stdout showing added, removed, and modified announcements, and exit with code 1.
4. IF no existing Snapshot file is found for the input file, THEN THE CLI SHALL create a new Snapshot file, print a message indicating a new baseline was created, and exit with code 0.
5. THE Snapshot_Comparator SHALL compare both the AnnouncementModel structure and the Screen_Reader_Output text for each screen reader present in the Snapshot.
6. THE Snapshot_Comparator SHALL ignore the `metadata.extractedAt` timestamp field when comparing AnnouncementModels, since timestamps differ between runs.

### Requirement 3: Update Existing Snapshots

**User Story:** As a developer, I want to update existing snapshots after intentional changes, so that the baseline reflects the new expected output.

#### Acceptance Criteria

1. WHEN the `--update-snapshot` flag is provided together with `--snapshot <dir>`, THE CLI SHALL overwrite the existing Snapshot file with the current analysis output.
2. WHEN the `--update-snapshot` flag is provided and no existing Snapshot file exists, THE CLI SHALL create a new Snapshot file.
3. THE CLI SHALL print a confirmation message to stdout indicating which Snapshot files were updated.
4. IF `--update-snapshot` is provided without `--snapshot`, THEN THE CLI SHALL print an error message stating that `--snapshot <dir>` is required and exit with code 1.
5. WHEN `--update-snapshot` is used together with `--selector`, THE CLI SHALL update only the portion of the Snapshot corresponding to elements matching the selector, preserving the rest of the Snapshot unchanged.
6. WHEN `--update-snapshot` is used without `--selector`, THE CLI SHALL update the entire Snapshot for the input file.

### Requirement 4: Snapshot File Format and Serialization

**User Story:** As a developer, I want snapshot files to use a deterministic JSON format, so that snapshots produce clean diffs in version control and can be reliably compared across runs.

#### Acceptance Criteria

1. THE Snapshot file SHALL use the following top-level JSON structure: `{ "version", "inputFile", "screenReader", "model", "screenReaderOutput", "createdAt" }`.
2. THE Serialization_Module SHALL serialize the AnnouncementModel within the Snapshot using deterministic key ordering (sorted keys).
3. THE Snapshot file SHALL be pretty-printed with 2-space indentation for readability in version control diffs.
4. FOR ALL valid Snapshot files, reading the file, parsing the JSON, and re-serializing SHALL produce byte-identical output (round-trip property).
5. THE `version` field in the Snapshot file SHALL contain a snapshot format version string (e.g., `"1.0"`) to support future format migrations.
6. THE `screenReaderOutput` object SHALL map screen reader names to their rendered text strings (e.g., `{ "nvda": "...", "voiceover": "..." }`).

### Requirement 5: Human-Readable Diff Output

**User Story:** As a developer, I want the diff output to clearly show what changed in the screen reader announcements, so that I can quickly understand the regression.

#### Acceptance Criteria

1. WHEN the Snapshot comparison detects differences, THE Diff_Report SHALL group changes by screen reader name.
2. THE Diff_Report SHALL display added announcements with a `+` prefix and removed announcements with a `-` prefix.
3. THE Diff_Report SHALL display modified announcements showing the old value and new value side by side.
4. THE Diff_Report SHALL include the CSS path or tree path of each changed node to help locate the change in the HTML source.
5. WHEN the `--ci` flag is provided, THE Diff_Report SHALL omit ANSI color codes from the output.
6. WHEN the `--ci` flag is not provided, THE Diff_Report SHALL use color codes (red for removals, green for additions) to improve readability in terminal output.

### Requirement 6: Screen Reader Spec File Parsing

**User Story:** As an accessibility lead, I want to author a spec file that defines expected screen reader output patterns, so that developers can validate their implementation against the accessibility contract.

#### Acceptance Criteria

1. THE Spec_Validator SHALL accept Spec_Files with the `.announcekit-spec` or `.a11y-spec.json` file extension.
2. THE Spec_File SHALL use the following JSON structure: `{ "file", "screenReader", "expectations[]" }` where each Expectation contains `{ "selector", "contains" | "matches" }`.
3. WHEN an Expectation uses the `contains` key, THE Spec_Validator SHALL verify that the rendered Screen_Reader_Output for elements matching the selector includes all specified strings as substrings.
4. WHEN an Expectation uses the `matches` key, THE Spec_Validator SHALL verify that the rendered Screen_Reader_Output for elements matching the selector matches the specified glob pattern (where `*` matches any sequence of characters).
5. IF the Spec_File JSON is malformed or missing required fields, THEN THE Spec_Validator SHALL print a descriptive parse error with the file path and exit with code 2.
6. THE Spec_Validator SHALL format Spec_File objects back into valid JSON files (pretty-printer).
7. FOR ALL valid Spec_File objects, parsing then printing then parsing SHALL produce an equivalent Spec_File object (round-trip property).

### Requirement 7: Validate HTML Against Spec File

**User Story:** As a developer, I want the CLI to validate that my HTML produces screen reader output matching the spec file, so that I can verify my implementation meets the accessibility contract.

#### Acceptance Criteria

1. WHEN the `--spec <path>` flag is provided, THE CLI SHALL load the Spec_File, analyze the referenced HTML file, and validate each Expectation.
2. WHEN all Expectations pass, THE CLI SHALL print a success summary to stdout and exit with code 0.
3. WHEN one or more Expectations fail, THE CLI SHALL print a failure report listing each failed Expectation with the expected pattern and actual output, and exit with code 1.
4. THE failure report SHALL include the CSS selector, the expected pattern, and the actual Screen_Reader_Output for each failed Expectation.
5. WHEN the `--spec` flag references a Spec_File whose `file` field points to a non-existent HTML file, THE CLI SHALL print an error message and exit with code 2.
6. WHEN the `--spec` flag references a Spec_File whose Expectation `selector` matches no elements in the HTML, THE CLI SHALL report that Expectation as a failure with a "no elements matched" message.

### Requirement 8: CI/CD Integration Flags

**User Story:** As a DevOps engineer, I want CI-specific flags that produce machine-readable output and appropriate exit codes, so that I can integrate AnnounceKit snapshot testing into automated pipelines.

#### Acceptance Criteria

1. WHEN the `--ci` flag is provided, THE CLI SHALL suppress all ANSI color codes and interactive formatting from the output.
2. WHEN the `--ci` flag is provided together with `--snapshot`, THE CLI SHALL output a JSON summary object containing `{ "status", "snapshotFile", "changes" }` to stdout.
3. WHEN the `--fail-on-change` flag is provided together with `--snapshot`, THE CLI SHALL exit with code 1 when the current output differs from the saved Snapshot.
4. WHEN the `--fail-on-change` flag is provided and the current output matches the saved Snapshot, THE CLI SHALL exit with code 0.
5. IF `--fail-on-change` is provided without `--snapshot` or `--spec`, THEN THE CLI SHALL print an error message stating that `--snapshot` or `--spec` is required and exit with code 1.
6. THE CLI SHALL write all progress and informational messages to stderr when `--ci` is active, reserving stdout for structured output only.

### Requirement 9: Batch Snapshot Processing

**User Story:** As a developer, I want to snapshot multiple HTML files in a single command, so that I can efficiently manage baselines for an entire project.

#### Acceptance Criteria

1. WHEN the `--batch` flag is used together with `--snapshot <dir>`, THE CLI SHALL process each input file and save or compare a Snapshot for each file independently.
2. WHEN batch snapshot comparison detects differences in one or more files, THE CLI SHALL print a summary listing all files with changes and exit with code 1.
3. WHEN batch snapshot comparison detects no differences in any file, THE CLI SHALL print a success summary and exit with code 0.
4. IF one file in a batch fails to process (e.g., file not found), THEN THE CLI SHALL continue processing the remaining files and include the error in the summary output.
5. THE batch summary SHALL include the total number of files processed, the number of files with changes, and the number of files that matched their Snapshots.

### Requirement 10: Snapshot Directory Configuration

**User Story:** As a developer, I want to configure the default snapshot directory, so that my team can standardize where snapshots are stored without passing the flag every time.

#### Acceptance Criteria

1. WHEN the `--snapshot` flag is provided with a directory path, THE CLI SHALL use that path as the Snapshot_Directory.
2. WHEN the `--snapshot` flag is provided without a directory path, THE CLI SHALL use the default Snapshot_Directory `.announcekit/snapshots/`.
3. THE CLI SHALL resolve relative Snapshot_Directory paths relative to the current working directory.
4. THE CLI SHALL normalize the Snapshot_Directory path to use forward slashes in Snapshot file metadata for cross-platform consistency.

### Requirement 11: Backward Compatibility with Existing CLI Behavior

**User Story:** As a developer, I want the new snapshot flags to be additive and not change existing CLI behavior, so that current workflows continue to work without modification.

#### Acceptance Criteria

1. WHEN no snapshot-related flags (`--snapshot`, `--update-snapshot`, `--spec`, `--fail-on-change`, `--ci`) are provided, THE CLI SHALL behave identically to the pre-snapshot version.
2. THE new CLI flags SHALL not conflict with existing flags (`--output`, `--format`, `--screen-reader`, `--selector`, `--validate`, `--diff`, `--batch`).
3. WHEN `--snapshot` is used together with `--selector`, THE CLI SHALL snapshot only the elements matching the selector.
4. WHEN `--snapshot` is used together with `--diff`, THE CLI SHALL print an error message stating that snapshot mode and diff mode are mutually exclusive, and exit with code 1.
