import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  runAnalysis,
  runDiffAnalysis,
  type AnalysisResult,
  type ScreenReaderOption,
} from '../analyzer.js';
import { SelectorError } from '@core/extractor/tree-builder.js';
import { ParsingError } from '../browser-parser.js';
import './ak-html-input.js';
import './ak-options-bar.js';
import './ak-analyze-button.js';
import './ak-results.js';

/**
 * Root shell — owns all application state.
 * All errors from analyzer.ts are caught here; components never catch errors.
 */
@customElement('ak-app')
export class AkApp extends LitElement {
  static styles = css`
    :host {
      display: block;
      font-family: ui-sans-serif, system-ui, sans-serif;
      color: var(--ak-color, #111827);
      background: var(--ak-bg, #fff);
    }

    .app {
      max-width: 72rem;
      margin: 0 auto;
      padding: 1.5rem 1rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    header { border-bottom: 1px solid var(--ak-border-color, #e5e7eb); padding-bottom: 1rem; }

    h1 {
      font-size: 1.375rem;
      font-weight: 700;
      margin: 0 0 0.25rem;
      color: var(--ak-heading-color, #111827);
    }

    .subtitle { font-size: 0.875rem; color: var(--ak-muted-color, #6b7280); margin: 0; }

    .inputs { display: flex; flex-direction: column; gap: 1rem; }

    .inputs-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 640px) { .inputs-row { grid-template-columns: 1fr; } }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 1rem;
    }

    .error-banner {
      padding: 0.75rem 1rem;
      border: 1px solid var(--ak-error-border, #fca5a5);
      border-radius: 0.375rem;
      background: var(--ak-error-bg, #fef2f2);
      color: var(--ak-error-color, #dc2626);
      font-size: 0.875rem;
    }

    .error-banner strong { font-weight: 600; }
  `;

  // ── Reactive state ──────────────────────────────────────────────────────
  @state() _html = '';
  @state() _htmlBefore = '';
  @state() _diffMode = false;
  @state() _screenReader: ScreenReaderOption = 'NVDA';
  @state() _cssSelector = '';
  @state() _loading = false;
  @state() _result: AnalysisResult | null = null;
  @state() _error: string | null = null;

  // ── Event handlers ──────────────────────────────────────────────────────

  private _onHtmlChange(e: CustomEvent) {
    if (e.detail.error) {
      this._error = e.detail.error;
    } else {
      this._html = e.detail.value ?? '';
      this._error = null;
    }
  }

  private _onHtmlBeforeChange(e: CustomEvent) {
    if (e.detail.error) {
      this._error = e.detail.error;
    } else {
      this._htmlBefore = e.detail.value ?? '';
      this._error = null;
    }
  }

  private _onOptionsChange(e: CustomEvent) {
    const { screenReader, cssSelector, diffMode } = e.detail;
    this._screenReader = screenReader;
    this._cssSelector = cssSelector;
    this._diffMode = diffMode;
  }

  private async _onAnalyze() {
    this._error = null;

    // Guard: validate inputs before calling analyzer
    if (!this._html.trim()) {
      this._error = 'HTML input is required.';
      return;
    }
    if (this._diffMode && !this._htmlBefore.trim()) {
      this._error = 'Before HTML is required in diff mode.';
      return;
    }

    this._loading = true;
    try {
      if (this._diffMode) {
        this._result = runDiffAnalysis({
          htmlBefore: this._htmlBefore,
          htmlAfter: this._html,
          cssSelector: this._cssSelector || undefined,
        });
      } else {
        this._result = runAnalysis({
          html: this._html,
          cssSelector: this._cssSelector || undefined,
        });
      }
    } catch (err) {
      // HTML value is preserved on error (requirement 2.5)
      if (err instanceof ParsingError || err instanceof SelectorError) {
        this._error = err.message;
      } else if (err instanceof Error) {
        this._error = `Unexpected error: ${err.message}`;
      } else {
        this._error = 'An unknown error occurred.';
      }
      this._result = null;
    } finally {
      this._loading = false;
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────

  render() {
    return html`
      <div class="app">
        <header>
          <h1>AnnounceKit Web</h1>
          <p class="subtitle">Analyse how screen readers will announce your HTML.</p>
        </header>

        <div class="inputs">
          ${this._diffMode
            ? html`
                <div class="inputs-row">
                  <ak-html-input
                    label="After (new HTML)"
                    .value=${this._html}
                    ?disabled=${this._loading}
                    @ak-html-change=${this._onHtmlChange}
                  ></ak-html-input>
                  <ak-html-input
                    label="Before (original HTML)"
                    .value=${this._htmlBefore}
                    ?disabled=${this._loading}
                    @ak-html-change=${this._onHtmlBeforeChange}
                  ></ak-html-input>
                </div>`
            : html`
                <ak-html-input
                  label="HTML Input"
                  .value=${this._html}
                  ?disabled=${this._loading}
                  @ak-html-change=${this._onHtmlChange}
                ></ak-html-input>`}
        </div>

        <div class="toolbar">
          <ak-options-bar
            .screenReader=${this._screenReader}
            .cssSelector=${this._cssSelector}
            .diffMode=${this._diffMode}
            ?disabled=${this._loading}
            @ak-options-change=${this._onOptionsChange}
          ></ak-options-bar>

          <ak-analyze-button
            ?loading=${this._loading}
            ?disabled=${this._loading}
            @ak-analyze=${this._onAnalyze}
          ></ak-analyze-button>
        </div>

        ${this._error
          ? html`<div class="error-banner" role="alert">
              <strong>Error:</strong> ${this._error}
            </div>`
          : ''}

        <ak-results
          .result=${this._result}
          .screenReader=${this._screenReader}
          .diffMode=${this._diffMode}
        ></ak-results>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ak-app': AkApp; }
}
