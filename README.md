# d3-custom-scales

This library allows the user to define custom scales from mathematical functions. The first parameter is the actual transform function, while the second one is the inverse function, used to perform the `invert()` method.

```typescript
const asinhScale = scaleCustom(x => Math.asinh(x), x => Math.sinh(x));
```
`scaleCustom()` returns a d3 scale, so all scale methods are available
```typescript
const customScale = scaleCustom(x => x, x => x).domain([0,1]).range([0,100]).clamp(true)
```
`scaleCustom()` allows 3 more optional parameters: 
+ `ticks` used to customize the ticks displayed
+ `tickFormat` which define how a tick value is converted to string
+ `nice` to provide better control of how the domain is rounded
```typescript
// full signature
export const scaleCustom: scaleFunction = (
  transform: (x: number) => number,
  untransform: (x: number) => number,
  ticks?: (count: number) => number[],
  tickFormat?: (count?: number, specifier?: string) => (d: number) => string,
  nice?: (count?: number) => ContinuousScale,
) => {}
```