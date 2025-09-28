export interface ScriptActionDefinition {
  name: string;
  description: string;
  parameters?: any;
  handler?: (args?: any) => Promise<any> | any;
}

export declare const askLlmAction: ScriptActionDefinition;
export declare const fillFormAction: ScriptActionDefinition;
export declare const scriptActions: ScriptActionDefinition[];

declare const exports: {
  askLlmAction: ScriptActionDefinition;
  fillFormAction: ScriptActionDefinition;
  scriptActions: ScriptActionDefinition[];
};

export default exports;