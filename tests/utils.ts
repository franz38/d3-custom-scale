import { expect } from "vitest";

export const roundEpsilon = (x: number): number => Math.round(x * 1e12) / 1e12;

export const assertInDelta = (
  actual: number,
  expected: number,
  delta = 1e-6
) => {
  expect(actual).toBeCloseTo(expected, delta);
};

const deltaValue = 1e-10;
export const assertInDeltaCustom = (actual: number, expected: number) =>
  assertInDelta(actual, expected, deltaValue);
