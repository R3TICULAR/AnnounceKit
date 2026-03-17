import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

/**
 * Copy-to-clipboard button.
 * Shows "Copied!" briefly on success, "Copy failed" when Clipboard API is unavailable.
 */
@customElement('ak-copy-button')
export class AkCopyButton extends LitElement {
  static styles = css`
    :host { display: inline-block; }

    button {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.625rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border: 1px solid var(--ak-border-color, #d1d5db);
      border-radius: 0.375rem;
      cursor: pointer;
      background: var(--ak-btn-bg, #f9fafb);
      color: var(--ak-btn-color, #374151);
      transition: background 0.1s;
      white-space: nowrap;
    }

    button:hover:not(:disabled) { background: var(--ak-btn-hover-bg, #f3f4f6); }
    button:focus { outline: 2px solid var(--ak-focus-color, #2563eb); outline-offset: 1px; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .success { color: var(--ak-success-color, #16a34a); }
    .error   { color: var(--ak-error-color,   #dc2626); }
  `;

  @property() text = '';
  @property() label = 'Copy';

  @state() private _status: 'idle' | 'copied' | 'failed' = 'idle';
  private _timer: ReturnType<typeof setTimeout> | null = null;

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timer) clearTimeout(this._timer);
  }

  private async _onClick() {
    try {
      await navigator.clipboard.writeText(this.text);
      this._status = 'copied';
    } catch {
      this._status = 'failed';
    }
    if (this._timer) clearTimeout(this._timer);
    this._timer = setTimeout(() => { this._status = 'idle'; }, 2000);
  }

  render() {
    const label =
      this._status === 'copied' ? 'Copied!' :
      this._status === 'failed' ? 'Copy failed' :
      this.label;

    const cls =
      this._status === 'copied' ? 'success' :
      this._status === 'failed' ? 'error' : '';

    return html`
      <button
        type="button"
        class=${cls}
        aria-label=${this.label}
        @click=${this._onClick}
      >${label}</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ak-copy-button': AkCopyButton; }
}
