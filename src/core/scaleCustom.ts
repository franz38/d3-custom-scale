import { ticks as d3ticks, tickIncrement } from "d3-array";
import { ContinuousScale, transformer } from "./continuous";
import d3tickFormat from "./tickFormat";
import { copy } from "src/utils/copy";

export interface scaleFunction {
  (
    transform: (x: number) => number,
    untransform: (x: number) => number
  ): ContinuousScale;
  (
    transform: (x: number) => number,
    untransform: (x: number) => number,
    ticks: (count: number) => number[]
  ): ContinuousScale;
  (
    transform: (x: number) => number,
    untransform: (x: number) => number,
    ticks: (count: number) => number[],
    tickFormat: (count?: number, specifier?: string) => (d: number) => string
  ): ContinuousScale;
  (
    transform: (x: number) => number,
    untransform: (x: number) => number,
    ticks?: (count: number) => number[],
    tickFormat?: (count?: number, specifier?: string) => (d: number) => string,
    nice?: (count?: number) => ContinuousScale
  ): ContinuousScale;
}

export const scaleCustom: scaleFunction = (
  transform: (x: number) => number,
  untransform: (x: number) => number,
  ticks?: (count: number) => number[],
  tickFormat?: (count?: number, specifier?: string) => (d: number) => string,
  nice?: (count?: number) => ContinuousScale
) => {
  const scale = transformer()(transform, untransform);

  if (ticks) scale.ticks = ticks;
  else {
    scale.ticks = function (count) {
      var d = scale.domain();
      return d3ticks(d[0], d[d.length - 1], count == null ? 10 : count);
    };
  }

  if (tickFormat) scale.tickFormat = tickFormat;
  else {
    scale.tickFormat = function (count, specifier) {
      var d = scale.domain();
      return d3tickFormat(
        d[0],
        d[d.length - 1],
        count == null ? 10 : count,
        specifier
      );
    };
  }

  if (nice) scale.nice = (count?: number) => nice(count);
  else {
    scale.nice = function (count: number = 10) {
      var d = scale.domain();
      var i0 = 0;
      var i1 = d.length - 1;
      var start = d[i0];
      var stop = d[i1];
      var prestep;
      var step;
      var maxIter = 10;

      if (stop < start) {
        (step = start), (start = stop), (stop = step);
        (step = i0), (i0 = i1), (i1 = step);
      }

      while (maxIter-- > 0) {
        step = tickIncrement(start, stop, count);
        if (step === prestep) {
          d[i0] = start;
          d[i1] = stop;
          return scale.domain(d);
        } else if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
        } else {
          break;
        }
        prestep = step;
      }

      return scale;
    };
  }

  scale.copy = function (): ContinuousScale {
    return copy(
      scale,
      scaleCustom(transform, untransform, ticks, tickFormat, nice)
    );
  };

  return scale;
};
