import { createRequire } from 'module';
import mockServer from '../../../utils/mockServer.js';
const require = createRequire(import.meta.url);

export default (api: any) => {
  api.registerHook({
    name: 'beforeStartDevServer',
    fn: async (state: any) => {
      const { compiler, devServerOptions } = state;
      devServerOptions.setupMiddlewares = (middlewares: any, devServer: { app: any }) => {
        mockServer(devServer.app);
        return middlewares;
      };
    },
  });
};
