interface Prel {
  define(name: string, resources: PiuResources): void;
  assets(): Record<string, PiuResources>;
  autoLoad(name: Record<string, string>): Promise<void>;
  start(
    name: string,
    version: string,
    dependencies: string[],
    callback: (socket: PiuSocket, state: ReadonlyState) => void,
  ): void;
}

interface PiuResources {
  js?: string[];
  css?: string[];
}

export interface PiuSocket {
  attach(context: object, handlers: EventHandlers | StateChangeHandlers): void;
  detach(context: object): void;
  emit(eventName: string, ...args: unknown[]): void;
  setup(stateDefinitions: StateDefinitions): void;
  get<T>(key: string): T;
  set<T>(key: string, value: T): void;
  ready(keys: string[]): Promise<ReadonlyState>;
}

// Define the types needed for the implementation
type EventHandler = (...args: unknown[]) => void;
type EventHandlers = Record<string, EventHandler>;
type StateChangeHandler = (value: unknown, prevValue: unknown) => void;
type StateChangeHandlers = Record<string, StateChangeHandler>;
type StateDefinitions = Record<string, unknown>;
type ReadonlyState = Record<string, unknown>;
const eventHandlers: Map<object, Map<string, EventHandler>> = new Map();
/**
 * Implementation of the PiuSocket interface
 */
class PiuSocketImpl implements PiuSocket {
  private stateChangeHandlers: Map<object, Map<string, StateChangeHandler>> = new Map();
  private state: Record<string, unknown> = {};
  private stateDefinitions: StateDefinitions = {};

  /**
   * Attach event handlers or state change handlers to a context
   * @param context The context object to attach handlers to
   * @param handlers Event handlers or state change handlers
   */
  attach(context: object, handlers: EventHandlers | StateChangeHandlers): void {
    // Determine if these are event handlers or state change handlers
    const isEventHandlers = Object.keys(handlers).every((key) => !key.startsWith('$'));

    if (isEventHandlers) {
      if (!eventHandlers.has(context)) {
        eventHandlers.set(context, new Map());
      }

      const contextHandlers = eventHandlers.get(context)!;
      Object.entries(handlers).forEach(([eventName, handler]) => {
        contextHandlers.set(eventName, handler as EventHandler);
      });
    } else {
      if (!this.stateChangeHandlers.has(context)) {
        this.stateChangeHandlers.set(context, new Map());
      }

      const contextHandlers = this.stateChangeHandlers.get(context)!;
      Object.entries(handlers).forEach(([key, handler]) => {
        const stateKey = key.startsWith('$') ? key.substring(1) : key;
        contextHandlers.set(stateKey, handler as StateChangeHandler);
      });
    }
  }

  /**
   * Detach all handlers associated with a context
   * @param context The context to detach handlers from
   */
  detach(context: object): void {
    eventHandlers.delete(context);
    this.stateChangeHandlers.delete(context);
  }

  /**
   * Emit an event with the given name and arguments
   * @param eventName The name of the event to emit
   * @param args Arguments to pass to the event handlers
   */
  emit(eventName: string, ...args: unknown[]): void {
    eventHandlers.forEach((handlers) => {
      const handler = handlers.get(eventName);
      if (handler) {
        try {
          handler(...args);
        } catch (error) {
          console.error(`Error in event handler for ${eventName}:`, error);
        }
      }
    });
  }

  /**
   * Set up state definitions
   * @param stateDefinitions State definitions
   */
  setup(stateDefinitions: StateDefinitions): void {
    this.stateDefinitions = { ...this.stateDefinitions, ...stateDefinitions };

    // Initialize state with default values from definitions
    Object.entries(stateDefinitions).forEach(([key, value]) => {
      if (!(key in this.state)) {
        this.state[key] = value;
      }
    });
  }

  /**
   * Get a value from the state
   * @param key The key to get from the state
   * @returns The value from the state
   */
  get<T>(key: string): T {
    return this.state[key] as T;
  }

  /**
   * Set a value in the state
   * @param key The key to set in the state
   * @param value The value to set
   */
  set<T>(key: string, value: T): void {
    const prevValue = this.state[key];
    this.state[key] = value;

    // Notify state change handlers
    this.stateChangeHandlers.forEach((handlers) => {
      const handler = handlers.get(key);
      if (handler) {
        try {
          handler(value, prevValue);
        } catch (error) {
          console.error(`Error in state change handler for ${key}:`, error);
        }
      }
    });
  }

  /**
   * Wait for specific state keys to be defined
   * @param keys The keys to wait for
   * @returns A promise that resolves to a readonly copy of the state
   */
  async ready(keys: string[]): Promise<ReadonlyState> {
    // Check if all keys are already defined
    if (keys.every((key) => key in this.state)) {
      return { ...this.state };
    }

    // Wait for keys to be defined
    return new Promise((resolve) => {
      const missingKeys = new Set(keys.filter((key) => !(key in this.state)));

      // Create temporary handler for each missing key
      const tempContext = {};
      const handlers: StateChangeHandlers = {};

      missingKeys.forEach((key) => {
        handlers[`$${key}`] = (value) => {
          missingKeys.delete(key);
          if (missingKeys.size === 0) {
            this.detach(tempContext);
            resolve({ ...this.state });
          }
        };
      });

      this.attach(tempContext, handlers);
    });
  }
}

// Re-implement the Prel global with our enhanced implementation
const PrelImpl: Prel = {
  define(name: string, resources: PiuResources): void {
    console.log('define', name, resources);
    // Store the component definition for later use
    (window as any).componentDefinitions = (window as any).componentDefinitions || {};
    (window as any).componentDefinitions[name] = resources;
  },

  assets(): Record<string, PiuResources> {
    // Return all registered assets
    return (window as any).componentDefinitions || {};
  },

  async autoLoad(nameMap: Record<string, string>): Promise<void> {
    console.log('autoLoad', nameMap);
    // Simulate loading resources
    return Promise.resolve();
  },

  start(
    name: string,
    version: string,
    dependencies: string[],
    callback: (socket: PiuSocket, state: ReadonlyState) => void,
  ): void {
    console.log(`Starting ${name} v${version} with dependencies:`, dependencies);

    // Create a new socket implementation
    const socket = new PiuSocketImpl();

    // Create initial state
    const initialState: ReadonlyState = {};

    // Call the client's callback with our socket implementation
    callback(socket, initialState);
  },
};

// Replace the mock implementation with our full implementation
(window as any).Prel = PrelImpl;
