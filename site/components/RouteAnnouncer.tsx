'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function RouteAnnouncer() {
  const pathname = usePathname();
  const [announcement, setAnnouncement] = useState('');
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the initial render — only announce on actual navigation
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Small delay to let the new page render its <h1>
    const timer = setTimeout(() => {
      const main = document.getElementById('main-content');
      if (!main) return;

      const h1 = main.querySelector('h1');
      if (h1) {
        if (!h1.hasAttribute('tabindex')) {
          h1.setAttribute('tabindex', '-1');
        }
        h1.focus();
        setAnnouncement(h1.textContent || '');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" role="status" className="sr-only">
      {announcement}
    </div>
  );
}
