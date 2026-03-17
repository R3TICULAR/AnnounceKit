import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
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
  button.download {
    display: inline-flex; align-items: center; gap: 0.25rem;
    padding: 0.25rem 0.625rem; font-size: 0.8125rem; font-weight: 500;
    border: 1px solid var(--ak-border-color, #d1d5db); border-radius: 0.375rem;
    cursor: pointer; background: var(--ak-btn-bg, #f9fafb); color: var(--ak-btn-color, #374151);
    white-space: nowrap;
  }
  button.download:hover:not(:disabled) { background: var(--ak-btn-hover-bg, #f3f4f6); }
  button.download:focus { outline: 2px solid var(--ak-focus-color, #2563eb); outline-offset: 1px; }
  button.download:disabled { opacity: 0.5; cursor: not-allowed; }
`;

/**
 * JSON model output panel.
 */
@customElement('ak-model-panel')
export class AkModelPanel extends LitElement {
  static styles = panelStyles;

  @property() content = '';
  @property() label = 'Accessibility Model (JSON)';
  @property({ type: Boolean }) empty = true;

  private _download() {
    const blob = new Blob([this.content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'accessibility-model.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  render() {
    return html`
      <div class="panel">
        <div class="panel-header">
          <h2>${this.label}</h2>
          <div class="actions">
            <ak-copy-button
              .text=${this.content}
              label="Copy JSON model"
              ?disabled=${this.empty}
            ></ak-copy-button>
            <button
              class="download"
              type="button"
              ?disabled=${this.empty}
              aria-label="Download JSON model"
              @click=${this._download}
            >⬇ Download</button>
          </div>
        </div>
        <pre aria-label=${this.label}>
          ${this.empty
            ? html`<span class="empty-msg">Run analysis to see the JSON model.</span>`
            : this.content}
        </pre>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ak-model-panel': AkModelPanel; }
}
