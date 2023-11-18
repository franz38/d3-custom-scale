import { scaleCustom } from "src/core/scaleCustom";
import { describe, it, expect } from "vitest";

const identity = (x: number) => x;

describe("scaleCustom() defaults, domain(), range(), clamp()", () => {
  it("has default values", () => {
    const s = scaleCustom(identity, identity);
    expect(s.domain()).toStrictEqual([0, 1]);
    expect(s.range()).toStrictEqual([0, 1]);
    expect(s.clamp()).toBe(false);
  });

  it("scaleCustom.domain() works", () => {
    const s = scaleCustom(identity, identity).domain([0, 10]);
    expect(s.domain()).toStrictEqual([0, 10]);
    s.domain([0, 100]);
    expect(s.domain()).toStrictEqual([0, 100]);
    expect(s.domain([0, 1000]).domain()).toStrictEqual([0, 1000]);
  });

  it("scaleCustom.range() works", () => {
    const s = scaleCustom(identity, identity).range([0, 10]);
    expect(s.range()).toStrictEqual([0, 10]);
    s.range([0, 100]);
    expect(s.range()).toStrictEqual([0, 100]);
    expect(s.range([0, 1000]).range()).toStrictEqual([0, 1000]);
  });

  it("scaleCustom.clamp() works", () => {
    const s = scaleCustom(identity, identity).clamp(true);
    expect(s.clamp()).toBe(true);
    s.clamp(false);
    expect(s.clamp()).toBe(false);
    expect(s.clamp(true).clamp()).toStrictEqual(true);
  });

  it("scaleCustom.clamp() is false by default", () => {
    expect(scaleCustom(identity, identity).clamp()).toBe(false);
    expect(scaleCustom(identity, identity).range([10, 20])(2)).toBe(30);
    expect(scaleCustom(identity, identity).range([10, 20])(-1)).toBe(0);
    expect(scaleCustom(identity, identity).range([10, 20]).invert(30)).toBe(2);
    expect(scaleCustom(identity, identity).range([10, 20]).invert(0)).toBe(-1);
  });

  it("scaleCustom.clamp(true) restricts output values to the range", () => {
    expect(scaleCustom(identity, identity).clamp(true).range([10, 20])(2)).toBe(
      20
    );
    expect(
      scaleCustom(identity, identity).clamp(true).range([10, 20])(-1)
    ).toBe(10);
  });

  it("scaleCustom.clamp(true) restricts input values to the domain", () => {
    expect(
      scaleCustom(identity, identity).clamp(true).range([10, 20]).invert(30)
    ).toBe(1);
    expect(
      scaleCustom(identity, identity).clamp(true).range([10, 20]).invert(0)
    ).toBe(0);
  });

  it("scaleCustom.domain(domain) makes a copy of domain values", () => {
    const d = [1, 2],
      s = scaleCustom(identity, identity).domain(d);
    expect(s.domain()).toStrictEqual([1, 2]);
    d.push(3);
    expect(s.domain()).toStrictEqual([1, 2]);
    expect(d).toStrictEqual([1, 2, 3]);
  });

  it("scaleCustom.domain() returns a copy of domain values", () => {
    const s = scaleCustom(identity, identity),
      d = s.domain();
    expect(d).toStrictEqual([0, 1]);
    d.push(3);
    expect(s.domain()).toStrictEqual([0, 1]);
  });
});

describe("scaleCustom().nice()", () => {
  it("linear.nice() is an alias for linear.nice(10)", () => {
    expect(
      scaleCustom(identity, identity).domain([0, 0.96]).nice().domain()
    ).toStrictEqual([0, 1]);
    expect(
      scaleCustom(identity, identity).domain([0, 96]).nice().domain()
    ).toStrictEqual([0, 100]);
  });

  it("linear.nice(count) extends the domain to match the desired ticks", () => {
    expect(
      scaleCustom(identity, identity).domain([0, 0.96]).nice(10).domain()
    ).toStrictEqual([0, 1]);
    expect(
      scaleCustom(identity, identity).domain([0, 96]).nice(10).domain()
    ).toStrictEqual([0, 100]);
    expect(
      scaleCustom(identity, identity).domain([0.96, 0]).nice(10).domain()
    ).toStrictEqual([1, 0]);
    expect(
      scaleCustom(identity, identity).domain([96, 0]).nice(10).domain()
    ).toStrictEqual([100, 0]);
    expect(
      scaleCustom(identity, identity).domain([0, -0.96]).nice(10).domain()
    ).toStrictEqual([0, -1]);
    expect(
      scaleCustom(identity, identity).domain([0, -96]).nice(10).domain()
    ).toStrictEqual([0, -100]);
    expect(
      scaleCustom(identity, identity).domain([-0.96, 0]).nice(10).domain()
    ).toStrictEqual([-1, 0]);
    expect(
      scaleCustom(identity, identity).domain([-96, 0]).nice(10).domain()
    ).toStrictEqual([-100, 0]);
    expect(
      scaleCustom(identity, identity).domain([-0.1, 51.1]).nice(8).domain()
    ).toStrictEqual([-10, 60]);
  });

  it("linear.nice(count) nices the domain, extending it to round numbers", () => {
    expect(
      scaleCustom(identity, identity).domain([1.1, 10.9]).nice(10).domain()
    ).toStrictEqual([1, 11]);
    expect(
      scaleCustom(identity, identity).domain([10.9, 1.1]).nice(10).domain()
    ).toStrictEqual([11, 1]);
    expect(
      scaleCustom(identity, identity).domain([0.7, 11.001]).nice(10).domain()
    ).toStrictEqual([0, 12]);
    expect(
      scaleCustom(identity, identity).domain([123.1, 6.7]).nice(10).domain()
    ).toStrictEqual([130, 0]);
    expect(
      scaleCustom(identity, identity).domain([0, 0.49]).nice(10).domain()
    ).toStrictEqual([0, 0.5]);
    expect(
      scaleCustom(identity, identity).domain([0, 14.1]).nice(5).domain()
    ).toStrictEqual([0, 20]);
    expect(
      scaleCustom(identity, identity).domain([0, 15]).nice(5).domain()
    ).toStrictEqual([0, 20]);
  });

  it("linear.nice(count) has no effect on degenerate domains", () => {
    expect(
      scaleCustom(identity, identity).domain([0, 0]).nice(10).domain()
    ).toStrictEqual([0, 0]);
    expect(
      scaleCustom(identity, identity).domain([0.5, 0.5]).nice(10).domain()
    ).toStrictEqual([0.5, 0.5]);
  });

  it("linear.nice(count) nicing a polylinear domain only affects the extent", () => {
    expect(
      scaleCustom(identity, identity)
        .domain([1.1, 1, 2, 3, 10.9])
        .nice(10)
        .domain()
    ).toStrictEqual([1, 1, 2, 3, 11]);
    expect(
      scaleCustom(identity, identity)
        .domain([123.1, 1, 2, 3, -0.9])
        .nice(10)
        .domain()
    ).toStrictEqual([130, 1, 2, 3, -10]);
  });

  it("linear.nice(count) accepts a tick count to control nicing step", () => {
    expect(
      scaleCustom(identity, identity).domain([12, 87]).nice(5).domain()
    ).toStrictEqual([0, 100]);
    expect(
      scaleCustom(identity, identity).domain([12, 87]).nice(10).domain()
    ).toStrictEqual([10, 90]);
    expect(
      scaleCustom(identity, identity).domain([12, 87]).nice(100).domain()
    ).toStrictEqual([12, 87]);
  });
});

describe("scaleCustom().copy()", () => {
  it("scaleCustom.copy() returns an isolated copy of the scale", () => {
    const s1 = scaleCustom(identity, identity)
      .domain([1, 2])
      .range([11, 44])
      .clamp(true);
    const s2 = s1.copy();
    expect(s2.domain()).toStrictEqual([1, 2]);
    expect(s2.range()).toStrictEqual([11, 44]);
    expect(s2.clamp()).toBe(true);
    s1.domain([-100, 100]).range([77, 88]).clamp(false);
    expect(s1.domain()).toStrictEqual([-100, 100]);
    expect(s1.range()).toStrictEqual([77, 88]);
    expect(s1.clamp()).toBe(false);
    expect(s2.domain()).toStrictEqual([1, 2]);
    expect(s2.range()).toStrictEqual([11, 44]);
    expect(s2.clamp()).toBe(true);
    s2.domain([3, 4]).range([-1, 0]).clamp(false);
    expect(s1.domain()).toStrictEqual([-100, 100]);
    expect(s1.range()).toStrictEqual([77, 88]);
    expect(s1.clamp()).toBe(false);
    expect(s2.domain()).toStrictEqual([3, 4]);
    expect(s2.range()).toStrictEqual([-1, 0]);
    expect(s2.clamp()).toBe(false);
  });

  it("scaleCustom.copy() returns a copy with changes to the domain are isolated", () => {
    const x = scaleCustom(identity, identity);
    const y = x.copy();
    x.domain([1, 2]);
    expect(y.domain()).toEqual([0, 1]);
    expect(x(1)).toEqual(0);
    expect(y(1)).toEqual(1);
    y.domain([2, 3]);
    expect(x(2)).toEqual(1);
    expect(y(2)).toEqual(0);
    expect(x.domain()).toEqual([1, 2]);
    expect(y.domain()).toEqual([2, 3]);
    const y2 = x.domain([1, 1.9]).copy();
    x.nice(5);
    expect(x.domain()).toEqual([1, 2]);
    expect(y2.domain()).toEqual([1, 1.9]);
  });

  it("scaleCustom.copy() returns a copy with changes to the range are isolated", () => {
    const x = scaleCustom(identity, identity);
    const y = x.copy();
    x.range([1, 2]);
    expect(x.invert(1)).toEqual(0);
    expect(y.invert(1)).toEqual(1);
    expect(y.range()).toEqual([0, 1]);
    y.range([2, 3]);
    expect(x.invert(2)).toEqual(1);
    expect(y.invert(2)).toEqual(0);
    expect(x.range()).toEqual([1, 2]);
    expect(y.range()).toEqual([2, 3]);
  });

  it("scaleCustom.copy() returns a copy with changes to the interpolator are isolated", () => {
    // @ts-ignore
    const x = scaleCustom(identity, identity).range(["red", "blue"]);
    const y = x.copy();
    const i0 = x.interpolate(); // @ts-ignore
    const i1 = function (a, b) {
      return function () {
        return b;
      };
    };
    x.interpolate(i1);
    expect(y.interpolate()).toEqual(i0);
    expect(x(0.5)).toEqual("blue");
    expect(y(0.5)).toEqual("rgb(128, 0, 128)");
  });

  it("scaleCustom.copy() returns a copy with changes to clamping are isolated", () => {
    const x = scaleCustom(identity, identity).clamp(true);
    const y = x.copy();
    x.clamp(false);
    expect(x(2)).toEqual(2);
    expect(y(2)).toEqual(1);
    expect(y.clamp()).toEqual(true);
    y.clamp(false);
    expect(x(2)).toEqual(2);
    expect(y(2)).toEqual(2);
    expect(x.clamp()).toEqual(false);
  });

  it("scaleCustom.copy() returns a copy with changes to the unknown value are isolated", () => {
    const x = scaleCustom(identity, identity);
    const y = x.copy();
    x.unknown(2);
    expect(x(NaN)).toEqual(2);
    expect(isNaN(y(NaN))).toEqual(true);
    expect(y.unknown()).toEqual(undefined);
    y.unknown(3);
    expect(x(NaN)).toEqual(2);
    expect(y(NaN)).toEqual(3);
    expect(x.unknown()).toEqual(2);
  });

  it("scaleCustom.copy() returns a copy with changes to the unknown value are isolated", () => {
    const x = scaleCustom(identity, identity);
    const y = x.copy();
    x.unknown(2);
    expect(x(NaN)).toEqual(2);
    expect(isNaN(y(NaN))).toEqual(true);
    expect(y.unknown()).toEqual(undefined);
    y.unknown(3);
    expect(x(NaN)).toEqual(2);
    expect(y(NaN)).toEqual(3);
    expect(x.unknown()).toEqual(2);
  });

  it("scaleCustom.copy() isolates changes to the domain via nice", () => {
    const x = scaleCustom(identity, identity).domain([0, 0.96]);
    const y = x.copy().nice();
    expect(x.domain()).toStrictEqual([0, 0.96]);
    expect(y.domain()).toStrictEqual([0, 1]);
  });
});

describe("scaleCustom(): values coercion", () => {
  it("scaleCustom.clamp(clamp) coerces the specified clamp value to a boolean", () => {
    // @ts-ignore
    expect(scaleCustom(identity, identity).clamp("true").clamp()).toBe(true); // @ts-ignore
    expect(scaleCustom(identity, identity).clamp(1).clamp()).toBe(true); // @ts-ignore
    expect(scaleCustom(identity, identity).clamp("").clamp()).toBe(false); // @ts-ignore
    expect(scaleCustom(identity, identity).clamp(0).clamp()).toBe(false);
  });
});

describe("scaleCustom(): custom transform & untransform", () => {
  it("scaleCustom.clamp(clamp) coerces the specified clamp value to a boolean", () => {
    // @ts-ignore
    expect(scaleCustom(identity, identity).clamp("true").clamp()).toBe(true); // @ts-ignore
    expect(scaleCustom(identity, identity).clamp(1).clamp()).toBe(true); // @ts-ignore
    expect(scaleCustom(identity, identity).clamp("").clamp()).toBe(false); // @ts-ignore
    expect(scaleCustom(identity, identity).clamp(0).clamp()).toBe(false);
  });
});
