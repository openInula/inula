import { defaultHostConfig } from '../dom';
import { HostConfigType, InulaReconcilerType } from './Types';

export const InulaReconciler: InulaReconcilerType = {
  hostConfig: defaultHostConfig as HostConfigType,
  setHostConfig(config: HostConfigType) {
    this.hostConfig = { ...this.hostConfig, ...config };
  },
};
