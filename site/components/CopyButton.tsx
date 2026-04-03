'use client';

import { useState } from 'react';
import { useLiveRegion } from './LiveRegion';

interface CopyButtonProps {
  text: string;
  label?: string;
}

export function CopyButton({ text, label = 'Copy to clipboard' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { announce } = useLiveRegion();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      announce('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      announce('Copy failed');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      className="rounded bg-surface-subtle px-2 py-1 text-xs text-foreground-muted hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}
