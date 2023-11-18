import { transformer, customScale } from "../src/core/continuous";
import { describe, it, expect } from "vitest";

describe("continous", () => {
  
  it("has default values", () => {
    const s = transformer()( (x) => x, (x) => x );
    expect(s.domain()).toStrictEqual([0, 1]);
    expect(s.range()).toStrictEqual([0, 1]);
    expect(s.clamp()).toBe(false);
  });

  it("can set basics", () => {
    const s = transformer()( (x) => x, (x) => x ).domain([0,10]).range([0,100]).clamp(true)
    expect(s.domain()).toStrictEqual([0, 10]);
    expect(s.range()).toStrictEqual([0, 100]);
    expect(s.clamp()).toBe(true);
  });

  it("transform and untransform provided are used", () => {
    let s1 = customScale(
        (x) => x**2,
        (x) => Math.sqrt(x)
      )
    expect(s1(0.5)).toBe(0.25);
    expect(s1(1)).toBe(1);
    expect(s1(2)).toBe(4);
    expect(s1.invert(16)).toBe(4);

    s1 = s1.range([0,10])
    expect(s1(0.5)).toBe(2.5);
    expect(s1(1)).toBe(10);
    expect(s1(2)).toBe(40);
    expect(s1.invert(90)).toBe(3);

  });

});
