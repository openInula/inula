import { ChangeEvent, FC } from '@cloudsop/horizon';
interface SemiControlledInputProps {
    value?: {
        value: string;
    };
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
    [key: string]: any;
}
/**
 * SemiControlledInput 组件
 *
 * 这是一个半受控的输入框组件，结合了受控和非受控组件的特性。
 * 它允许直接操作 DOM 来设置输入值，同时也响应 props 的变化。
 *
 * @param {Object} props - 组件属性
 * @param {Object} props.valueObj - 包含输入值的对象，格式为 { value: string }，为了保证SemiControlledInput每次都刷新
 * @param {function} props.onChange - 输入值变化时的回调函数
 * @param {Object} props.[...otherProps] - 其他传递给 input 元素的属性
 *
 * @returns {JSX.Element} 返回一个 input 元素
 *
 * @example
 * <SemiControlledInput
 *   valueObj={{ value: 'initialValue' }}
 *   onChange={(e) => console.log('New value:', e.target.value)}
 *   placeholder="Enter text"
 * />
 */
export declare const SemiControlledInput: FC<SemiControlledInputProps>;
export {};
