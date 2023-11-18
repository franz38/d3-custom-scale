import { ContinuousScale } from "src/core/continuous";
import { scaleCustom } from "src/core/scaleCustom";
import { nice } from "src/utils/nice";
import tickFormat from "../core/tickFormat.js";

export const logitScaleDefDomain = [0.001, 0.999];

const pow10 = (x: number) => {
  return isFinite(x) ? +("1e" + x) : x < 0 ? 0 : x;
};
export const mirrorNumber = (n: number) => {
  const mirrored = 1 - n;
  const s1 = n.toString().split(".")[1];
  const s2 = mirrored.toString().split(".")[1];

  if (s1 && s2 && s1.length != s2.length)
    return parseFloat(mirrored.toPrecision(s1.length));

  return mirrored;
};
export const guessDecade = (number: number) => {
  if (number < 0.5) {
    return Math.floor(Math.log10(number));
  } else {
    const approximated = Math.floor(Math.log10(1 - number));
    if (number <= mirrorNumber(parseFloat("1e" + (approximated + 1))))
      return -(approximated + 1);
    return -approximated;
  }
};

export const getTick = (i: number, k = 1) => {
  if (k >= 5 && (i == 1 || i == -1)) return null;
  if (i < 0) return parseFloat(k + "e" + i);
  else return mirrorNumber(parseFloat(k + "e" + -i));
};

export const scaleLogit = (): ContinuousScale => {
  function transformLogit(x: number): number {
    return Math.log(x / (1 - x));
  }

  function transformLogistic(x: number): number {
    return 1 / (1 + Math.pow(Math.E, -x));
  }

  const _nice = (): ContinuousScale => {
    return scale.domain(
      nice(scale.domain(), {
        floor: (x: number) => pow10(Math.floor(Math.log10(x))),
        ceil: (x: number) => 1 - pow10(Math.floor(Math.log10(1 - x))),
      })
    );
  };

  const _ticks = (count = 10) => {
    const d = scale.domain(),
      a = d[0],
      b = d[d.length - 1];

    if (a <= 0 || a >= 1 || b >= 1 || b <= 0)
      return [pow10(-1), 0.5, 1 - pow10(-1)];

    let lowExp = guessDecade(a);
    let highExp = guessDecade(b);

    const detailLevel = count / Math.abs(lowExp - highExp);
    const intermediateTicks = [1, 5, 2, 3, 7];

    const vals: number[] = [];

    if (a < 0.5 && b > 0.5) vals.push(0.5);

    for (let i: number = lowExp; i < highExp + 1; i++) {
      if (i == 0) continue;
      if (detailLevel > 0.5) {
        for (let j = 0; j < detailLevel && j < intermediateTicks.length; j++) {
          if (i == lowExp && lowExp > 0 && j != 0) continue;
          const tick = getTick(i, intermediateTicks[j]);
          if (!tick || tick < a) continue;
          if (tick > b) continue;
          vals.push(tick);
        }
      } else if (
        i == lowExp ||
        i == highExp ||
        (detailLevel > 0.25 && i % 2 == 0) ||
        (detailLevel > 0.1 && i % 4 == 0) ||
        i % 8 == 0
      ) {
        const _tick = getTick(i, 1);
        if (_tick) vals.push(_tick);
      }
    }

    return vals.sort((a, b) => a - b);
  };

  const _tickFormat = function (count?: number, specifier?: any) {
    var d: number[] = scale.domain();
    if (specifier)
      return tickFormat(
        d[0],
        d[d.length - 1],
        count == null ? 10 : count,
        specifier
      );
    return (n: number): string => {
      if (n >= 0.01 && n <= 0.99) return n.toFixed(2);
      else if (n > 0.5) return "1-" + (1 - n).toExponential(0);
      return n.toExponential(0);
    };
  };

  const scale = scaleCustom(
    transformLogit,
    transformLogistic,
    _ticks,
    _tickFormat,
    _nice
  ).domain(logitScaleDefDomain);

  return scale;
};
