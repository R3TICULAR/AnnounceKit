# Requirements Document

## Introduction

The AnnounceKit core engine currently only builds accessibility trees for elements with explicit or implicit ARIA roles, which limits coverage to interactive elements and landmarks. Static content that screen readers announce in browse mode — paragraphs, text nodes, tables, blockquotes, figures, and more — is completely dropped from the tree. This spec defines the requirements for expanding the tree builder, role mapper, model types, and screen reader renderers to achieve full-page content coverage matching what real screen readers announce.

## Glossary

- **Tree_Builder**: The module (`tree-builder.ts`) that traverses the DOM and constructs the hierarchical `AnnouncementModel` from accessible nodes.
- **Role_Mapper**: The module (`role-mapper.ts`) that computes implicit and explicit ARIA roles for HTML elements via `computeRole()` and `isAccessible()`.
- **IMPLICIT_ROLE_MAP**: The lookup table in Role_Mapper that maps HTML tag names to their implicit ARIA roles.
- **AccessibleRole**: The TypeScript union type in `model/types.ts` that enumerates all roles the engine can represent.
- **SUPPORTED_ROLES**: The constant array in `model/types.ts` used for role validation.
- **AccessibleNode**: The tree node type representing a single element in the accessibility tree, containing role, name, state, children, and other properties.
- **AnnouncementModel**: The root data structure containing the accessibility tree, version, and metadata.
- **NVDA_Renderer**: The module (`nvda-renderer.ts`) that formats an AnnouncementModel as NVDA-style announcement text.
- **JAWS_Renderer**: The module (`jaws-renderer.ts`) that formats an AnnouncementModel as JAWS-style announcement text.
- **VoiceOver_Renderer**: The module (`voiceover-renderer.ts`) that formats an AnnouncementModel as VoiceOver-style announcement text.
- **Static_Content**: HTML elements and text nodes that screen readers announce in browse mode but that are not interactive (e.g., `<p>`, `<blockquote>`, text nodes).
- **Text_Node**: A DOM Text node (nodeType === 3) containing raw character data inside an element.
- **Shadow_DOM**: The encapsulated DOM tree attached to an element via `element.shadowRoot`, used by web components.
- **Browse_Mode**: The screen reader mode where the user navigates through all page content using a virtual cursor, as opposed to focus mode which only visits interactive elements.
- **Hidden_State**: The condition where an element is excluded from the accessibility tree due to `aria-hidden="true"`, `display: none`, or `visibility: hidden` on the element or any ancestor.

## Requirements

### Requirement 1: Traverse All Child Elements Regardless of Role

**User Story:** As a developer, I want the tree builder to traverse child elements even when a parent element has no ARIA role, so that accessible children nested inside non-role containers are included in the tree.

#### Acceptance Criteria

1. WHEN the Tree_Builder encounters an Element with no implicit or explicit ARIA role, THE Tree_Builder SHALL continue traversing the children of that Element.
2. WHEN a child Element inside a role-less parent has an implicit or explicit ARIA role, THE Tree_Builder SHALL include that child as an AccessibleNode in the tree.
3. WHEN a role-less Element contains only role-less descendants with no Text_Nodes, THE Tree_Builder SHALL omit that Element and all its descendants from the tree.
4. THE Tree_Builder SHALL preserve the correct parent-child nesting of AccessibleNodes when intermediate role-less Elements are traversed.

### Requirement 2: Expand Implicit Role Mappings

**User Story:** As a developer, I want all semantically meaningful HTML elements to have implicit ARIA role mappings, so that the engine represents the same elements that screen readers announce.

#### Acceptance Criteria

1. THE Role_Mapper SHALL map `<p>` to the `paragraph` role in IMPLICIT_ROLE_MAP.
2. THE Role_Mapper SHALL map `<blockquote>` to the `blockquote` role in IMPLICIT_ROLE_MAP.
3. THE Role_Mapper SHALL map `<code>` to the `code` role in IMPLICIT_ROLE_MAP.
4. THE Role_Mapper SHALL map `<pre>` to the `code` role in IMPLICIT_ROLE_MAP.
5. THE Role_Mapper SHALL map `<table>` to the `table` role in IMPLICIT_ROLE_MAP.
6. THE Role_Mapper SHALL map `<tr>` to the `row` role in IMPLICIT_ROLE_MAP.
7. THE Role_Mapper SHALL map `<td>` to the `cell` role in IMPLICIT_ROLE_MAP.
8. THE Role_Mapper SHALL map `<th>` to the `columnheader` role in IMPLICIT_ROLE_MAP.
9. THE Role_Mapper SHALL map `<dl>` to the `definition list` role equivalent (`list` role with a distinguishing property) in IMPLICIT_ROLE_MAP.
10. THE Role_Mapper SHALL map `<dt>` to the `term` role in IMPLICIT_ROLE_MAP.
11. THE Role_Mapper SHALL map `<dd>` to the `definition` role in IMPLICIT_ROLE_MAP.
12. THE Role_Mapper SHALL map `<figure>` to the `figure` role in IMPLICIT_ROLE_MAP.
13. THE Role_Mapper SHALL map `<figcaption>` to the `caption` role in IMPLICIT_ROLE_MAP.
14. THE Role_Mapper SHALL map `<details>` to the `group` role in IMPLICIT_ROLE_MAP.
15. THE Role_Mapper SHALL map `<summary>` to the `button` role in IMPLICIT_ROLE_MAP.
16. THE Role_Mapper SHALL map `<dialog>` to the `dialog` role in IMPLICIT_ROLE_MAP.
17. THE Role_Mapper SHALL map `<meter>` to the `meter` role in IMPLICIT_ROLE_MAP.
18. THE Role_Mapper SHALL map `<progress>` to the `progressbar` role in IMPLICIT_ROLE_MAP.
19. THE Role_Mapper SHALL map `<output>` to the `status` role in IMPLICIT_ROLE_MAP.
20. THE Role_Mapper SHALL map `<fieldset>` to the `group` role in IMPLICIT_ROLE_MAP, with the `<legend>` child providing the accessible name.
21. THE Role_Mapper SHALL map `<legend>` to the `caption` role in IMPLICIT_ROLE_MAP.
22. THE Role_Mapper SHALL map `<iframe>` to the `document` role in IMPLICIT_ROLE_MAP, with the `title` attribute providing the accessible name.
23. THE Role_Mapper SHALL map `<video>` to the `application` role in IMPLICIT_ROLE_MAP (screen readers announce it as a media player).
24. THE Role_Mapper SHALL map `<audio>` to the `application` role in IMPLICIT_ROLE_MAP (screen readers announce it as a media player).
25. THE Role_Mapper SHALL map `<hr>` to the `separator` role in IMPLICIT_ROLE_MAP.
26. THE Role_Mapper SHALL map `<caption>` (table caption element) to the `caption` role in IMPLICIT_ROLE_MAP.
27. THE Role_Mapper SHALL map `<abbr>` to the `text` role in IMPLICIT_ROLE_MAP, with the `title` attribute providing the accessible description.
28. THE AccessibleRole type and SUPPORTED_ROLES array SHALL include all new roles: `paragraph`, `blockquote`, `code`, `table`, `row`, `cell`, `columnheader`, `rowheader`, `term`, `definition`, `figure`, `caption`, `group`, `dialog`, `meter`, `progressbar`, `status`, `document`, `application`, `separator`.


### Requirement 3: Capture Text Nodes

**User Story:** As a developer, I want the tree builder to capture DOM Text nodes as accessible nodes, so that plain text content announced by screen readers in browse mode is represented in the tree.

#### Acceptance Criteria

1. WHEN the Tree_Builder traverses an Element's children, THE Tree_Builder SHALL iterate over `childNodes` (not just `children`) to include Text_Nodes.
2. WHEN a Text_Node contains non-whitespace characters, THE Tree_Builder SHALL create an AccessibleNode with the `staticText` role and the trimmed text as the `name`.
3. WHEN a Text_Node contains only whitespace characters, THE Tree_Builder SHALL omit that Text_Node from the tree.
4. THE AccessibleRole type and SUPPORTED_ROLES array SHALL include the `staticText` role.
5. THE Tree_Builder SHALL preserve the document order of Text_Nodes relative to sibling Element nodes within the same parent.

### Requirement 4: Traverse Shadow DOM

**User Story:** As a developer, I want the tree builder to traverse shadow DOM trees attached to web components, so that content rendered inside shadow roots is included in the accessibility tree.

#### Acceptance Criteria

1. WHEN an Element has an open `shadowRoot`, THE Tree_Builder SHALL traverse the children of the `shadowRoot` in addition to the Element's light DOM children.
2. WHEN an Element has a closed `shadowRoot` (shadowRoot is null), THE Tree_Builder SHALL traverse only the light DOM children of that Element.
3. THE Tree_Builder SHALL process shadow DOM children before light DOM slotted children to match browser accessibility tree ordering.
4. WHEN a shadow DOM subtree contains accessible Elements, THE Tree_Builder SHALL include those Elements as AccessibleNodes in the tree.

### Requirement 5: Respect Inherited Hidden State

**User Story:** As a developer, I want the tree builder to exclude elements hidden by ancestor `aria-hidden`, `display: none`, or `visibility: hidden`, so that the accessibility tree does not contain content invisible to screen readers.

#### Acceptance Criteria

1. WHEN an ancestor Element has `aria-hidden="true"`, THE Tree_Builder SHALL exclude the descendant Element and all its children from the accessibility tree.
2. WHEN an ancestor Element has computed style `display: none`, THE Tree_Builder SHALL exclude the descendant Element and all its children from the accessibility tree.
3. WHEN an ancestor Element has computed style `visibility: hidden`, THE Tree_Builder SHALL exclude the descendant Element and all its children from the accessibility tree.
4. IF the Tree_Builder operates in an environment without CSS computation (e.g., server-side HTML parsing), THEN THE Tree_Builder SHALL check only `aria-hidden` inheritance and skip CSS-based hidden checks without error.
5. THE Tree_Builder SHALL check hidden state before performing any other extraction on an Element to avoid unnecessary computation.

### Requirement 6: Update NVDA Renderer for New Roles

**User Story:** As a developer, I want the NVDA renderer to announce all new node types with correct NVDA-style phrasing, so that the predicted output matches real NVDA behavior for static content.

#### Acceptance Criteria

1. WHEN the NVDA_Renderer encounters a `staticText` node, THE NVDA_Renderer SHALL output the text content without a role label.
2. WHEN the NVDA_Renderer encounters a `paragraph` node, THE NVDA_Renderer SHALL output the node without a role announcement (NVDA does not announce paragraph boundaries).
3. WHEN the NVDA_Renderer encounters a `blockquote` node, THE NVDA_Renderer SHALL output "block quote" as the role text.
4. WHEN the NVDA_Renderer encounters a `code` node, THE NVDA_Renderer SHALL output "code" as the role text.
5. WHEN the NVDA_Renderer encounters a `table` node, THE NVDA_Renderer SHALL output "table" as the role text.
6. WHEN the NVDA_Renderer encounters a `row` node, THE NVDA_Renderer SHALL output "row" as the role text.
7. WHEN the NVDA_Renderer encounters a `cell` node, THE NVDA_Renderer SHALL output the cell content without a role label.
8. WHEN the NVDA_Renderer encounters a `columnheader` node, THE NVDA_Renderer SHALL output "column header" as the role text.
9. WHEN the NVDA_Renderer encounters a `rowheader` node, THE NVDA_Renderer SHALL output "row header" as the role text.
10. WHEN the NVDA_Renderer encounters a `term` node, THE NVDA_Renderer SHALL output the term content without a role label.
11. WHEN the NVDA_Renderer encounters a `definition` node, THE NVDA_Renderer SHALL output the definition content without a role label.
12. WHEN the NVDA_Renderer encounters a `figure` node, THE NVDA_Renderer SHALL output "figure" as the role text.
13. WHEN the NVDA_Renderer encounters a `dialog` node, THE NVDA_Renderer SHALL output "dialog" as the role text.
14. WHEN the NVDA_Renderer encounters a `meter` node, THE NVDA_Renderer SHALL output the value text followed by "meter" as the role text.
15. WHEN the NVDA_Renderer encounters a `progressbar` node, THE NVDA_Renderer SHALL output the value text followed by "progress bar" as the role text.
16. WHEN the NVDA_Renderer encounters a `status` node, THE NVDA_Renderer SHALL output the content as a live region status update.
17. WHEN the NVDA_Renderer encounters a `group` node with a name, THE NVDA_Renderer SHALL output the name followed by "grouping" as the role text.
18. WHEN the NVDA_Renderer encounters a `caption` node, THE NVDA_Renderer SHALL output the caption text as the name without a role label.

### Requirement 7: Update VoiceOver Renderer for New Roles

**User Story:** As a developer, I want the VoiceOver renderer to announce all new node types with correct VoiceOver-style phrasing, so that the predicted output matches real VoiceOver behavior for static content.

#### Acceptance Criteria

1. WHEN the VoiceOver_Renderer encounters a `staticText` node, THE VoiceOver_Renderer SHALL output the text content without a role label.
2. WHEN the VoiceOver_Renderer encounters a `paragraph` node, THE VoiceOver_Renderer SHALL output the node without a role announcement.
3. WHEN the VoiceOver_Renderer encounters a `blockquote` node, THE VoiceOver_Renderer SHALL output "blockquote" as the role text.
4. WHEN the VoiceOver_Renderer encounters a `code` node, THE VoiceOver_Renderer SHALL output "code" as the role text.
5. WHEN the VoiceOver_Renderer encounters a `table` node, THE VoiceOver_Renderer SHALL output "table" followed by row and column count as the role text.
6. WHEN the VoiceOver_Renderer encounters a `row` node, THE VoiceOver_Renderer SHALL output "row" as the role text.
7. WHEN the VoiceOver_Renderer encounters a `cell` node, THE VoiceOver_Renderer SHALL output the cell content without a role label.
8. WHEN the VoiceOver_Renderer encounters a `columnheader` node, THE VoiceOver_Renderer SHALL output "column header" as the role text.
9. WHEN the VoiceOver_Renderer encounters a `rowheader` node, THE VoiceOver_Renderer SHALL output "row header" as the role text.
10. WHEN the VoiceOver_Renderer encounters a `term` node, THE VoiceOver_Renderer SHALL output the term content without a role label.
11. WHEN the VoiceOver_Renderer encounters a `definition` node, THE VoiceOver_Renderer SHALL output the definition content without a role label.
12. WHEN the VoiceOver_Renderer encounters a `figure` node, THE VoiceOver_Renderer SHALL output "figure" as the role text.
13. WHEN the VoiceOver_Renderer encounters a `dialog` node, THE VoiceOver_Renderer SHALL output "web dialog" as the role text.
14. WHEN the VoiceOver_Renderer encounters a `meter` node, THE VoiceOver_Renderer SHALL output the value text followed by "level indicator" as the role text.
15. WHEN the VoiceOver_Renderer encounters a `progressbar` node, THE VoiceOver_Renderer SHALL output the value text followed by "progress indicator" as the role text.
16. WHEN the VoiceOver_Renderer encounters a `status` node, THE VoiceOver_Renderer SHALL output the content as a live region status update.
17. WHEN the VoiceOver_Renderer encounters a `group` node with a name, THE VoiceOver_Renderer SHALL output the name followed by "group" as the role text.
18. WHEN the VoiceOver_Renderer encounters a `caption` node, THE VoiceOver_Renderer SHALL output the caption text as the name without a role label.

### Requirement 8: Update JAWS Renderer for New Roles

**User Story:** As a developer, I want the JAWS renderer to announce all new node types with correct JAWS-style phrasing, so that the predicted output matches real JAWS behavior for static content.

#### Acceptance Criteria

1. WHEN the JAWS_Renderer encounters a `staticText` node, THE JAWS_Renderer SHALL output the text content without a role label.
2. WHEN the JAWS_Renderer encounters a `paragraph` node, THE JAWS_Renderer SHALL output the node without a role announcement.
3. WHEN the JAWS_Renderer encounters a `blockquote` node, THE JAWS_Renderer SHALL output "block quote" as the role text.
4. WHEN the JAWS_Renderer encounters a `code` node, THE JAWS_Renderer SHALL output "code" as the role text.
5. WHEN the JAWS_Renderer encounters a `table` node, THE JAWS_Renderer SHALL output "table with [N] rows and [M] columns" as the role text.
6. WHEN the JAWS_Renderer encounters a `row` node, THE JAWS_Renderer SHALL output "row [N]" as the role text.
7. WHEN the JAWS_Renderer encounters a `cell` node, THE JAWS_Renderer SHALL output "column [N]" followed by the cell content.
8. WHEN the JAWS_Renderer encounters a `columnheader` node, THE JAWS_Renderer SHALL output "column header" as the role text.
9. WHEN the JAWS_Renderer encounters a `rowheader` node, THE JAWS_Renderer SHALL output "row header" as the role text.
10. WHEN the JAWS_Renderer encounters a `term` node, THE JAWS_Renderer SHALL output the term content without a role label.
11. WHEN the JAWS_Renderer encounters a `definition` node, THE JAWS_Renderer SHALL output the definition content without a role label.
12. WHEN the JAWS_Renderer encounters a `figure` node, THE JAWS_Renderer SHALL output "figure" as the role text.
13. WHEN the JAWS_Renderer encounters a `dialog` node, THE JAWS_Renderer SHALL output "dialog" as the role text.
14. WHEN the JAWS_Renderer encounters a `meter` node, THE JAWS_Renderer SHALL output the value text followed by "meter" as the role text.
15. WHEN the JAWS_Renderer encounters a `progressbar` node, THE JAWS_Renderer SHALL output the value text followed by "progress bar" as the role text.
16. WHEN the JAWS_Renderer encounters a `status` node, THE JAWS_Renderer SHALL output the content as a live region status update.
17. WHEN the JAWS_Renderer encounters a `group` node with a name, THE JAWS_Renderer SHALL output the name followed by "group" as the role text.
18. WHEN the JAWS_Renderer encounters a `caption` node, THE JAWS_Renderer SHALL output the caption text as the name without a role label.

### Requirement 9: Model Serialization Round-Trip for New Roles

**User Story:** As a developer, I want the model serialization to correctly handle all new roles and node types, so that accessibility trees with expanded content can be serialized and deserialized without data loss.

#### Acceptance Criteria

1. THE Serialization module SHALL serialize AccessibleNodes with any of the new AccessibleRole values to JSON without error.
2. THE Serialization module SHALL deserialize JSON containing any of the new AccessibleRole values back into valid AccessibleNodes without error.
3. FOR ALL valid AnnouncementModels containing new role types, serializing then deserializing SHALL produce an equivalent AnnouncementModel (round-trip property).
4. THE Validation module SHALL accept all new AccessibleRole values as valid roles during model validation.

### Requirement 10: Backward Compatibility with Existing Tests

**User Story:** As a developer, I want all existing tests to continue passing after the engine expansion, so that the changes do not introduce regressions in currently supported functionality.

#### Acceptance Criteria

1. THE existing 562 CLI test cases SHALL continue to pass without modification after the engine expansion changes.
2. THE existing 77 web test cases SHALL continue to pass without modification after the engine expansion changes.
3. WHEN the Tree_Builder processes HTML that previously produced a valid accessibility tree, THE Tree_Builder SHALL produce a tree that is a superset of the previous output (new nodes may be added, existing nodes SHALL remain unchanged in role, name, and state).
4. WHEN the NVDA_Renderer, VoiceOver_Renderer, or JAWS_Renderer processes a tree containing only pre-expansion roles, THE Renderer SHALL produce identical output to the pre-expansion version.
