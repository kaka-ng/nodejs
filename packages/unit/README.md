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
