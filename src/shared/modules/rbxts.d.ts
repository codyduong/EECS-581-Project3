type Import = (...args: unknown[]) => Record<string, unknown>;

declare global {
  const TS: {
    import: Import;
  };
}

export {};
