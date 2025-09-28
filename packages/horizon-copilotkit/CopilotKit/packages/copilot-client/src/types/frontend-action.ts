import { Parameter, MappedParameterTypes } from "@copilotkit/shared";
import React from "react";

// 动作状态类型
interface InProgressState<T extends Parameter[] | [] = []> {
  status: "inProgress";
  args: Partial<MappedParameterTypes<T>>;
  result: undefined;
}

interface ExecutingState<T extends Parameter[] | [] = []> {
  status: "executing";
  args: MappedParameterTypes<T>;
  result: undefined;
}

interface CompleteState<T extends Parameter[] | [] = []> {
  status: "complete";
  args: MappedParameterTypes<T>;
  result: any;
}

interface InProgressStateNoArgs<T extends Parameter[] | [] = []> {
  status: "inProgress";
  args: Partial<MappedParameterTypes<T>>;
  result: undefined;
}

interface ExecutingStateNoArgs<T extends Parameter[] | [] = []> {
  status: "executing";
  args: MappedParameterTypes<T>;
  result: undefined;
}

interface CompleteStateNoArgs<T extends Parameter[] | [] = []> {
  status: "complete";
  args: MappedParameterTypes<T>;
  result: any;
}

interface InProgressStateWait<T extends Parameter[] | [] = []> {
  status: "inProgress";
  args: Partial<MappedParameterTypes<T>>;
  /** @deprecated use respond instead */
  handler: undefined;
  respond: undefined;
  result: undefined;
}

interface ExecutingStateWait<T extends Parameter[] | [] = []> {
  status: "executing";
  args: MappedParameterTypes<T>;
  /** @deprecated use respond instead */
  handler: (result: any) => void;
  respond: (result: any) => void;
  result: undefined;
}

interface CompleteStateWait<T extends Parameter[] | [] = []> {
  status: "complete";
  args: MappedParameterTypes<T>;
  /** @deprecated use respond instead */
  handler: undefined;
  respond: undefined;
  result: any;
}

interface InProgressStateNoArgsWait<T extends Parameter[] | [] = []> {
  status: "inProgress";
  args: Partial<MappedParameterTypes<T>>;
  /** @deprecated use respond instead */
  handler: undefined;
  respond: undefined;
  result: undefined;
}

interface ExecutingStateNoArgsWait<T extends Parameter[] | [] = []> {
  status: "executing";
  args: MappedParameterTypes<T>;
  /** @deprecated use respond instead */
  handler: (result: any) => void;
  respond: (result: any) => void;
  result: undefined;
}

interface CompleteStateNoArgsWait<T extends Parameter[] | [] = []> {
  status: "complete";
  args: MappedParameterTypes<T>;
  /** @deprecated use respond instead */
  handler: undefined;
  respond: undefined;
}

export type ActionRenderProps<T extends Parameter[] | [] = []> =
  | CompleteState<T>
  | ExecutingState<T>
  | InProgressState<T>;

export type ActionRenderPropsNoArgs<T extends Parameter[] | [] = []> =
  | CompleteStateNoArgs<T>
  | ExecutingStateNoArgs<T>
  | InProgressStateNoArgs<T>;

export type ActionRenderPropsWait<T extends Parameter[] | [] = []> =
  | CompleteStateWait<T>
  | ExecutingStateWait<T>
  | InProgressStateWait<T>;

export type ActionRenderPropsNoArgsWait<T extends Parameter[] | [] = []> =
  | CompleteStateNoArgsWait<T>
  | ExecutingStateNoArgsWait<T>
  | InProgressStateNoArgsWait<T>;

export type FrontendActionAvailability = "disabled" | "enabled" | "remote" | "frontend";

export interface Action<T extends Parameter[] | [] = []> {
  name: string;
  description?: string;
  parameters?: T;
  handler?: (args: MappedParameterTypes<T>) => Promise<any> | any;
}

export type FrontendAction<
  T extends Parameter[] | [] = [],
  N extends string = string,
> = Action<T> & {
  name: Exclude<N, "*">;
  /**
   * @deprecated Use `available` instead.
   */
  disabled?: boolean;
  available?: FrontendActionAvailability;
  pairedAction?: string;
  followUp?: boolean;

  /**
   * 中断处理器 - 支持自定义的用户交互逻辑
   * 当设置时，动作将在执行前中断，允许自定义UI交互
   */
  interruptHandler?: {
    /**
     * 当动作被中断时调用，返回用于显示给用户的数据
     * 可以返回字符串、对象或React元素等任何数据
     */
    onInterrupt: (actionName: string, parameters: any, interruptId: string) => any;
    
    /**
     * 当用户提供恢复数据时调用，返回最终的动作执行结果
     * @param actionName 动作名称
     * @param originalParameters 原始参数
     * @param resumeData 用户交互返回的数据
     */
    onResume: (actionName: string, originalParameters: any, resumeData: any) => Promise<any>;
  };

  /**
   * 异步中断处理器 - 支持AI生成等异步操作的用户交互逻辑
   * 当设置时，动作将在执行前中断，onInterrupt可以异步调用AI等服务
   */
  asyncInterruptHandler?: {
    /**
     * 当动作被中断时调用，支持异步操作（如调用AI生成选项）
     * 返回Promise，可以进行异步的AI调用、数据获取等
     * @param actionName 动作名称
     * @param parameters 动作参数
     * @param interruptId 中断ID
     * @param runtimeClient 可选的运行时客户端，用于调用AI等服务
     */
    onInterrupt: (actionName: string, parameters: any, interruptId: string, runtimeClient?: any) => Promise<any>;
    
    /**
     * 当用户提供恢复数据时调用，返回最终的动作执行结果
     * @param actionName 动作名称
     * @param originalParameters 原始参数
     * @param resumeData 用户交互返回的数据
     */
    onResume: (actionName: string, originalParameters: any, resumeData: any) => Promise<any>;
  };
} & (
    | {
        render?:
          | string
          | (T extends []
              ? (props: ActionRenderPropsNoArgs<T>) => string | React.ReactElement
              : (props: ActionRenderProps<T>) => string | React.ReactElement);
        /** @deprecated use renderAndWaitForResponse instead */
        renderAndWait?: never;
        renderAndWaitForResponse?: never;
      }
    | {
        render?: never;
        /** @deprecated use renderAndWaitForResponse instead */
        renderAndWait?: T extends []
          ? (props: ActionRenderPropsNoArgsWait<T>) => React.ReactElement
          : (props: ActionRenderPropsWait<T>) => React.ReactElement;
        renderAndWaitForResponse?: T extends []
          ? (props: ActionRenderPropsNoArgsWait<T>) => React.ReactElement
          : (props: ActionRenderPropsWait<T>) => React.ReactElement;
        handler?: never;
      }
  );

export interface ScriptAction<T extends Parameter[] | [] = []> extends Action<T> {
  executeOnClient?: boolean;
  script?: string;
}

// 新的动作可用性枚举，不依赖 GraphQL
export enum ActionInputAvailability {
  Enabled = "enabled",
  Disabled = "disabled", 
  Remote = "remote",
}
