/**
 * Entry point — registers all custom elements and mounts <ak-app>.
 * All components self-register via @customElement decorators when imported.
 */

// Root shell (imports all child components transitively)
import './components/ak-app.js';

// Ensure <ak-app> is in the document
const existing = document.querySelector('ak-app');
if (!existing) {
  const app = document.createElement('ak-app');
  document.body.appendChild(app);
}
