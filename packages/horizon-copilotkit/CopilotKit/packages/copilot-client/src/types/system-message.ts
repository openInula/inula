import { TextMessage } from "../client/message-types";

export type SystemMessageFunction = (
  contextString: string,
  additionalInstructions?: string,
) => string; 