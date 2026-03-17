import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SIZE_LIMIT_BYTES } from '../constants.js';

/**
 * HTML textarea with file upload.
 * Fires `ak-html-change` with `detail: { value: string }` on every change.
 * Fires `ak-html-change` with `detail: { error: string }` when a file exceeds SIZE_LIMIT_BYTES.
 */
@customElement('ak-html-input')
export class AkHtmlInput extends LitElement {
  static styles = css`
    :host { display: block; }

    .field { display: flex; flex-direction: column; gap: 0.375rem; }

    label {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--ak-label-color, #374151);
    }

    textarea {
      width: 100%;
      min-height: 12rem;
      padding: 0.5rem 0.75rem;
      font-family: ui-monospace, monospace;
      font-size: 0.8125rem;
      border: 1px solid var(--ak-border-color, #d1d5db);
      border-radius: 0.375rem;
      resize: vertical;
      box-sizing: border-box;
      background: var(--ak-input-bg, #fff);
      color: var(--ak-input-color, #111827);
    }

    textarea:focus { outline: 2px solid var(--ak-focus-color, #2563eb); outline-offset: 1px; }
    textarea:disabled { opacity: 0.5; cursor: not-allowed; }

    .row { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

    .upload-label {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      font-weight: 500;
      border: 1px solid var(--ak-border-color, #d1d5db);
      border-radius: 0.375rem;
      cursor: pointer;
      background: var(--ak-btn-bg, #f9fafb);
      color: var(--ak-btn-color, #374151);
      user-select: none;
    }

    .upload-label:hover { background: var(--ak-btn-hover-bg, #f3f4f6); }

    input[type="file"] {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .error {
      font-size: 0.8125rem;
      color: var(--ak-error-color, #dc2626);
      margin-top: 0.25rem;
    }

    .validation {
      font-size: 0.8125rem;
      color: var(--ak-error-color, #dc2626);
    }
  `;

  @property() value = '';
  @property() label = 'HTML Input';
  @property({ type: Boolean }) disabled = false;

  /** Set to true by parent when analysis was attempted with empty value. */
  @property({ type: Boolean, attribute: 'show-validation' }) showValidation = false;

  @state() private _fileError = '';

  private _inputId = `ak-html-input-${Math.random().toString(36).slice(2)}`;
  private _fileInputId = `ak-file-input-${Math.random().toString(36).slice(2)}`;

  private _onTextareaInput(e: Event) {
    const ta = e.target as HTMLTextAreaElement;
    this._fileError = '';
    this.dispatchEvent(
      new CustomEvent('ak-html-change', {
        bubbles: true,
        composed: true,
        detail: { value: ta.value },
      })
    );
  }

  private async _onFileChange(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-selected
    input.value = '';

    if (file.size > SIZE_LIMIT_BYTES) {
      this._fileError =
        `File "${file.name}" is ${(file.size / (1024 * 1024)).toFixed(2)} MB, ` +
        `which exceeds the ${SIZE_LIMIT_BYTES / (1024 * 1024)} MB limit.`;
      this.dispatchEvent(
        new CustomEvent('ak-html-change', {
          bubbles: true,
          composed: true,
          detail: { error: this._fileError },
        })
      );
      return;
    }

    this._fileError = '';
    const text = await file.text();
    this.dispatchEvent(
      new CustomEvent('ak-html-change', {
        bubbles: true,
        composed: true,
        detail: { value: text },
      })
    );
  }

  render() {
    const showEmpty = this.showValidation && !this.value.trim();

    return html`
      <div class="field">
        <label for=${this._inputId}>${this.label}</label>

        <textarea
          id=${this._inputId}
          .value=${this.value}
          ?disabled=${this.disabled}
          placeholder="Paste HTML here…"
          aria-describedby=${showEmpty ? `${this._inputId}-err` : ''}
          @input=${this._onTextareaInput}
        ></textarea>

        ${showEmpty
          ? html`<span id=${`${this._inputId}-err`} class="validation" role="alert">
              HTML input is required.
            </span>`
          : ''}

        <div class="row">
          <label class="upload-label" for=${this._fileInputId}>
            📂 Upload .html file
          </label>
          <input
            type="file"
            id=${this._fileInputId}
            accept=".html,.htm"
            ?disabled=${this.disabled}
            @change=${this._onFileChange}
          />
        </div>

        ${this._fileError
          ? html`<span class="error" role="alert">${this._fileError}</span>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ak-html-input': AkHtmlInput;
  }
}
