import { bisect } from "d3-array";
import {
  interpolate as interpolateValue,
  interpolateNumber,
  interpolateRound,
} from "d3-interpolate";

function number(x: any): number {
  return +x;
}

export default function constant(x: number): () => number {
  return function () {
    return x;
  };
}

var unit: number[] = [0, 1];

export function identity(x: number): number {
  return x;
}

function normalize(a: number, b: number): (x: number) => number {
  return (b -= a = +a)
    ? function (x: number) {
        return (x - a) / b;
      }
    : constant(isNaN(b) ? NaN : 0.5);
}

function clamper(a: number, b: number): (a: number, b: number) => number {
  var t: number;
  if (a > b) (t = a), (a = b), (b = t);
  return function (x: number): number {
    return Math.max(a, Math.min(b, x));
  };
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(
  domain: number[],
  range: number[],
  interpolate: any
): (x: number) => number {
  var d0 = domain[0],
    d1 = domain[1],
    r0 = range[0],
    r1 = range[1];
  let f1: (x: number) => number;
  let f2: (x: number) => number;
  if (d1 < d0) (f1 = normalize(d1, d0)), (f2 = interpolate(r1, r0));
  else (f1 = normalize(d0, d1)), (f2 = interpolate(r0, r1));
  return function (x: number): number {
    return f2(f1(x));
  };
}

function polymap(domain: number[], range: number[], interpolate: any) {
  var j = Math.min(domain.length, range.length) - 1,
    d = new Array(j),
    r = new Array(j),
    i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }

  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }

  return function (x: any) {
    var i = bisect(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}

export function copy(source: any, target: any) {
  return target
    .domain(source.domain())
    .range(source.range())
    .interpolate(source.interpolate())
    .clamp(source.clamp())
    .unknown(source.unknown());
}

export interface ContinuousScale {
  (x: number): any;
  invert(y: any): any;
  domain(): number[];
  domain(_: number[]): this;
  range(): number[];
  range(_: number[]): this;
  rangeRound(_: number[]): this;
  clamp(_: boolean): this;
  clamp(): boolean;
  interpolate(_: InterpolatorFactory): this;
  interpolate(): InterpolatorFactory;
  unknown(_: number | undefined): never;
  unknown(): number | undefined;
  ticks(count?: number): number[];
  tickFormat(count?: number, specifier?: string): (d: number) => string;
  nice(count?: number): this;
  copy(): this;
}

export interface InterpolatorFactory<T = number, U = number> {
  /**
   * Construct a new interpolator function, based on the provided interpolation boundaries.
   *
   * @param a Start boundary of the interpolation interval.
   * @param b End boundary of the interpolation interval.
   */
  (a: T, b: T): (t: number) => U;
}

export function transformer() {
  var domain: number[] = unit,
    range: number[] = unit,
    interpolate: InterpolatorFactory = interpolateValue,
    transform: (x: number) => number,
    untransform: (x: number) => number,
    unknown: any,
    piecewise: any,
    output: any,
    input: any;
  var clamp: any = identity;

  function rescale(): ContinuousScale {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    const bb = scale;
    return scale as ContinuousScale;
  }

  function scale(x: number): ContinuousScale {
    if (x == null || isNaN((x = +x))) return unknown;
    return (
      output || (output = piecewise(domain.map(transform), range, interpolate))
    )(transform(clamp(x)));
  }

  scale.invert = function (y: any) {
    return clamp(
      untransform(
        (
          input ||
          (input = piecewise(range, domain.map(transform), interpolateNumber))
        )(y)
      )
    );
  };

  scale.domain = function (_: number[] | never): ContinuousScale | number[] {
    return arguments.length
      ? ((domain = Array.from(_, number)), rescale())
      : domain.slice();
  };

  scale.range = function (_: number[] | never): ContinuousScale | number[] {
    return arguments.length && _
      ? ((range = Array.from(_)), rescale())
      : range.slice();
  };

  scale.rangeRound = function (_: any) {
    return (range = Array.from(_)), (interpolate = interpolateRound), rescale();
  };

  scale.clamp = function (_: boolean | void): boolean | ContinuousScale {
    return arguments.length
      ? ((clamp = _ ? true : identity), rescale())
      : clamp !== identity;
  };

  scale.interpolate = function (_: any) {
    return arguments.length ? ((interpolate = _), rescale()) : interpolate;
  };

  scale.unknown = function (
    _: number | never
  ): ContinuousScale | number | undefined {
    return arguments.length ? ((unknown = _), scale) : unknown;
  };

  //   scale.setup = function(t: (x: number) => number, u: (x: number) => number){
  //     transform = t, untransform = u;
  //     return rescale();
  //   }

  return function (t: (x: number) => number, u: (x: number) => number) {
    (transform = t), (untransform = u);
    return rescale();
  };
}

export const customScale = (
  t: (x: number) => number,
  u: (x: number) => number
) => {
  return transformer()(t, u);
};
