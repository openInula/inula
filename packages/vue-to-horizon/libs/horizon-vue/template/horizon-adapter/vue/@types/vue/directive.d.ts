import { ComponentType } from '@cloudsop/horizon';
/**
 * Vue写法：<div v-click-outside:foo.bar="closePopup" v-focus class="popup">
 * Horizon写法：
 * <DirectiveComponent
 *   ctype={'div'}
 *   directives={[
 *     {
 *       name: 'click-outside',
 *       arg: 'foo',
 *       modifiers: { bar: true },
 *       value: closePopup,
 *     },
 *     {
 *       name: 'focus',
 *     },
 *   ]}
 *   class="popup"
 * >
 *   <div>child</div>
 * </DirectiveComponent>
 *
 * @param props 组件属性
 */
interface DirectiveBinding {
    value?: any;
    oldValue?: any;
    arg?: string;
    modifiers?: Record<string, boolean>;
}
interface Directive {
    bind?: (el: HTMLElement, binding: DirectiveBinding) => void;
    inserted?: (el: HTMLElement, binding: DirectiveBinding) => void;
    update?: (el: HTMLElement, binding: DirectiveBinding) => void;
    componentUpdated?: (el: HTMLElement, binding: DirectiveBinding) => void;
    unbind?: (el: HTMLElement, binding: DirectiveBinding) => void;
    beforeMount?: (el: HTMLElement, binding: DirectiveBinding) => void;
    mounted?: (el: HTMLElement, binding: DirectiveBinding) => void;
    updated?: (el: HTMLElement, binding: DirectiveBinding) => void;
    unmounted?: (el: HTMLElement, binding: DirectiveBinding) => void;
}
interface DirectiveComponentProps {
    children?: any;
    componentName: string | ComponentType<any>;
    directives: {
        name: string;
        value?: any;
        oldValue?: any;
        arg?: string;
        modifiers?: Record<string, boolean>;
    }[];
    registerDirectives?: Record<string, Directive>;
    [key: string]: any;
}
export declare function DirectiveComponent(props: DirectiveComponentProps): {
    [x: string]: any;
    vtype: number;
    src: any;
    type: any;
    key: any;
    ref: any;
    props: any;
};
export {};
