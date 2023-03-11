export const range = (start: number, end: number): number[] =>
  Array.from({ length: end - start }, (_, i) => i + start);

export const ifExists = <T, U>(
  value: T | undefined,
  f: (value: T) => U
): U | undefined => (value === undefined ? undefined : f(value));

type Test = {
  description: string;
  test: any;
  expected: any;
};

const allTestsPassed = (tests: Test[]): boolean =>
  tests.every(({ test, expected }) => test === expected);

const failedTestToText = ({
  description: name,
  test,
  expected,
}: Test): string =>
  `❌ ${name}
  expected: ${expected}
  got: ${test}`;

const failedTestsText = (tests: Test[]): string =>
  tests
    .filter(({ test, expected }) => test !== expected)
    .map(failedTestToText)
    .join("\n");

export const testResultsToString = (tests: Test[]): string =>
  allTestsPassed(tests) ? "🎉 All tests passed!" : failedTestsText(tests);
