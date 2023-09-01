export type LifeCycleProps = {
    onMount?: () => void;
    onUpdate?: (prevProps?: LifeCycleProps) => void;
    onUnmount?: () => void;
    data?: any;
};
export declare function LifeCycle(props: LifeCycleProps): any;
