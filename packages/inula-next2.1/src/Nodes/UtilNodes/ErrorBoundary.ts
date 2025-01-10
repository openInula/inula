import { compBuilder } from '../CompNode/node';
import { createContextNode, createConditionalNode, createExpNode, InulaBaseNode, createContext, Context } from '../..';

let errorBoundaryContext: Context | null = null;
function getSuspenseContext() {
  if (!errorBoundaryContext) {
    errorBoundaryContext = createContext();
  }
  return errorBoundaryContext;
}

function catchError<T>(fn: () => T, handler: (error: Error) => void) {
  try {
    return fn();
  } catch (error) {
    handler(error as Error);
    return null;
  }
}

export function ErrorBoundary({
  fallback,
  children,
}: {
  fallback: (error: Error) => InulaBaseNode[];
  children: InulaBaseNode[];
}) {
  const $$self = compBuilder();

  let error: Error | null = null;
  function handler(err: Error) {
    $$self.wave((error = err), 4 /*0b100*/);
  }
  return $$self.prepare().init(
    createConditionalNode($$node => {
      if ($$node.cachedCondition(0, () => error, [error])) {
        if ($$node.branch(0)) return [];
        return [
          createExpNode(
            () => fallback(error!),
            () => [fallback],
            1
          ),
        ];
      } else {
        if ($$node.branch(1)) return [];
        return [
          createExpNode(
            () => catchError(children, handler),
            () => [children],
            2
          ),
        ];
      }
    }, 4)
  );
}
