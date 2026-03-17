import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import type { AnalysisResult, ScreenReaderOption } from '../analyzer.js';
import './ak-announcement-panel.js';
import './ak-audit-panel.js';
import './ak-model-panel.js';
import './ak-diff-panel.js';
import './ak-warnings-list.js';

/**
 * Results container — renders all four output panels and a warnings list.
 * Contains an ARIA live region that announces when results update.
 */
@customElement('ak-results')
export class AkResults extends LitElement {
  static styles = css`
    :host { display: block; }

    .live-region {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
    }

    .panels {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .panels { grid-template-columns: 1fr; }
    }

    ak-warnings-list { margin-bottom: 0.75rem; }
  `;

  @property({ attribute: false }) result: AnalysisResult | null = null;
  @property() screenReader: ScreenReaderOption = 'NVDA';
  @property({ type: Boolean }) diffMode = false;

  private get _liveText(): string {
    if (!this.result) return '';
    const count = this.result.entries.length;
    return `Analysis complete. ${count} element${count !== 1 ? 's' : ''} analysed.`;
  }

  render() {
    const empty = !this.result;
    const entries = this.result?.entries ?? [];
    const warnings = this.result?.warnings ?? [];

    // Audit and model content: join all entries if multiple
    const auditContent = entries.map((e) => e.audit).join('\n\n---\n\n');
    const jsonContent = entries.map((e) => e.json).join('\n\n---\n\n');

    return html`
      <!-- ARIA live region: announces result updates to screen readers -->
      <div
        class="live-region"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >${this._liveText}</div>

      ${warnings.length
        ? html`<ak-warnings-list .warnings=${warnings}></ak-warnings-list>`
        : ''}

      <div class="panels">
        <ak-announcement-panel
          .entries=${entries}
          .screenReader=${this.screenReader}
          ?empty=${empty}
        ></ak-announcement-panel>

        <ak-audit-panel
          .content=${auditContent}
          ?empty=${empty}
        ></ak-audit-panel>

        <ak-model-panel
          .content=${jsonContent}
          ?empty=${empty}
        ></ak-model-panel>

        ${this.diffMode
          ? html`<ak-diff-panel
              .diff=${this.result?.diff ?? null}
              ?empty=${empty || !this.result?.diff}
            ></ak-diff-panel>`
          : ''}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ak-results': AkResults; }
}
