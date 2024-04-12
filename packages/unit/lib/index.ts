import assert from 'node:assert'
import {
  test as nodeTest
} from 'node:test'

type TestFn = NonNullable<Parameters<typeof nodeTest>[0]>

interface TestOptions {
  /**
   * If a number is provided, then that many tests would run in parallel.
   * If truthy, it would run (number of cpu cores - 1) tests in parallel.
   * For subtests, it will be `Infinity` tests in parallel.
   * If falsy, it would only run one test at a time.
   * If unspecified, subtests inherit this value from their parent.
   * @default false
   */
  concurrency?: number | boolean | undefined
  /**
   * If truthy, and the test context is configured to run `only` tests, then this test will be
   * run. Otherwise, the test is skipped.
   * @default false
   */
  only?: boolean | undefined
  /**
   * Allows aborting an in-progress test.
   * @since v18.8.0
   */
  signal?: AbortSignal | undefined
  /**
   * If truthy, the test is skipped. If a string is provided, that string is displayed in the
   * test results as the reason for skipping the test.
   * @default false
   */
  skip?: boolean | string | undefined
  /**
   * A number of milliseconds the test will fail after. If unspecified, subtests inherit this
   * value from their parent.
   * @default Infinity
   * @since v18.7.0
   */
  timeout?: number | undefined
  /**
   * If truthy, the test marked as `TODO`. If a string is provided, that string is displayed in
   * the test results as the reason why the test is `TODO`.
   * @default false
   */
  todo?: boolean | string | undefined
}

type TestContext = Parameters<TestFn>[0]

type ExtendedTestFn = (t: ExtendedTestContext, done: (result?: any) => void) => void | Promise<void>

interface Test {
  (name?: string, fn?: ExtendedTestFn): Promise<void>
  (name?: string, options?: TestOptions, fn?: ExtendedTestFn): Promise<void>
  (options?: TestOptions, fn?: ExtendedTestFn): Promise<void>
  (fn?: ExtendedTestFn): Promise<void>
}

interface Assert extends Omit<typeof assert, 'CallTracker' | 'AssertionError' | 'strict'> {}

interface ExtendedTestContext extends Omit<TestContext, 'test'>, Assert {
  plan: (count: number) => void
  test: Test
}

interface DeferredPromise<T = unknown> {
  promise: Promise<T>
  resolve: (...args: any[]) => void
  reject: (...args: any[]) => void
}
function createDeferredPromise (replace: any = {}): DeferredPromise {
  const promise: any = replace
  promise.promise = new Promise((resolve, reject) => {
    promise.resolve = resolve
    promise.reject = reject
  })
  return promise
}

export const test: Test = wrapTest(nodeTest)

function wrapTest (testFn: any): Test {
  const test: Test = async function (...args: any[]) {
    const fn: TestFn = args.pop() // TestFn must be the last one

    const customFn: ExtendedTestFn = async function (context) {
      const {
        promises: contextPromises,
        teardown,
        completed
      } = wrapContext(context)

      // either return promise or using done
      const promise = createDeferredPromise()
      const fnPromise = fn(context as never as TestContext, () => {
        promise.resolve()
      })

      await completed.promise
      // resolve sub context
      await Promise.all(contextPromises)
      // resolve current context
      await Promise.race([promise.promise, fnPromise])

      teardown()
    }

    await testFn(...[...args, customFn] as TestFn[])
  }

  return test
}

function wrapContext (context: ExtendedTestContext): {
  promises: Array<Promise<unknown>>
  teardown: () => void
  completed: DeferredPromise
} {
  const promises: Array<Promise<unknown>> = []
  const completed: DeferredPromise = {} as any
  let expect = -1
  let actual = 0

  const teardown = (): void => {
    if (expect > -1) {
      assert.strictEqual(actual, expect)
    }
  }

  const validate = (): void => {
    if (expect > -1 && actual === expect) {
      completed?.resolve()
    }
  }

  context.plan = function plan (num: number) {
    expect = num
    if (num > -1) {
      createDeferredPromise(completed)
    } else {
      completed?.resolve()
    }
  }

  const contextTest = context.test.bind(context)
  const test = async function (...args: unknown[]): Promise<void> {
    const promise = wrapTest(contextTest)(...(args as []))
    promises.push(promise)
    await promise
    actual++
    validate()
  }
  context.test = test

  for (const method of Object.keys(assert)) {
    if (method.match(/^[a-z]/) !== null) {
      (context as any)[method] = (...args: any[]) => {
        actual++
        const res = (assert as any)[method](...args)
        validate()
        return res
      }
    }
  }

  return { promises, teardown, completed }
}
