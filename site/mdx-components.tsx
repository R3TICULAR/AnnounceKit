import type { MDXComponents } from 'mdx/types';
import React from 'react';

/** Client-side copy button for code blocks */
function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy code to clipboard"
      className="absolute right-2 top-2 rounded bg-surface-subtle px-2 py-1 text-xs text-foreground-muted hover:bg-brand-100 focus:outline-none focus:ring-2 focus:ring-brand-600"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

/** Extracts text content from React children recursively */
function extractText(children: React.ReactNode): string {
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(extractText).join('');
  if (React.isValidElement(children) && children.props?.children) {
    return extractText(children.props.children);
  }
  return '';
}

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: ({ children, ...props }) => {
      const code = extractText(children);
      return (
        <div className="relative my-4">
          <CopyCodeButton code={code} />
          <pre
            {...props}
            className="overflow-x-auto rounded-lg bg-foreground p-4 text-sm text-surface font-mono"
          >
            {children}
          </pre>
        </div>
      );
    },
    code: ({ children, ...props }) => (
      <code
        {...props}
        className="rounded bg-surface-subtle px-1.5 py-0.5 text-sm font-mono text-foreground"
      >
        {children}
      </code>
    ),
  };
}
