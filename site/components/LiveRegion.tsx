'use client';

import { useState, useCallback, createContext, useContext, useMemo } from 'react';

interface LiveRegionContextValue {
  announce: (message: string) => void;
}

const LiveRegionContext = createContext<LiveRegionContextValue>({
  announce: () => {},
});

export function useLiveRegion() {
  return useContext(LiveRegionContext);
}

export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState('');

  const announce = useCallback((msg: string) => {
    // Clear first to ensure re-announcement of identical messages
    setMessage('');
    requestAnimationFrame(() => setMessage(msg));
  }, []);

  const value = useMemo(() => ({ announce }), [announce]);

  return (
    <LiveRegionContext.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="sr-only">
        {message}
      </div>
    </LiveRegionContext.Provider>
  );
}
