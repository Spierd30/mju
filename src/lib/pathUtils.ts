/**
 * Generate dot-notation and bracket-notation paths from a path array.
 * pathParts is an array of strings (object keys) or numbers (array indices).
 */
export function toDotNotation(pathParts: (string | number)[]): string {
  if (pathParts.length === 0) return '';
  return pathParts
    .map((part, i) => {
      if (typeof part === 'number') return `[${part}]`;
      if (i === 0) return part;
      // Use dot if key is a valid identifier, bracket notation otherwise
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(part)) return `.${part}`;
      return `["${part}"]`;
    })
    .join('');
}

export function toBracketNotation(pathParts: (string | number)[]): string {
  return pathParts
    .map((part) => {
      if (typeof part === 'number') return `[${part}]`;
      return `["${part}"]`;
    })
    .join('');
}

/**
 * Parse a dot-notation path string into parts.
 * e.g. "foo.bar[0].baz" -> ["foo", "bar", 0, "baz"]
 */
export function parsePath(path: string): (string | number)[] {
  const parts: (string | number)[] = [];
  const re = /([^.[\]]+)|\[(\d+)\]|\["([^"]+)"\]/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(path)) !== null) {
    if (match[1] !== undefined) parts.push(match[1]);
    else if (match[2] !== undefined) parts.push(parseInt(match[2], 10));
    else if (match[3] !== undefined) parts.push(match[3]);
  }
  return parts;
}

/**
 * Get the value at a given path in a JSON object.
 */
export function getValueAtPath(root: unknown, pathParts: (string | number)[]): unknown {
  let current: unknown = root;
  for (const part of pathParts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string | number, unknown>)[part];
  }
  return current;
}

export function getValueType(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}
