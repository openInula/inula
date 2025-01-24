import { types as t } from '@openinula/babel-api';

type InulaNextErrMap = Record<number, string>;
type ErrorMethod<T extends InulaNextErrMap, G extends string> = {
  [K in keyof T as `${G}${K & number}`]: (...args: string[]) => any;
};

/**
 * @brief Create error handler by given error space and error maps
 *  e.g.
 *  const errHandler = createErrorHandler("InulaNext", {
 *    1: "Cannot find node type: $0, throw"
 *  }, {
 *    1: "This is an error: $0"
 *  }, {
 *    1: "It's a warning"
 *  })
 * errHandler.throw1("div") // -> throw new Error(":D - InulaNext[throw1]: Cannot find node type: div, throw")
 * errHandler.error1("div") // -> console.error(":D - InulaNext[error1]: This is an error: div")
 * errHandler.warn1() // -> console.warn(":D - InulaNext[warn1]: It's a warning")
 * @param errorSpace
 * @param throwMap
 * @param errorMap
 * @param warningMap
 * @returns Error handler
 */
export function createErrorHandler<A extends InulaNextErrMap, B extends InulaNextErrMap, C extends InulaNextErrMap>(
  errorSpace: string,
  throwMap: A = {} as any,
  errorMap: B = {} as any,
  warningMap: C = {} as any
) {
  function handleError(map: InulaNextErrMap, type: string, func: (msg: string) => any) {
    return Object.fromEntries(
      Object.entries(map).map(([code, msg]) => [
        `${type}${code}`,
        (...args: string[]) => {
          args.forEach((arg, i) => {
            msg = msg.replace(`$${i}`, arg);
          });
          return func(`:D - ${errorSpace}[${type}${code}]: ${msg}`);
        },
      ])
    );
  }
  const methods: ErrorMethod<A, 'throw'> & ErrorMethod<B, 'error'> & ErrorMethod<C, 'warn'> = {
    ...handleError(throwMap, 'throw', msg => {
      throw new Error(msg);
    }),
    ...handleError(errorMap, 'error', console.error),
    ...handleError(warningMap, 'warn', console.warn),
  } as any;

  function notDescribed(type: string) {
    return () => `:D ${errorSpace}: ${type} not described`;
  }

  return {
    ...methods,
    throwUnknown: notDescribed('throw'),
    errorUnknown: notDescribed('error'),
    warnUnknown: notDescribed('warn'),
  };
}

export class CompilerError extends Error {
  constructor(
    public message: string,
    public loc: t.SourceLocation | null | undefined,
    public suggestion?: string
  ) {
    super(message);
  }

  static invariant(
    condition: boolean,
    message: string,
    loc: t.SourceLocation | null | undefined,
    suggestion?: string
  ): asserts condition {
    if (!condition) {
      throw new CompilerError(message, loc, suggestion);
    }
  }
}
