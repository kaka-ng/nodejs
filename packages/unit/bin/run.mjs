#!/usr/bin/env node

import { glob } from 'glob'
import { compose } from 'node:stream'
import { run } from 'node:test'
import { spec as Spec } from 'node:test/reporters'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
  args: process.args,
  options: {
    timeout: { type: 'string' },
  },
})

run({
  concurrency: true,
  timeout: Number(values.timeout ?? 30_000),
  setup: (test) => {
    const hasReporter = typeof test.reporter !== 'undefined'
    const reportor = new Spec()
    compose(hasReporter ? test.reporter : test, reportor).pipe(process.stdout)
  },
  files: await glob(['**/*.test.{js,ts}'], { ignore: 'node_modules/**' }),
}).on('test:fail', (data) => {
  if (data.todo === undefined || data.todo === false) {
    process.exitCode = 1
  }
})
