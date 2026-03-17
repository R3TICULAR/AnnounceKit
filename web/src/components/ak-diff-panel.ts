import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { SemanticDiff } from '../analyzer.js';
import { describeChange } from '@core/diff/diff-algorithm.js';
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
  .summary { font-size: 0.8125rem; color: var(--ak-muted-color, #64748b); }
  .added    { color: var(--ak-added-color,   #16a34a); }
  .removed  { color: var(--ak-removed-color, #dc2626); }
  .changed  { color: var(--ak-changed-color, #d97706); }
`;

function diffToText(diff: SemanticDiff): string {
  if (diff.changes.length === 0) return 'No changes detected.';
  return diff.changes.map((c) => {
    const prefix = c.type === 'added' ? '+ ' : c.type === 'removed' ? '- ' : '~ ';
    return prefix + describeChange(c);
  }).join('\n');
}

/**
 * Semantic diff output panel.
 */
@customElement('ak-diff-panel')
export class AkDiffPanel extends LitElement {
  static styles = panelStyles;

  @property() label = 'Semantic Diff';
  @property({ type: Boolean }) empty = true;
  @property({ attribute: false }) diff: SemanticDiff | null = null;

  private get _content(): string {
    return this.diff ? diffToText(this.diff) : '';
  }

  render() {
    const content = this._content;
    const summary = this.diff
      ? `+${this.diff.summary.added} added  -${this.diff.summary.removed} removed  ~${this.diff.summary.changed} changed`
      : '';

    return html`
      <div class="panel">
        <div class="panel-header">
          <h2>${this.label}</h2>
          <div class="actions">
            ${summary ? html`<span class="summary">${summary}</span>` : ''}
            <ak-copy-button
              .text=${content}
              label="Copy diff"
              ?disabled=${this.empty}
            ></ak-copy-button>
          </div>
        </div>
        <pre aria-label=${this.label}>
          ${this.empty
            ? html`<span class="empty-msg">Run diff analysis to see changes.</span>`
            : content}
        </pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ak-diff-panel': AkDiffPanel; }
}
