import {
  DSLActionType,
  DSLEventAction,
  DSLFunctionAction,
  DSLRouteAction,
  PromptDSLAction,
} from '@/models/debug';

/**
 * Converts an array of PromptDSLAction objects into a prompt string
 * that describes available UI interactions for an AI
 */
export function convertActionsToPrompt(actions: PromptDSLAction[]): string {
  if (!actions || actions.length === 0) {
    return 'No interactive actions are available in this UI.';
  }

  // Group actions by type for better organization
  const routeActions = actions.filter((action) => action.type === DSLActionType.link);
  const eventActions = actions.filter((action) => action.type === DSLActionType.event);
  const functionActions = actions.filter((action) => action.type === DSLActionType.function);

  let prompt = '# Available UI Interactions\n\n';

  // Add navigation actions
  if (routeActions.length > 0) {
    prompt += '## Navigation Actions\n';
    routeActions.forEach((action) => {
      const routeAction = action as DSLRouteAction;
      prompt += `- **${routeAction.key}**: ${routeAction.description} (Links to: ${routeAction.target})\n`;
    });
    prompt += '\n';
  }

  // Add event actions
  if (eventActions.length > 0) {
    prompt += '## Event Actions\n';
    eventActions.forEach((action) => {
      const eventAction = action as DSLEventAction;
      const paramDescription =
        Object.keys(eventAction.param).length > 0
          ? ` with parameters: ${JSON.stringify(eventAction.param)}`
          : '';
      prompt += `- **${eventAction.key}**: Triggers event "${eventAction.eventName}"${paramDescription}\n`;
    });
    prompt += '\n';
  }

  // Add function actions
  if (functionActions.length > 0) {
    prompt += '## Function Actions\n';
    functionActions.forEach((action) => {
      const functionAction = action as DSLFunctionAction;
      const paramDescription =
        Object.keys(functionAction.param).length > 0
          ? ` with parameters: ${JSON.stringify(functionAction.param)}`
          : '';
      prompt += `- **${functionAction.key}**: Calls function "${functionAction.eventName}"${paramDescription}\n`;
    });
  }

  return prompt;
}
