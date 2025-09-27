export interface CopilotChatSuggestionConfiguration {
  /**
   * The textual suggestion to show to the user.
   */
  message: string;

  /**
   * Whether the suggestion is shown to the user.
   */
  show?: boolean;

  /**
   * A label for the suggestion, shown as a chip.
   */
  label?: string;

  /**
   * The message to send to the AI when the user clicks the suggestion.
   * If not provided, the suggestion message is used.
   */
  sendMessage?: string;

  /**
   * Additional context to provide to the AI for this suggestion.
   */
  context?: string;

  /**
   * Categories to control the visibility of this suggestion.
   */
  categories?: string[];

  /**
   * Priority order for displaying suggestions.
   */
  priority?: number;
} 