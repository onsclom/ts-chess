export const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start }, (_, i) => i + start);

export const ifExists = <T, U>(
  value: T | undefined,
  f: (value: T) => U
): U | undefined => (value === undefined ? undefined : f(value));

export const deepEquals = (a: any, b: any): boolean =>
  JSON.stringify(a) === JSON.stringify(b);

export const assert = (description: string, expected, actual) => ({
  description,
  expected,
  actual,
  success: deepEquals(actual, expected),
});
