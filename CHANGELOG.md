# Changelog

## 0.1.0

First release: 37 pure math nodes (category Math), all `mathutils/<Kind>@1`.

Copied unchanged from the Core Pack (`core/<Kind>@1` has the same pins and template; only the id differs):

- Rounding and sign: Abs, Ceil, Floor, Round, Sign.
- Powers and logs: Sqrt, Power, Exp, Ln, Log Base.
- Trigonometry: Sin, Cos, Tan, Asin, Acos, Atan, Atan2, Degrees To Radians, Radians To Degrees.
- Range: Lerp, Clamp, Min, Max, Modulo.
- Random: Random.

New:

- **Remap** (value, inMin, inMax, outMin, outMax; field `clamp`, default on): maps a value from one range to another.
- **Inverse Lerp** (a, b, value): where `value` lies between `a` and `b`, 0 when `a` equals `b`.
- **Wrap** (value, min, max): loops into `[min, max)`, also for negative values.
- **Round To** (value, step): nearest multiple of `step` (0.01 for two decimals).
- **Truncate** (value): drops the fraction toward zero.
- **Smoothstep** (edge0, edge1, x): 0 to 1 S-curve.
- **Move Towards** (current, target, maxDelta): steps toward the target without overshooting.
- **Distance** (x1, y1, x2, y2): straight-line distance.
- **Is Between** (value, min, max; field `inclusive`, default on): Bool.
- **Percent** (value, total): `value / total * 100`, 0 when `total` is 0.
- **Ease** (t; fields `curve`: quad, cubic, sine, expo; `mode`: in, out, inOut): easing curve for `t` in 0..1.
- **Random Chance** (percent): Bool, true with that probability; volatile like Random.

A non-finite result is 0 and a division by zero gives 0 (the Core Pack's rule for outputs).
