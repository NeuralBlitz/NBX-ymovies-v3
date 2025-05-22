declare module 'memoizee' {
  interface MemoizeeOptions {
    maxAge?: number;
    promise?: boolean;
    primitive?: boolean;
    normalizer?: (...args: any[]) => string;
    max?: number;
    refCounter?: boolean;
    dispose?: (...args: any[]) => void;
    preFetch?: number | boolean;
    async?: boolean;
  }

  type Memoized<F extends (...args: any[]) => any> = F & {
    delete: (...args: Parameters<F>) => void;
    clear: () => void;
  };

  function memoize<F extends (...args: any[]) => any>(fn: F, options?: MemoizeeOptions): Memoized<F>;

  export default memoize;
}
