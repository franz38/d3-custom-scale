import { ContinuousScale } from "src/core/continuous";

export const copy = (
  source: ContinuousScale,
  target: ContinuousScale
): ContinuousScale => {
  return target
    .domain(source.domain())
    .range(source.range())
    .interpolate(source.interpolate())
    .clamp(source.clamp())
    .unknown(source.unknown());
};
