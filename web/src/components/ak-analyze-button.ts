import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Analyze button with loading spinner.
 * Fires `ak-analyze` (no detail) when clicked.
 */
@customElement('ak-analyze-button')
export class AkAnalyzeButton extends LitElement {
  static styles = css`
    :host { display: inline-block; }

    button {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1.25rem;
      font-size: 0.9375rem;
      font-weight: 600;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
      background: var(--ak-primary-bg, #2563eb);
      color: var(--ak-primary-color, #fff);
      transition: background 0.15s;
    }

    button:hover:not(:disabled) { background: var(--ak-primary-hover-bg, #1d4ed8); }
    button:focus { outline: 2px solid var(--ak-focus-color, #2563eb); outline-offset: 2px; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }

    .spinner {
      width: 1em;
      height: 1em;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      flex-shrink: 0;
    }

    @keyframes spin { to { transform: rotate(360deg); } }
  `;

  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean }) disabled = false;

  private _onClick() {
    this.dispatchEvent(
      new CustomEvent('ak-analyze', { bubbles: true, composed: true })
    );
  }

  render() {
    return html`
      <button
        type="button"
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading ? 'true' : 'false'}
        @click=${this._onClick}
      >
        ${this.loading ? html`<span class="spinner" aria-hidden="true"></span>` : ''}
        ${this.loading ? 'Analyzing…' : 'Analyze'}
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ak-analyze-button': AkAnalyzeButton;
  }
}
