import { createContext, useContext } from 'openinula';

// Allows holding multiple variables and accessing them implicitly
const contextMap = new Map();

// Stores context variable for current branch
export function provide(name, value) {
  // If variable already exists, it stores its local value
  if (contextMap.has(name)) {
    const ctx = contextMap.get(name);
    ctx.value = value;
    // If variable does not exist yet, it creates new context in map
  } else {
    contextMap.set(name, createContext(value));
  }
}

export function inject(name, defaultValue?) {
  // If variable exists, local value is returned
  if (contextMap.has(name)) {
    const ctx = contextMap.get(name);
    return ctx.value;
  }
  // If there is no fallback value, error is thrown
  if (!defaultValue) {
    throw Error('Injected value is not provided. Make sure to provide it before use or add default value');
  }
  return defaultValue;
}
