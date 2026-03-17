import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

/**
 * Renders a list of parser/tree-builder warnings.
 * Hidden when warnings array is empty.
 */
@customElement('ak-warnings-list')
export class AkWarningsList extends LitElement {
  static styles = css`
    :host { display: block; }

    .container {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--ak-warning-border, #fbbf24);
      border-radius: 0.375rem;
      background: var(--ak-warning-bg, #fffbeb);
    }

    .heading {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--ak-warning-heading-color, #92400e);
      margin: 0 0 0.25rem;
    }

    ul {
      margin: 0;
      padding-left: 1.25rem;
    }

    li {
      font-size: 0.8125rem;
      color: var(--ak-warning-color, #78350f);
      line-height: 1.5;
    }
  `;

  @property({ type: Array }) warnings: Array<{ message: string }> = [];

  render() {
    if (!this.warnings.length) return html``;

    return html`
      <div class="container" role="region" aria-label="Warnings">
        <p class="heading">⚠ ${this.warnings.length} warning${this.warnings.length > 1 ? 's' : ''}</p>
        <ul>
          ${this.warnings.map((w) => html`<li>${w.message}</li>`)}
        </ul>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap { 'ak-warnings-list': AkWarningsList; }
}
