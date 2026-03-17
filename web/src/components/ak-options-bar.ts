import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { ScreenReaderOption } from '../analyzer.js';

/**
 * Options bar: screen reader selector, CSS selector input, diff mode toggle.
 * Fires `ak-options-change` with `detail: { screenReader, cssSelector, diffMode }`.
 */
@customElement('ak-options-bar')
export class AkOptionsBar extends LitElement {
  static styles = css`
    :host { display: block; }

    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-end;
    }

    .field { display: flex; flex-direction: column; gap: 0.25rem; }

    label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--ak-label-color, #374151);
    }

    select, input[type="text"] {
      padding: 0.375rem 0.625rem;
      font-size: 0.875rem;
      border: 1px solid var(--ak-border-color, #d1d5db);
      border-radius: 0.375rem;
      background: var(--ak-input-bg, #fff);
      color: var(--ak-input-color, #111827);
      min-width: 10rem;
    }

    select:focus, input[type="text"]:focus {
      outline: 2px solid var(--ak-focus-color, #2563eb);
      outline-offset: 1px;
    }

    select:disabled, input[type="text"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .toggle-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0;
    }

    input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      cursor: pointer;
    }

    input[type="checkbox"]:disabled { cursor: not-allowed; opacity: 0.5; }

    .validation {
      font-size: 0.75rem;
      color: var(--ak-error-color, #dc2626);
    }
  `;

  @property() screenReader: ScreenReaderOption = 'NVDA';
  @property() cssSelector = '';
  @property({ type: Boolean }) diffMode = false;
  @property({ type: Boolean }) disabled = false;

  private _srId = `ak-sr-select-${Math.random().toString(36).slice(2)}`;
  private _csId = `ak-cs-input-${Math.random().toString(36).slice(2)}`;
  private _dmId = `ak-dm-check-${Math.random().toString(36).slice(2)}`;

  private get _selectorInvalid(): boolean {
    if (!this.cssSelector.trim()) return false;
    try {
      document.querySelector(this.cssSelector);
      return false;
    } catch {
      return true;
    }
  }

  private _emit() {
    this.dispatchEvent(
      new CustomEvent('ak-options-change', {
        bubbles: true,
        composed: true,
        detail: {
          screenReader: this.screenReader,
          cssSelector: this.cssSelector,
          diffMode: this.diffMode,
        },
      })
    );
  }

  private _onSrChange(e: Event) {
    this.screenReader = (e.target as HTMLSelectElement).value as ScreenReaderOption;
    this._emit();
  }

  private _onCsInput(e: Event) {
    this.cssSelector = (e.target as HTMLInputElement).value;
    this._emit();
  }

  private _onDmChange(e: Event) {
    this.diffMode = (e.target as HTMLInputElement).checked;
    this._emit();
  }

  render() {
    const invalid = this._selectorInvalid;

    return html`
      <div class="bar" role="group" aria-label="Analysis options">

        <div class="field">
          <label for=${this._srId}>Screen reader</label>
          <select
            id=${this._srId}
            .value=${this.screenReader}
            ?disabled=${this.disabled}
            @change=${this._onSrChange}
          >
            <option value="NVDA">NVDA</option>
            <option value="JAWS">JAWS</option>
            <option value="VoiceOver">VoiceOver</option>
            <option value="All">All</option>
          </select>
        </div>

        <div class="field">
          <label for=${this._csId}>CSS selector (optional)</label>
          <input
            type="text"
            id=${this._csId}
            .value=${this.cssSelector}
            ?disabled=${this.disabled}
            placeholder="e.g. button, .my-class"
            aria-describedby=${invalid ? `${this._csId}-err` : ''}
            aria-invalid=${invalid ? 'true' : 'false'}
            @input=${this._onCsInput}
          />
          ${invalid
            ? html`<span id=${`${this._csId}-err`} class="validation" role="alert">
                Invalid CSS selector.
              </span>`
            : ''}
        </div>

        <div class="toggle-field">
          <label for=${this._dmId}>Diff mode</label>
          <div class="toggle-row">
            <input
              type="checkbox"
              id=${this._dmId}
              .checked=${this.diffMode}
              ?disabled=${this.disabled}
              @change=${this._onDmChange}
            />
          </div>
        </div>

      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'ak-options-bar': AkOptionsBar;
  }
}
