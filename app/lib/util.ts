export function throttle<Args extends readonly unknown[], R>(
  fn: (...args: Args) => R,
  delay: number
): (...args: Args) => R | undefined {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Args | null = null;
  let lastResult: R | undefined;

  return (...args: Args) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    lastArgs = args;

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      lastCall = now;
      lastResult = fn(...args);
      return lastResult;
    }

    if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;

        if (lastArgs) {
          lastResult = fn(...lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }

    return lastResult;
  };
}
