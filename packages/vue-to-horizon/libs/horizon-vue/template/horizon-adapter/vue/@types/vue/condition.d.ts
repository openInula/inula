import { FC } from '@cloudsop/horizon';
interface ConditionalProps {
  children?: any;
  condition: boolean;
}
export declare const If: FC<ConditionalProps>;
export declare const ElseIf: FC<ConditionalProps>;
export declare const Else: FC<Omit<ConditionalProps, 'condition'>>;
interface ConditionalRendererProps {
  children?: any;
}
export declare const ConditionalRenderer: FC<ConditionalRendererProps>;
export {};
