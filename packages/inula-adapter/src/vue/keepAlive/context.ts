import { createContext } from '@cloudsop/horizon';
import { LifeCycleListener } from './lifeCycleHooks';
export const NodeKeeperLifeCycleContext = createContext<LifeCycleListener | null>(null);
