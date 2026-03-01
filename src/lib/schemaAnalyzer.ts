import type { ArrayStats, SchemaField, SchemaSummary, SearchResult } from '../types';
import { toDotNotation } from './pathUtils';

function getTypeStr(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

interface FieldAccumulator {
  types: Set<string>;
  presentCount: number;
}

function walkForSchema(
  value: unknown,
  depth: number,
  fieldMap: Map<string, FieldAccumulator>,
  totalItemsAtLevel: Map<string, number>
): number {
  if (typeof value !== 'object' || value === null) return depth;

  let maxDepth = depth;

  if (Array.isArray(value)) {
    for (const item of value) {
      const d = walkForSchema(item, depth + 1, fieldMap, totalItemsAtLevel);
      if (d > maxDepth) maxDepth = d;
    }
  } else {
    const obj = value as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      if (!fieldMap.has(key)) {
        fieldMap.set(key, { types: new Set(), presentCount: 0 });
        totalItemsAtLevel.set(key, 0);
      }
      const acc = fieldMap.get(key)!;
      acc.types.add(getTypeStr(val));
      acc.presentCount++;
      totalItemsAtLevel.set(key, (totalItemsAtLevel.get(key) ?? 0) + 1);

      const d = walkForSchema(val, depth + 1, fieldMap, totalItemsAtLevel);
      if (d > maxDepth) maxDepth = d;
    }
  }

  return maxDepth;
}

export function analyzeSchema(json: unknown): SchemaSummary {
  const fieldMap = new Map<string, FieldAccumulator>();
  const totalItemsAtLevel = new Map<string, number>();
  const maxDepth = walkForSchema(json, 0, fieldMap, totalItemsAtLevel);

  const fields: SchemaField[] = Array.from(fieldMap.entries()).map(([key, acc]) => {
    const totalCount = totalItemsAtLevel.get(key) ?? acc.presentCount;
    return {
      key,
      types: acc.types,
      presentCount: acc.presentCount,
      totalCount,
      optional: acc.presentCount < totalCount,
      hasTypeConflict: acc.types.size > 1,
    };
  });

  return {
    totalKeys: fieldMap.size,
    maxDepth,
    fields: fields.sort((a, b) => a.key.localeCompare(b.key)),
  };
}

export function analyzeArray(arr: unknown[]): ArrayStats {
  const length = arr.length;
  const types = [...new Set(arr.map(getTypeStr))];
  const allSameType = types.length === 1;

  if (allSameType && types[0] === 'number') {
    const nums = arr as number[];
    return {
      length,
      itemTypes: types,
      allSameType,
      min: Math.min(...nums),
      max: Math.max(...nums),
      uniqueCount: new Set(nums).size,
    };
  }

  if (allSameType && (types[0] === 'string' || types[0] === 'boolean' || types[0] === 'null')) {
    return {
      length,
      itemTypes: types,
      allSameType,
      uniqueCount: new Set(arr.map(String)).size,
    };
  }

  if (allSameType && types[0] === 'object') {
    // Array of objects — analyze keys
    const keyMap = new Map<string, FieldAccumulator>();
    for (const item of arr) {
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        for (const [key, val] of Object.entries(item as Record<string, unknown>)) {
          if (!keyMap.has(key)) keyMap.set(key, { types: new Set(), presentCount: 0 });
          const acc = keyMap.get(key)!;
          acc.types.add(getTypeStr(val));
          acc.presentCount++;
        }
      }
    }
    const objectKeys: SchemaField[] = Array.from(keyMap.entries()).map(([key, acc]) => ({
      key,
      types: acc.types,
      presentCount: acc.presentCount,
      totalCount: length,
      optional: acc.presentCount < length,
      hasTypeConflict: acc.types.size > 1,
    }));

    return { length, itemTypes: types, allSameType, objectKeys };
  }

  return { length, itemTypes: types, allSameType };
}

export function searchJson(
  json: unknown,
  query: string,
  pathParts: (string | number)[] = []
): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];
  const lq = query.toLowerCase();

  function walk(value: unknown, parts: (string | number)[]) {
    if (value === null || typeof value !== 'object') {
      // Primitive value — check value match
      const str = String(value);
      if (str.toLowerCase().includes(lq)) {
        results.push({
          path: toDotNotation(parts),
          matchType: 'value',
          matchText: str,
          value,
        });
      }
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item, i) => walk(item, [...parts, i]));
    } else {
      const obj = value as Record<string, unknown>;
      for (const [key, val] of Object.entries(obj)) {
        const keyPath = [...parts, key];
        // Check key match
        if (key.toLowerCase().includes(lq)) {
          results.push({
            path: toDotNotation(keyPath),
            matchType: 'key',
            matchText: key,
            value: val,
          });
        }
        walk(val, keyPath);
      }
    }
  }

  walk(json, pathParts);
  return results;
}
