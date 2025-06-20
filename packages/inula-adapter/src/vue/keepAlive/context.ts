import { createContext } from 'openinula';
import { LifeCycleListener } from './lifeCycleHooks';
export const NodeKeeperLifeCycleContext = createContext<LifeCycleListener | null>(null);
