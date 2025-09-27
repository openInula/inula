/**
 * `useCopilotChat` is a React hook that lets you directly interact with the
 * Copilot instance. Use to implement a fully custom UI (headless UI) or to
 * programmatically interact with the Copilot instance managed by the default
 * UI.
 *
 * ## Usage
 *
 * ### Simple Usage
 *
 * ```tsx
 * import { useCopilotChat } from "@copilotkit/copilot-client";
 * import { Role, TextMessage } from "@copilotkit/copilot-client";
 *
 * export function YourComponent() {
 *   const { appendMessage } = useCopilotChat();
 *
 *   appendMessage(
 *     new TextMessage({
 *       content: "Hello World",
 *       role: "user",
 *     }),
 *   );
 *
 *   // optionally, you can append a message without running chat completion
 *   appendMessage(yourMessage, { followUp: false });
 * }
 * ```
 *
 * `useCopilotChat` returns an object with the following properties:
 *
 * ```tsx
 * const {
 *   visibleMessages, // An array of messages that are currently visible in the chat.
 *   appendMessage, // A function to append a message to the chat.
 *   setMessages, // A function to set the messages in the chat.
 *   deleteMessage, // A function to delete a message from the chat.
 *   reloadMessages, // A function to reload the messages from the API.
 *   stopGeneration, // A function to stop the generation of the next message.
 *   reset, // A function to reset the chat.
 *   isLoading, // A boolean indicating if the chat is loading.
 * } = useCopilotChat();
 * ```
 */
import { useRef, useEffect, useCallback, useState } from "react";
import { useCopilotContext } from "../context/copilot-context";
import { Message, TextMessage } from "../client/message-types";
import { SystemMessageFunction } from "../types/system-message";
import { useChat, AppendMessageOptions, createFunctionCallHandler } from "./use-chat";
import { defaultCopilotContextCategories } from "../components";
import { useMessagesContext } from "../context/messages-context";

export interface UseCopilotChatOptions {
  /**
   * A unique identifier for the chat. If not provided, a random one will be
   * generated. When provided, the `useChat` hook with the same `id` will
   * have shared states across components.
   */
  id?: string;

  /**
   * HTTP headers to be sent with the API request.
   */
  headers?: Record<string, string> | Headers;
  /**
   * System messages of the chat. Defaults to an empty array.
   */
  initialMessages?: Message[];

  /**
   * A function to generate the system message. Defaults to `defaultSystemMessage`.
   */
  makeSystemMessage?: SystemMessageFunction;
}

export interface MCPServerConfig {
  endpoint: string;
  apiKey?: string;
}

export interface UseCopilotChatReturn {
  visibleMessages: Message[];
  appendMessage: (message: Message, options?: AppendMessageOptions) => Promise<void>;
  setMessages: (messages: Message[]) => void;
  deleteMessage: (messageId: string) => void;
  reloadMessages: (messageId: string) => Promise<void>;
  stopGeneration: () => void;
  reset: () => void;
  isLoading: boolean;
  runChatCompletion: () => Promise<Message[]>;
  mcpServers: MCPServerConfig[];
  setMcpServers: (mcpServers: MCPServerConfig[]) => void;
}

export function useCopilotChat({
  makeSystemMessage,
  ...options
}: UseCopilotChatOptions = {}): UseCopilotChatReturn {
  const {
    getContextString,
    runtimeClient,
    chatInstructions,
    actions,
    scriptActions,
    forwardedParameters,
    threadId,
    setThreadId,
    runId,
    setRunId,
    isLoading,
    setIsLoading,
  } = useCopilotContext();
  const { messages, setMessages } = useMessagesContext();

  // Simple state for MCP servers (keep for interface compatibility)
  const [mcpServers, setLocalMcpServers] = useState<MCPServerConfig[]>([]);

  // Provide the same interface
  const setMcpServers = useCallback((servers: MCPServerConfig[]) => {
    setLocalMcpServers(servers);
  }, []);

  const makeSystemMessageCallback = useCallback(() => {
    const systemMessageMaker = makeSystemMessage || defaultSystemMessage;
    // this always gets the latest context string
    const contextString = getContextString([], defaultCopilotContextCategories);

    return new TextMessage({
      content: systemMessageMaker(contextString, chatInstructions),
      role: "system",
    });
  }, [getContextString, makeSystemMessage, chatInstructions]);

  const deleteMessage = useCallback(
    (messageId: string) => {
      const filteredMessages = messages.filter((message: Message) => message.id !== messageId);
      setMessages(filteredMessages);
    },
    [messages, setMessages],
  );

  // Get chat helpers with updated config
  const chatAbortControllerRef = useRef<AbortController | null>(null);
  const [extensions, setExtensions] = useState<any>({});
  const [agentLock] = useState<string | null>(null);
  const [langGraphInterruptAction, setLangGraphInterruptActionLocal] = useState<any>(null);

  const { append, reload, stop, runChatCompletion } = useChat({
    ...options,
    actions: Object.values(actions),
    scriptActions: Object.values(scriptActions),
    initialMessages: options.initialMessages || [],
    onFunctionCall: createFunctionCallHandler(Object.values(actions), Object.values(scriptActions)),
    messages,
    setMessages: setMessages as React.Dispatch<React.SetStateAction<Message[]>>,
    makeSystemMessageCallback,
    isLoading: isLoading || false,
    setIsLoading: (setIsLoading as React.Dispatch<React.SetStateAction<boolean>>) || (() => {}),
    forwardedParameters,
    threadId: threadId || '',
    setThreadId: setThreadId || (() => {}),
    runId: runId || null,
    setRunId: setRunId || (() => {}),
    copilotConfig: {
      chatApiEndpoint: runtimeClient ? `${runtimeClient.getBaseUrl()}` : '/api/copilotkit',
      publicApiKey: typeof options.headers === 'object' && 'Authorization' in options.headers 
        ? (options.headers as Record<string, string>)['Authorization']?.replace('Bearer ', '')
        : undefined,
      headers: typeof options.headers === 'object' && !(options.headers instanceof Headers) 
        ? options.headers 
        : {},
      credentials: 'same-origin',
      properties: {},
    },
    chatAbortControllerRef,
    agentLock,
    extensions,
    setExtensions,
    langGraphInterruptAction,
    setLangGraphInterruptAction: setLangGraphInterruptActionLocal,
  });

  const latestAppend = useUpdatedRef(append);
  const latestAppendFunc = useCallback(
    async (message: Message, options?: AppendMessageOptions) => {
      return await latestAppend.current(message, options);
    },
    [latestAppend],
  );

  const latestReload = useUpdatedRef(reload);
  const latestReloadFunc = useCallback(
    async (messageId: string) => {
      return await latestReload.current(messageId);
    },
    [latestReload],
  );

  const latestStop = useUpdatedRef(stop);
  const latestStopFunc = useCallback(() => {
    return latestStop.current();
  }, [latestStop]);

  const latestDelete = useUpdatedRef(deleteMessage);
  const latestDeleteFunc = useCallback(
    (messageId: string) => {
      return latestDelete.current(messageId);
    },
    [latestDelete],
  );

  const latestSetMessages = useUpdatedRef(setMessages);
  const latestSetMessagesFunc = useCallback(
    (messages: Message[]) => {
      return latestSetMessages.current(messages);
    },
    [latestSetMessages],
  );

  const latestRunChatCompletion = useUpdatedRef(runChatCompletion);
  const latestRunChatCompletionFunc = useCallback(async () => {
    return await latestRunChatCompletion.current!();
  }, [latestRunChatCompletion]);

  const reset = useCallback(() => {
    latestStopFunc();
    setMessages([]);
    setRunId?.(null);
  }, [
    latestStopFunc,
    setMessages,
    setRunId,
  ]);

  const latestReset = useUpdatedRef(reset);
  const latestResetFunc = useCallback(() => {
    return latestReset.current();
  }, [latestReset]);

  return {
    visibleMessages: messages,
    appendMessage: latestAppendFunc,
    setMessages: latestSetMessagesFunc,
    reloadMessages: latestReloadFunc,
    stopGeneration: latestStopFunc,
    reset: latestResetFunc,
    deleteMessage: latestDeleteFunc,
    runChatCompletion: latestRunChatCompletionFunc,
    isLoading: isLoading || false,
    mcpServers,
    setMcpServers,
  };
}

// store `value` in a ref and update
// it whenever it changes.
function useUpdatedRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

export function defaultSystemMessage(
  contextString: string,
  additionalInstructions?: string,
): string {
  return (
    `
Please act as an efficient, competent, conscientious, and industrious professional assistant.

Help the user achieve their goals, and you do so in a way that is as efficient as possible, without unnecessary fluff, but also without sacrificing professionalism.
Always be polite and respectful, and prefer brevity over verbosity.

The user has provided you with the following context:
\`\`\`
${contextString}
\`\`\`

They have also provided you with functions you can call to initiate actions on their behalf, or functions you can call to receive more information.

IMPORTANT: Pay special attention to function descriptions that contain [Dependencies: xxx] tags. These indicate dependency chains that must be respected:

DEPENDENCY RESOLUTION RULES:
1. Any function with [Dependencies: functionName] MUST be called AFTER functionName has been executed
2. RECURSIVE DEPENDENCY CHECKING: If functionA depends on functionB, and functionB depends on functionC, then the correct order is: functionC → functionB → functionA
3. ANALYZE THE FULL DEPENDENCY CHAIN: Always trace back to find all dependencies before executing any function

EXAMPLES:
- openSettingsMenu has [Dependencies: openUserMenu]
- configureNotifications has [Dependencies: openSettingsMenu] 
- To call configureNotifications, you must execute: openUserMenu → openSettingsMenu → configureNotifications

EXECUTION STRATEGY:
- Before calling ANY function, scan ALL available functions to build the complete dependency tree
- Functions with [Category: Menu] are typically root dependencies (no dependencies themselves)
- Functions with [Category: Action] typically depend on menu functions
- ALWAYS execute in dependency order: dependencies first, dependents second

When planning multiple actions, build the complete dependency graph and execute functions in topologically sorted order.

Please assist them as best you can.

You can ask them for clarifying questions if needed, but don't be annoying about it. If you can reasonably 'fill in the blanks' yourself, do so.

If you would like to call a function, call it without saying anything else.
In case of a function error:
- If this error stems from incorrect function parameters or syntax, you may retry with corrected arguments.
- If the error's source is unclear or seems unrelated to your input, do not attempt further retries.
` + (additionalInstructions ? `\n\n${additionalInstructions}` : "")
  );
} 