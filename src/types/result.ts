/**
 * Result type for explicit error handling
 * Provides type-safe alternative to throwing errors
 * Inspired by Rust's Result<T, E> pattern
 */

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Create a successful result
 * @example const result = Ok({ id: 1, name: 'John' });
 */
export const Ok = <T>(data: T): Result<T> => ({
  success: true,
  data,
});

/**
 * Create an error result
 * @example const result = Err('User not found');
 */
export const Err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

/**
 * Type guard to check if result is successful
 * @example if (isOk(result)) { console.log(result.data); }
 */
export const isOk = <T, E>(
  result: Result<T, E>
): result is { success: true; data: T } => {
  return result.success === true;
};

/**
 * Type guard to check if result is error
 * @example if (isErr(result)) { console.log(result.error); }
 */
export const isErr = <T, E>(
  result: Result<T, E>
): result is { success: false; error: E } => {
  return result.success === false;
};

/**
 * Map over success value, ignoring errors
 * @example mapOk(result, (data) => data.name)
 */
export const mapOk = <T, E, U>(
  result: Result<T, E>,
  fn: (data: T) => U
): Result<U, E> => {
  if (isOk(result)) {
    return Ok(fn(result.data)) as Result<U, E>;
  }
  return result as Result<U, E>;
};

/**
 * Flat map over success value (chain operations)
 * @example flatMapOk(result, (data) => fetchUser(data.id))
 */
export const flatMapOk = <T, E, U>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>
): Result<U, E> => {
  return isOk(result) ? fn(result.data) : result;
};

/**
 * Get the value or return a default
 * @example const value = getOrElse(result, defaultValue)
 */
export const getOrElse = <T, E>(result: Result<T, E>, defaultValue: T): T => {
  return isOk(result) ? result.data : defaultValue;
};

/**
 * Execute side effect on error
 * @example mapErr(result, (error) => console.error(error))
 */
export const mapErr = <T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F
): Result<T, F> => {
  return isErr(result) ? Err(fn(result.error)) : result;
};

/**
 * Combine multiple results
 * @example combine([result1, result2, result3])
 */
export const combine = <T>(results: Result<T>[]): Result<T[]> => {
  const data: T[] = [];
  for (const result of results) {
    if (isErr(result)) {
      return result;
    }
    data.push(result.data);
  }
  return Ok(data);
};
