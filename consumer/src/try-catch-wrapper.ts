export type TryCatchResult<T, E> =
  | { result: T; exception: null }
  | { result: null; exception: E }

export async function tryCatch<T, E = Error>(
  promise: Promise<T>,
  finallyFn?: () => void | Promise<void>
): Promise<TryCatchResult<T, E>> {
  try {
    const result = await promise
    return { result, exception: null }
  } catch (e) {
    const exception = e as E
    return { result: null, exception }
  } finally {
    if (finallyFn) {
      await finallyFn()
    }
  }
}
