// ---- env
import { InulaNextObject } from './compTag';

type AnyEnv = { _$anyEnv: true };

export const env: <T = AnyEnv>() => T extends AnyEnv ? any : InulaNextObject<T>;
