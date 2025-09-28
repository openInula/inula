export interface LangGraphInterruptEvent<TValue extends any = any> {
  name: string;
  type: "MetaEvent";
  value: TValue;
}

export interface LangGraphInterruptAction {
  id: string;
  event: LangGraphInterruptEvent;
  isResolved: boolean;
  resolve?: (value: any) => void;
  reject?: (error: any) => void;
}

export interface LangGraphInterruptActionSetterArgs {
  action: LangGraphInterruptAction | null;
}

export type LangGraphInterruptActionSetter = (
  args: LangGraphInterruptActionSetterArgs
) => void; 