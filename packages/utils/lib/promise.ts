export interface DeferredPromise<R = unknown> {
  promise: Promise<R>
  resolve: (value: R | PromiseLike<R>) => void
  reject: (reason?: any) => void
}

export function createDeferredPromise<R = unknown> (): DeferredPromise<R> {
  const promise: Partial<DeferredPromise<R>> = {}
  promise.promise = new Promise(function (resolve, reject) {
    promise.resolve = resolve
    promise.reject = reject
  })
  return promise as DeferredPromise<R>
}
