// Checks every template against its node definition, then evaluates each rendered expression in JS (the expressions are
// valid in both JS and AS2) against known answers. Uses the Core Pack's test renderer: inputs become IN_<pin>.
import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadPack, checkTemplate, render, fixtureFields } from "@inkwell-ui/core-pack/scripts/lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const { manifest, nodes } = loadPack(root);
const byKind = Object.fromEntries(nodes.map((n) => [n.def.kind, n]));

test("every template agrees with its pins and fields", () => {
  for (const n of nodes) assert.deepEqual(checkTemplate(n.def, n.text, manifest.id), [], n.id);
});

test("every node is pure, category Math, one 'value' output", () => {
  assert.equal(nodes.length, 43);
  for (const n of nodes) {
    assert.equal(n.def.pure, true, n.id);
    assert.equal(n.def.category, "Math", n.id);
    assert.deepEqual(n.def.outputs.map((o) => o.name), ["value"], n.id);
  }
});

test("random nodes are volatile, so the compiler never caches a roll", () => {
  for (const k of ["Random", "RandomChance"]) assert.equal(byKind[k].def.extra?.volatile, true, k);
});

const run = (kind, inputs, fields = {}) => {
  const { def, text } = byKind[kind];
  const expr = render(def, text, { ...fixtureFields(def), ...fields }).split("\n")[1];
  const names = def.inputs.map((p) => p.name);
  return new Function(...names.map((n) => "IN_" + n), `return ${expr};`)(...names.map((n) => inputs[n] ?? def.inputs.find((p) => p.name === n).default));
};

const cases = [
  ["Remap", { value: 5, inMin: 0, inMax: 10, outMin: 0, outMax: 100 }, {}, 50],
  ["Remap", { value: 20, inMin: 0, inMax: 10, outMin: 0, outMax: 100 }, {}, 100],
  ["Remap", { value: 20, inMin: 0, inMax: 10, outMin: 0, outMax: 100 }, { clamp: false }, 200],
  ["Remap", { value: 5, inMin: 3, inMax: 3, outMin: 7, outMax: 9 }, {}, 7],
  ["InverseLerp", { a: 10, b: 20, value: 15 }, {}, 0.5],
  ["InverseLerp", { a: 4, b: 4, value: 9 }, {}, 0],
  ["Wrap", { value: 370, min: 0, max: 360 }, {}, 10],
  ["Wrap", { value: -10, min: 0, max: 360 }, {}, 350],
  ["Wrap", { value: 5, min: 3, max: 3 }, {}, 3],
  ["RoundTo", { value: 7.3, step: 5 }, {}, 5],
  ["RoundTo", { value: 7.6, step: 5 }, {}, 10],
  ["RoundTo", { value: 1.234, step: 0 }, {}, 1.234],
  ["Truncate", { value: -2.7 }, {}, -2],
  ["Truncate", { value: 2.7 }, {}, 2],
  ["Smoothstep", { edge0: 0, edge1: 1, x: 0.5 }, {}, 0.5],
  ["Smoothstep", { edge0: 0, edge1: 1, x: 2 }, {}, 1],
  ["Smoothstep", { edge0: 1, edge1: 1, x: 2 }, {}, 0],
  ["MoveTowards", { current: 0, target: 10, maxDelta: 3 }, {}, 3],
  ["MoveTowards", { current: 9, target: 10, maxDelta: 3 }, {}, 10],
  ["MoveTowards", { current: 10, target: 0, maxDelta: 4 }, {}, 6],
  ["Distance", { x1: 0, y1: 0, x2: 3, y2: 4 }, {}, 5],
  ["IsBetween", { value: 1, min: 1, max: 2 }, {}, true],
  ["IsBetween", { value: 1, min: 1, max: 2 }, { inclusive: false }, false],
  ["IsBetween", { value: 3, min: 1, max: 2 }, {}, false],
  ["Percent", { value: 25, total: 200 }, {}, 12.5],
  ["Percent", { value: 25, total: 0 }, {}, 0],
  ["Ease", { t: 0 }, {}, 0],
  ["Ease", { t: 1 }, {}, 1],
  ["Ease", { t: 0.5 }, {}, 0.5],
  ["Ease", { t: 0.5 }, { curve: "quad", mode: "in" }, 0.25],
  ["Ease", { t: 0.5 }, { curve: "quad", mode: "out" }, 0.75],
  ["Ease", { t: 0.5 }, { curve: "cubic", mode: "in" }, 0.125],
  ["Ease", { t: 2 }, { curve: "expo", mode: "in" }, 1],
  ["Ease", { t: -1 }, { curve: "quad", mode: "out" }, 0],
  // moved from core: spot checks that the copies still behave
  ["Clamp", { value: 5, min: 0, max: 1 }, {}, 1],
  ["Modulo", { a: 7, b: 0 }, {}, 0],
  ["Sqrt", { value: -1 }, {}, 0],
  ["Lerp", { a: 0, b: 10, t: 0.25 }, {}, 2.5],
  ["Round", { value: 2.5 }, {}, 3],
  ["BitAnd", { a: 12, b: 10 }, {}, 8],
  ["BitOr", { a: 12, b: 10 }, {}, 14],
  ["BitXor", { a: 12, b: 10 }, {}, 6],
  ["BitNot", { value: 0 }, {}, -1],
  ["BitAnd", { a: 7.9, b: 3 }, {}, 3],
  ["ShiftLeft", { value: 1, bits: 4 }, {}, 16],
  ["ShiftLeft", { value: 1, bits: 33 }, {}, 2],
  ["ShiftRight", { value: -16, bits: 2 }, {}, -4],
];
for (const [kind, inputs, fields, want] of cases) {
  test(`${kind} ${JSON.stringify(inputs)} ${JSON.stringify(fields)}`, () => assert.equal(run(kind, inputs, fields), want));
}

test("Random stays within its range and honours integer", () => {
  const real = Math.random;
  try {
    Math.random = () => 0;
    assert.equal(run("Random", { min: 2, max: 5, integer: true }), 2);
    Math.random = () => 0.999999;
    assert.equal(run("Random", { min: 2, max: 5, integer: true }), 5);
    assert.ok(run("Random", { min: 2, max: 5, integer: false }) < 5);
  } finally { Math.random = real; }
});

test("RandomChance: 0 never, 100 always", () => {
  const real = Math.random;
  try {
    Math.random = () => 0.999999;
    assert.equal(run("RandomChance", { percent: 100 }), true);
    Math.random = () => 0;
    assert.equal(run("RandomChance", { percent: 0 }), false);
  } finally { Math.random = real; }
});
