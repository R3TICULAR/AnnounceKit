import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AnalysisEntry, ScreenReaderOption } from '../analyzer.js';
import './ak-copy-button.js';

const panelStyles = css`
  :host { display: block; }
  .panel { display: flex; flex-direction: column; gap: 0.5rem; height: 100%; }
  .panel-header { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
  h2 { font-size: 0.9375rem; font-weight: 600; margin: 0; color: var(--ak-heading-color, #111827); }
  .actions { display: flex; gap: 0.375rem; align-items: center; }
  pre {
    flex: 1; margin: 0; padding: 0.75rem;
    font-family: ui-monospace, monospace; font-size: 0.8125rem; line-height: 1.6;
    background: var(--ak-pre-bg, #f8fafc); border: 1px solid var(--ak-border-color, #e2e8f0);
    border-radius: 0.375rem; overflow: auto; white-space: pre-wrap; word-break: break-word;
    color: var(--ak-pre-color, #1e293b); min-height: 8rem;
  }
  .empty-msg { color: var(--ak-muted-color, #94a3b8); font-style: italic; }
  .entry-heading { font-weight: 600; margin-bottom: 0.25rem; }
  .entry + .entry { margin-top: 1rem; border-top: 1px solid var(--ak-border-color, #e2e8f0); padding-top: 1rem; }
`;

function renderEntry(entry: AnalysisEntry, sr: ScreenReaderOption): string {
  if (sr === 'All') {
    return [
      `--- NVDA ---\n${entry.announcements.nvda}`,
      `--- JAWS ---\n${entry.announcements.jaws}`,
      `--- VoiceOver ---\n${entry.announcements.voiceover}`,
    ].join('\n\n');
  }
  const map: Record<ScreenReaderOption, string> = {
    NVDA: entry.announcements.nvda,
    JAWS: entry.announcements.jaws,
    VoiceOver: entry.announcements.voiceover,
    All: '',
  };
  return map[sr];
}

/**
 * Screen reader announcement output panel.
 * Renders one block per matched entry.
 */
@customElement('ak-announcement-panel')
export class AkAnnouncementPanel extends LitElement {
  static styles = panelStyles;

  @property() label = 'Screen Reader Announcement';
  @property({ type: Boolean }) empty = true;
  @property() screenReader: ScreenReaderOption = 'NVDA';
  @property({ type: Array }) entries: AnalysisEntry[] = [];

  private get _content(): string {
    if (!this.entries.length) return '';
    if (this.entries.length === 1) return renderEntry(this.entries[0], this.screenReader);
    return this.entries
      .map((e, i) => `=== Element ${i + 1} ===\n${renderEntry(e, this.screenReader)}`)
      .join('\n\n');
  }

  render() {
    const content = this._content;

    return html`
      <div class="panel">
        <div class="panel-header">
          <h2>${this.label}</h2>
          <div class="actions">
            <ak-copy-button
              .text=${content}
              label="Copy announcement"
              ?disabled=${this.empty}
            ></ak-copy-button>
          </div>
        </div>
        <pre aria-label=${this.label}>
          ${this.empty
            ? html`<span class="empty-msg">Run analysis to see announcements.</span>`
            : content}
        </pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ak-announcement-panel': AkAnnouncementPanel; }
}
