var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { createRequire } from 'module';
import mockServer from '../../../utils/mockServer.js';
const require = createRequire(import.meta.url);
export default (api) => {
    api.registerHook({
        name: 'beforeStartDevServer',
        fn: (state) => __awaiter(void 0, void 0, void 0, function* () {
            const { compiler, devServerOptions } = state;
            devServerOptions.setupMiddlewares = (middlewares, devServer) => {
                mockServer(devServer.app);
                return middlewares;
            };
        }),
    });
};
