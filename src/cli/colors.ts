import pc from 'picocolors';

export interface ColorFunctions {
  // Semantic colors for audit report
  error: (s: string) => string;
  warning: (s: string) => string;
  info: (s: string) => string;
  success: (s: string) => string;
  heading: (s: string) => string;
  title: (s: string) => string;
  dim: (s: string) => string;

  // Semantic colors for screen reader output
  roleName: (s: string) => string;
  stateName: (s: string) => string;
  elementName: (s: string) => string;
  sectionHeader: (s: string) => string;
  description: (s: string) => string;

  // Utility
  bold: (s: string) => string;
  enabled: boolean;
}

const identity = (s: string): string => s;

/** Check if color output should be enabled for a given stream */
export function isColorEnabled(stream: { isTTY?: boolean }): boolean {
  return stream.isTTY === true;
}

/** Create a set of color functions, either active or passthrough */
export function createColors(enabled: boolean): ColorFunctions {
  if (!enabled) {
    return {
      error: identity,
      warning: identity,
      info: identity,
      success: identity,
      heading: identity,
      title: identity,
      dim: identity,
      roleName: identity,
      stateName: identity,
      elementName: identity,
      sectionHeader: identity,
      description: identity,
      bold: identity,
      enabled: false,
    };
  }

  return {
    error: pc.red,
    warning: pc.yellow,
    info: pc.blue,
    success: pc.green,
    heading: (s: string) => pc.bold(pc.cyan(s)),
    title: (s: string) => pc.bold(pc.cyan(s)),
    dim: pc.dim,
    roleName: pc.cyan,
    stateName: pc.yellow,
    elementName: (s: string) => pc.bold(pc.white(s)),
    sectionHeader: (s: string) => pc.bold(pc.white(s)),
    description: pc.dim,
    bold: pc.bold,
    enabled: true,
  };
}
