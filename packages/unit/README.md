# @kakang/unit

This package is a wrapper over the `node:test` module,
which provides the ability to use `node:assert` directly
inside the unit test. It also provides `plan` feature,
to ensure the test you specify are all run.

## Usage

```js
import { test } from '@kakang/unit'

test('test', (t) => {
  // .test also asserted
  // .equal and .test is counted as 2
  t.plan(2)

  const expect = 1
  const actual = 1
  t.equal(actual, expect)

  // To ease the usage, unless `node:test`
  // nested `test` nolonger required to await
  t.test('sub test', async (t) => {
    t.plan(1) // it should fail
  })
})
```

### CLI

This package provide a handy function to collect test
file and run it.

```shell
# JavaScript
unit
# TypeScript
NODE_OPTIONS="--require ts-node/register" unit
```

### TypeScript

Due to the limitation on TypeScript about `asserts`,
you need to explicitly type the context before using
some of the API.

```ts
import { test, type ExtendedTestContext } from '@kakang/unit'

test('context', (t: ExtendedTestContext) => {
  t.ok('pass') // without explicit typing the `t`, it would fail
})

test('function', (t) => {
  const ok: typeof t.ok = t.ok
  ok('pass') // without explicit typing the `ok`, it would fail
})
```
