import { describe, it, expect } from "vitest";
import {
  getTick,
  guessDecade,
  logitScaleDefDomain,
  mirrorNumber,
  scaleLogit,
} from "src/scales/scaleLogit";
import { assertInDeltaCustom } from "./utils";

describe("logit scale", () => {
  it("scaleLogit() has the expected defaults", () => {
    const s = scaleLogit();
    expect(s.domain()).toStrictEqual(logitScaleDefDomain); // [0.001, 0.999]
    expect(s.range()).toStrictEqual([0, 1]);
    expect(s.clamp()).toBe(false);
  });

  it("for values out of range (0,1) returns NaN", () => {
    const s = scaleLogit();
    expect(s(0)).toStrictEqual(NaN);
    expect(s(1)).toStrictEqual(NaN);
    expect(s(-1)).toStrictEqual(NaN);
    expect(s(2)).toStrictEqual(NaN);
  });

  it("does not clamp by default", () => {
    const s = scaleLogit();
    assertInDeltaCustom(s(0.000001), -0.5001447858459409);
    assertInDeltaCustom(s(0.99999999999), 2.333598900780734);
  });

  it("does not nice the domain by default", () => {
    const s = scaleLogit().domain([0.00015, 0.999987]);
    expect(s.domain()).toStrictEqual([0.00015, 0.999987]);
    expect(s.copy().nice().domain()).toStrictEqual([0.0001, 0.99999]);
  });

  it("logit.clamp(true)(x) clamps to the domain", () => {
    const s = scaleLogit().clamp(true);
    expect(s(0.000001)).toBe(0);
    expect(s(0.99999999999)).toBe(1);
    expect(s(0)).toBe(0);
    expect(s(1)).toBe(1);
    expect(s(-1)).toBe(0);
    expect(s(2)).toBe(1);
  });

  it("logit(x) maps a domain value x to a range value y", () => {
    const s = scaleLogit();
    assertInDeltaCustom(s(0.5), 0.5); // Make sure to replace assertInDeltaCustom with your custom assertion function
    expect(s(0.999)).toBe(1);
    expect(s(0.001)).toBe(0);
  });

  // logit.range(…) can take colors
  it("logit.range(…) can take colors", () => {
    // @ts-ignore
    const s = scaleLogit().range(["red", "blue"]);
    expect(s(0.5)).toBe("rgb(127, 0, 128)");
    expect(s(0.1)).toBe("rgb(168, 0, 87)");
    expect(s(0.9)).toBe("rgb(87, 0, 168)");
    // @ts-ignore
    s.range(["#ff0000", "#0000ff"]);
    expect(s(0.9)).toBe("rgb(87, 0, 168)");
    // @ts-ignore
    s.range(["#f00", "#00f"]);
    expect(s(0.9)).toBe("rgb(87, 0, 168)");

    // s.range([rgb(255, 0, 0), hsl(240, 1, 0.5)]);
    // expect(s(5)).toBe("rgb(77, 0, 178)");
    // @ts-ignore
    s.range(["hsl(0,100%,50%)", "hsl(240,100%,50%)"]);
    expect(s(0.1)).toBe("rgb(168, 0, 87)");
  });

  it("logit.nice() nices the domain, extending it to negative powers of ten", () => {
    const x = scaleLogit().domain([0.00015, 0.999987]).nice();
    expect(x.domain()).toEqual([0.0001, 0.99999]);

    x.domain([0.35, 0.67]).nice();
    expect(x.domain()).toEqual([0.1, 0.9]);

    x.domain([0.0000000000017, 0.999999999992]).nice();
    expect(x.domain()).toEqual([0.000000000001, 0.999999999999]);
    assertInDeltaCustom(x(0.000000000001), 0);
    assertInDeltaCustom(x(0.999999999999), 1);
  });

  it("logit.invert(y) maps a range value y to a domain value x", () => {
    const s = scaleLogit();
    assertInDeltaCustom(s.invert(0), 0.001);
    assertInDeltaCustom(s.invert(1), 0.999);
    assertInDeltaCustom(s.invert(0.5), 0.5);

    s.domain([1e-6, 1 - 1e-6]);
    assertInDeltaCustom(s.invert(0), 1e-6);
    assertInDeltaCustom(s.invert(1), 1 - 1e-6);
    assertInDeltaCustom(s.invert(0.5), 0.5);
  });

  it("logit.invert(y) coerces range values to numbers", () => {
    // @ts-ignore
    const s = scaleLogit().range(["0", "1"]);
    expect(s.invert(0)).toBeCloseTo(0.001);
  });

  it("logit.domain(domain) coerces domain values to numbers", () => {
    // @ts-ignore
    expect(scaleLogit().domain(["0.1", "0.9"]).domain()).toEqual([0.1, 0.9]); // @ts-ignore
    expect(scaleLogit().domain(["0.00000012", "0.9999997"]).domain()).toEqual([
      0.00000012, 0.9999997,
    ]);
  });

  const s = scaleLogit();
  expect(s.ticks()).toEqual([
    0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 0.9, 0.95, 0.99, 0.995, 0.999,
  ]);
  expect(s.ticks(5)).toEqual([0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999]);
  expect(s.ticks(15)).toEqual([
    0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 0.8, 0.9, 0.95, 0.98,
    0.99, 0.995, 0.998, 0.999,
  ]);
  expect(s.ticks(20)).toEqual([
    0.001, 0.002, 0.003, 0.005, 0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7,
    0.8, 0.9, 0.95, 0.97, 0.98, 0.99, 0.995, 0.997, 0.998, 0.999,
  ]);
  expect(s.ticks(25)).toEqual([
    0.001, 0.002, 0.003, 0.005, 0.007, 0.01, 0.02, 0.03, 0.05, 0.07, 0.1, 0.2,
    0.3, 0.5, 0.7, 0.8, 0.9, 0.93, 0.95, 0.97, 0.98, 0.99, 0.993, 0.995, 0.997,
    0.998, 0.999,
  ]);

  it("logit.ticks(count) returns the expected ticks for an asymmetric domain [0.01, 0.99999]", () => {
    const s = scaleLogit().domain([0.01, 0.99999]);
    expect(s.ticks()).toEqual([
      0.01, 0.05, 0.1, 0.5, 0.9, 0.95, 0.99, 0.995, 0.999, 0.9995, 0.9999,
      0.99995, 0.99999,
    ]);
    expect(s.ticks(5)).toEqual([
      0.01, 0.1, 0.5, 0.9, 0.99, 0.999, 0.9999, 0.99999,
    ]);
    expect(s.ticks(15)).toEqual([
      0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 0.8, 0.9, 0.95, 0.98, 0.99, 0.995, 0.998,
      0.999, 0.9995, 0.9998, 0.9999, 0.99995, 0.99998, 0.99999,
    ]);
    expect(s.ticks(20)).toEqual([
      0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 0.8, 0.9, 0.95, 0.98, 0.99, 0.995, 0.998,
      0.999, 0.9995, 0.9998, 0.9999, 0.99995, 0.99998, 0.99999,
    ]);
    expect(s.ticks(25)).toEqual([
      0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95, 0.97,
      0.98, 0.99, 0.995, 0.997, 0.998, 0.999, 0.9995, 0.9997, 0.9998, 0.9999,
      0.99995, 0.99997, 0.99998, 0.99999,
    ]);
  });

  it("logit.ticks(count) returns the expected ticks for the domain [0.001, 0.1]", () => {
    const s = scaleLogit().domain([0.001, 0.1]);
    expect(s.ticks()).toEqual([
      0.001, 0.002, 0.003, 0.005, 0.007, 0.01, 0.02, 0.03, 0.05, 0.07, 0.1,
    ]);
    expect(s.ticks(2)).toEqual([0.001, 0.01, 0.1]);
    expect(s.ticks(5)).toEqual([0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1]);
    expect(s.ticks(20)).toEqual([
      0.001, 0.002, 0.003, 0.005, 0.007, 0.01, 0.02, 0.03, 0.05, 0.07, 0.1,
    ]);
  });

  it("logit.ticks(count) returns the expected ticks for the domain [0.000001, 0.01]", () => {
    const s = scaleLogit().domain([0.000001, 0.01]);
    expect(s.ticks()).toEqual([
      0.000001, 0.000002, 0.000005, 0.00001, 0.00002, 0.00005, 0.0001, 0.0002,
      0.0005, 0.001, 0.002, 0.005, 0.01,
    ]);
    expect(s.ticks(3)).toEqual([0.000001, 0.00001, 0.0001, 0.001, 0.01]);
    expect(s.ticks(5)).toEqual([
      0.000001, 0.000005, 0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.005, 0.01,
    ]);
    expect(s.ticks(15)).toEqual([
      0.000001, 0.000002, 0.000003, 0.000005, 0.00001, 0.00002, 0.00003,
      0.00005, 0.0001, 0.0002, 0.0003, 0.0005, 0.001, 0.002, 0.003, 0.005, 0.01,
    ]);
    expect(s.ticks(20)).toEqual([
      0.000001, 0.000002, 0.000003, 0.000005, 0.000007, 0.00001, 0.00002,
      0.00003, 0.00005, 0.00007, 0.0001, 0.0002, 0.0003, 0.0005, 0.0007, 0.001,
      0.002, 0.003, 0.005, 0.007, 0.01,
    ]);
  });

  it("logit.ticks(count) returns the expected ticks for the domain [0.99, 0.9999999]", () => {
    const s = scaleLogit().domain([0.99, 0.9999999]);
    expect(s.ticks()).toEqual([
      0.99, 0.995, 0.999, 0.9995, 0.9999, 0.99995, 0.99999, 0.999995, 0.999999,
      0.9999995, 0.9999999,
    ]);
    expect(s.ticks(3)).toEqual([
      0.99, 0.999, 0.9999, 0.99999, 0.999999, 0.9999999,
    ]);
    expect(s.ticks(5)).toEqual([
      0.99, 0.999, 0.9999, 0.99999, 0.999999, 0.9999999,
    ]);
    expect(s.ticks(15)).toEqual([
      0.99, 0.995, 0.998, 0.999, 0.9995, 0.9998, 0.9999, 0.99995, 0.99998,
      0.99999, 0.999995, 0.999998, 0.999999, 0.9999995, 0.9999998, 0.9999999,
    ]);
    expect(s.ticks(20)).toEqual([
      0.99, 0.995, 0.997, 0.998, 0.999, 0.9995, 0.9997, 0.9998, 0.9999, 0.99995,
      0.99997, 0.99998, 0.99999, 0.999995, 0.999997, 0.999998, 0.999999,
      0.9999995, 0.9999997, 0.9999998, 0.9999999,
    ]);
    expect(s.ticks(25)).toEqual([
      0.99, 0.993, 0.995, 0.997, 0.998, 0.999, 0.9993, 0.9995, 0.9997, 0.9998,
      0.9999, 0.99993, 0.99995, 0.99997, 0.99998, 0.99999, 0.999993, 0.999995,
      0.999997, 0.999998, 0.999999, 0.9999993, 0.9999995, 0.9999997, 0.9999998,
      0.9999999,
    ]);
  });

  it("logit.ticks(count) returns the expected ticks for a 'broad' domain [0.000000000001, 0.999999999999]", () => {
    const s = scaleLogit().domain([0.000000000001, 0.999999999999]);
    expect(s.ticks()).toStrictEqual([
      1e-12, 1e-10, 1e-8, 0.000001, 0.0001, 0.01, 0.5, 0.99, 0.9999, 0.999999,
      0.99999999, 0.9999999999, 0.999999999999,
    ]);
    expect(s.ticks(1)).toStrictEqual([
      1e-12, 1e-8, 0.5, 0.99999999, 0.999999999999,
    ]);
    expect(s.ticks(3)).toStrictEqual([
      1e-12, 1e-8, 0.0001, 0.5, 0.9999, 0.99999999, 0.999999999999,
    ]);
    expect(s.ticks(5)).toStrictEqual([
      1e-12, 1e-8, 0.0001, 0.5, 0.9999, 0.99999999, 0.999999999999,
    ]);
    expect(s.ticks(15)).toStrictEqual([
      1e-12, 1e-11, 1e-10, 1e-9, 1e-8, 1e-7, 0.000001, 0.00001, 0.0001, 0.001,
      0.01, 0.1, 0.5, 0.9, 0.99, 0.999, 0.9999, 0.99999, 0.999999, 0.9999999,
      0.99999999, 0.999999999, 0.9999999999, 0.99999999999, 0.999999999999,
    ]);
    expect(s.ticks(25)).toStrictEqual([
      1e-12, 5e-12, 1e-11, 5e-11, 1e-10, 5e-10, 1e-9, 5e-9, 1e-8, 5e-8, 1e-7,
      5e-7, 0.000001, 0.000005, 0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.005,
      0.01, 0.05, 0.1, 0.5, 0.9, 0.95, 0.99, 0.995, 0.999, 0.9995, 0.9999,
      0.99995, 0.99999, 0.999995, 0.999999, 0.9999995, 0.9999999, 0.99999995,
      0.99999999, 0.999999995, 0.999999999, 0.9999999995, 0.9999999999,
      0.99999999995, 0.99999999999, 0.999999999995, 0.999999999999,
    ]);
    expect(s.ticks(50)).toStrictEqual([
      1e-12, 2e-12, 5e-12, 1e-11, 2e-11, 5e-11, 1e-10, 2e-10, 5e-10, 1e-9, 2e-9,
      5e-9, 1e-8, 2e-8, 5e-8, 1e-7, 2e-7, 5e-7, 0.000001, 0.000002, 0.000005,
      0.00001, 0.00002, 0.00005, 0.0001, 0.0002, 0.0005, 0.001, 0.002, 0.005,
      0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 0.8, 0.9, 0.95, 0.98, 0.99, 0.995, 0.998,
      0.999, 0.9995, 0.9998, 0.9999, 0.99995, 0.99998, 0.99999, 0.999995,
      0.999998, 0.999999, 0.9999995, 0.9999998, 0.9999999, 0.99999995,
      0.99999998, 0.99999999, 0.999999995, 0.999999998, 0.999999999,
      0.9999999995, 0.9999999998, 0.9999999999, 0.99999999995, 0.99999999998,
      0.99999999999, 0.999999999995, 0.999999999998, 0.999999999999,
    ]);
    expect(s.ticks(80)).toStrictEqual([
      1e-12, 2e-12, 3e-12, 5e-12, 1e-11, 2e-11, 3e-11, 5e-11, 1e-10, 2e-10,
      3e-10, 5e-10, 1e-9, 2e-9, 3e-9, 5e-9, 1e-8, 2e-8, 3e-8, 5e-8, 1e-7, 2e-7,
      3e-7, 5e-7, 0.000001, 0.000002, 0.000003, 0.000005, 0.00001, 0.00002,
      0.00003, 0.00005, 0.0001, 0.0002, 0.0003, 0.0005, 0.001, 0.002, 0.003,
      0.005, 0.01, 0.02, 0.03, 0.05, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95,
      0.97, 0.98, 0.99, 0.995, 0.997, 0.998, 0.999, 0.9995, 0.9997, 0.9998,
      0.9999, 0.99995, 0.99997, 0.99998, 0.99999, 0.999995, 0.999997, 0.999998,
      0.999999, 0.9999995, 0.9999997, 0.9999998, 0.9999999, 0.99999995,
      0.99999997, 0.99999998, 0.99999999, 0.999999995, 0.999999997, 0.999999998,
      0.999999999, 0.9999999995, 0.9999999997, 0.9999999998, 0.9999999999,
      0.99999999995, 0.99999999997, 0.99999999998, 0.99999999999,
      0.999999999995, 0.999999999997, 0.999999999998, 0.999999999999,
    ]);
  });

  it("logit.ticks(count) returns the expected ticks for a not nice domain", () => {
    const s = scaleLogit().domain([0.0017, 0.993]);
    expect(s.ticks()).toEqual([0.005, 0.01, 0.05, 0.1, 0.5, 0.9, 0.95, 0.99]);
  });

  it("logit.range(range) makes a copy of range values", () => {
    const r = [1, 2];
    const s = scaleLogit().range(r);
    expect(s.range()).toEqual([1, 2]);
    r.push(3);
    expect(s.range()).toEqual([1, 2]);
    expect(r).toEqual([1, 2, 3]);
  });

  it("logit.range() returns a copy of range values", () => {
    const s = scaleLogit();
    const r = s.range();
    expect(r).toEqual([0, 1]);
    r.push(3);
    expect(s.range()).toEqual([0, 1]);
  });

  it("logit.copy() isolates changes to the domain", () => {
    const x = scaleLogit();
    const y = x.copy();
    x.domain([0.0001, 0.999]);
    expect(y.domain()).toStrictEqual(logitScaleDefDomain);
    assertInDeltaCustom(y(logitScaleDefDomain[0]), 0);
    assertInDeltaCustom(x(logitScaleDefDomain[0]), 0.14292276987827152);
    assertInDeltaCustom(x(0.0001), 0);
    y.domain([0.1, 0.9]);
    assertInDeltaCustom(x(0.0001), 0);
    assertInDeltaCustom(y(0.0001), -1.5958805171708443);
    expect(x.domain()).toStrictEqual([0.0001, 0.999]);
    expect(y.domain()).toStrictEqual([0.1, 0.9]);
  });

  it("logit.copy() isolates changes to the range", () => {
    const x = scaleLogit();
    const y = x.copy();
    x.range([1, 2]);
    assertInDeltaCustom(x.invert(1), logitScaleDefDomain[0]);
    assertInDeltaCustom(y.invert(1), logitScaleDefDomain[1]);
    expect(y.range()).toStrictEqual([0, 1]);
    y.range([2, 3]);
    assertInDeltaCustom(x.invert(2), logitScaleDefDomain[1]);
    assertInDeltaCustom(y.invert(2), logitScaleDefDomain[0]);
    expect(x.range()).toStrictEqual([1, 2]);
    expect(y.range()).toStrictEqual([2, 3]);
  });

  it("logit.copy() isolates changes to clamping", () => {
    const x = scaleLogit().clamp(true);
    const y = x.copy();
    x.clamp(false);
    assertInDeltaCustom(x(0.0000001), -0.6668356607060651);
    assertInDeltaCustom(y(0.0000001), 0);
    expect(x.clamp()).toBe(false);
    expect(y.clamp()).toBe(true);
    y.clamp(false);
    x.clamp(true);
    assertInDeltaCustom(x(0.0000001), 0);
    assertInDeltaCustom(y(0.0000001), -0.6668356607060651);
    expect(x.clamp()).toBe(true);
    expect(y.clamp()).toBe(false);
  });

  it("get tick correctly", () => {
    expect(getTick(-7, 1)).toEqual(1e-7);
    expect(getTick(-7, 2)).toEqual(2e-7);
    expect(getTick(-7, 5)).toEqual(5e-7);
    expect(getTick(-7, 7)).toEqual(7e-7);
    expect(getTick(7, 1)).toEqual(1 - 1e-7);
    expect(getTick(7, 2)).toEqual(1 - 2e-7);
    expect(getTick(7, 5)).toEqual(1 - 5e-7);
    expect(getTick(7, 7)).toEqual(1 - 7e-7);
  });

  it("get tick correctly in the [0.1, 0.9] domain", () => {
    expect(getTick(-1, 1)).toEqual(0.1);
    expect(getTick(-1, 3)).toEqual(0.3);
    expect(getTick(-1, 5)).toBeNull();
    expect(getTick(-1, 7)).toBeNull();
    expect(getTick(1, 1)).toEqual(0.9);
    expect(getTick(1, 3)).toEqual(0.7);
    expect(getTick(1, 5)).toBeNull();
    expect(getTick(1, 7)).toBeNull();
  });

  it("logit.tickformat() returns correct values", () => {
    const s = scaleLogit();

    expect(
      [0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999].map(s.tickFormat())
    ).toEqual(["1e-3", "0.01", "0.10", "0.50", "0.90", "0.99", "1-1e-3"]);

    expect(
      // @ts-ignore
      [0.001, 0.01, 0.1, 0.5, 0.9, 0.99, 0.999].map(s.tickFormat(10, ["~s"]))
    ).toEqual(["1m", "10m", "100m", "500m", "900m", "990m", "999m"]);

    expect(
      [0.01, 0.02, 0.05, 0.1, 0.5, 0.6, 0.9, 0.97, 0.99].map(s.tickFormat())
    ).toEqual([
      "0.01",
      "0.02",
      "0.05",
      "0.10",
      "0.50",
      "0.60",
      "0.90",
      "0.97",
      "0.99",
    ]);

    expect(
      [0.01, 0.02, 0.05, 0.1, 0.5, 0.6, 0.9, 0.97, 0.99].map(
        // @ts-ignore
        s.tickFormat(10, ["~s"])
      )
    ).toEqual([
      "10m",
      "20m",
      "50m",
      "100m",
      "500m",
      "600m",
      "900m",
      "970m",
      "990m",
    ]);
  });

  it("finds the correct decade of a number smaller than 0.5", () => {
    expect(guessDecade(0.3)).toBe(-1);
    expect(guessDecade(0.1)).toBe(-1);
    expect(guessDecade(0.03)).toBe(-2);
    expect(guessDecade(0.01)).toBe(-2);
    expect(guessDecade(0.0000003)).toBe(-7);
    expect(guessDecade(0.0000001)).toBe(-7);
    expect(guessDecade(0.000000000003)).toBe(-12);
    expect(guessDecade(0.000000000001)).toBe(-12);
    expect(guessDecade(1e-2)).toBe(-2);
    expect(guessDecade(1e-5)).toBe(-5);
    expect(guessDecade(1e-12)).toBe(-12);
    expect(guessDecade(2e-12)).toBe(-12);
    expect(guessDecade(1e-18)).toBe(-18);
  });

  it("finds the correct decade of a number bigger than 0.5", () => {
    expect(guessDecade(0.7)).toBe(1);
    expect(guessDecade(0.9)).toBe(1);
    expect(guessDecade(0.97)).toBe(2);
    expect(guessDecade(0.99)).toBe(2);
    expect(guessDecade(0.9997)).toBe(4);
    expect(guessDecade(0.9999)).toBe(4);
    expect(guessDecade(0.9999997)).toBe(7);
    expect(guessDecade(1 - 1e-2)).toBe(2);
    expect(guessDecade(1 - 1e-5)).toBe(5);
    expect(guessDecade(1 - 1e-10)).toBe(10);
    expect(guessDecade(1 - 1e-14)).toBe(14);
    expect(guessDecade(1 - 1e-16)).toBe(16);
  });

  it("mirrors correctly numbers in (0, 0.5]", () => {
    expect(mirrorNumber(7e-2)).toBe(0.93);
    expect(mirrorNumber(7e-5)).toBe(0.99993);
    expect(mirrorNumber(7e-7)).toBe(0.9999993);
    expect(mirrorNumber(7e-12)).toBe(0.999999999993);
    expect(mirrorNumber(3e-2)).toBe(0.97);
    expect(mirrorNumber(3e-5)).toBe(0.99997);
    expect(mirrorNumber(3e-7)).toBe(0.9999997);
    expect(mirrorNumber(3e-12)).toBe(0.999999999997);
    expect(mirrorNumber(5e-1)).toBe(0.5);
    expect(mirrorNumber(0.013)).toBe(0.987);
  });

  it("mirrors correctly numbers in [0.5, 1)", () => {
    expect(mirrorNumber(0.9993)).toBe(0.0007);
    expect(mirrorNumber(0.9997)).toBe(0.0003);
    expect(mirrorNumber(0.6666)).toBe(0.3334);
    expect(mirrorNumber(0.9999993)).toBe(0.0000007);
    expect(mirrorNumber(0.9999997)).toBe(0.0000003);
    expect(mirrorNumber(0.9996666)).toBe(0.0003334);
  });
});
