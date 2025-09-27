export * from "./utils";
export * from "./types";

import * as packageJson from "../package.json";
export const COPILOTKIT_VERSION = packageJson.version;
