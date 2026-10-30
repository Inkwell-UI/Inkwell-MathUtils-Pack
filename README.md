# MathUtils

An Inkwell node pack with 37 math nodes, all pure, in the category Math. Pack id `mathutils`; nodes are `mathutils/<Kind>@1`. See `CHANGELOG.md` for the list.

25 of them are the math nodes of the Core Pack (Abs, Clamp, Lerp, Sin, Random and more, same pins and behaviour); 12 are new: Remap, Inverse Lerp, Wrap, Round To, Truncate, Smoothstep, Move Towards, Distance, Is Between, Percent, Ease and Random Chance.

```
manifest.json        pack id, version, compatible tool range
nodes/<Kind>.json    one node definition per file
templates/<Kind>.as2 the AS2 each node generates (one expression)
test/                node --test: templates agree with their pins, and every node has known-answer cases
```

Commands (Inkwell-Core-Pack and Inkwell-Spec checked out next to this folder; run `yarn build` in Inkwell-Spec once): `yarn install`, `yarn validate`, `yarn test`.

Add it in the editor with Assets > Node packs > Add Pack and `owner/repo`. Release: bump `version` in `manifest.json`, add a `CHANGELOG.md` entry, push the tag `v<version>`.

Limits: angles are radians; a result that is not a finite number (NaN, Infinity) is 0, and so is a division by zero; Ease clamps `t` to 0..1; Random and Random Chance are volatile (rolled again at every use, never cached).
