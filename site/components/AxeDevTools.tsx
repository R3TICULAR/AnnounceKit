'use client';

import { useEffect } from 'react';

/**
 * Runs axe-core accessibility audits in development mode.
 * Logs violations to the browser console when the DOM changes.
 * Renders nothing — side-effect only.
 */
export function AxeDevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let observer: MutationObserver | null = null;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let running = false;

    import('axe-core').then((axe) => {
      const run = async () => {
        if (running) return;
        running = true;
        try {
          const results = await axe.default.run(document.body);
          if (results.violations.length > 0) {
            console.group(
              `%c♿ axe: ${results.violations.length} accessibility violation(s)`,
              'color: #dc2626; font-weight: bold;'
            );
            results.violations.forEach((v) => {
              console.groupCollapsed(
                `%c${v.impact?.toUpperCase()} — ${v.help}`,
                `color: ${v.impact === 'critical' || v.impact === 'serious' ? '#dc2626' : '#d97706'};`
              );
              console.log('Rule:', v.id);
              console.log('Help:', v.helpUrl);
              console.log('Nodes:', v.nodes.map((n) => n.html));
              console.groupEnd();
            });
            console.groupEnd();
          }
        } catch {
          // Silently ignore — axe can fail on partial DOM during HMR
        } finally {
          running = false;
        }
      };

      // Run once after initial render settles
      setTimeout(run, 2000);

      // Re-run on DOM changes (debounced)
      observer = new MutationObserver(() => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(run, 2000);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    });

    return () => {
      observer?.disconnect();
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return null;
}
