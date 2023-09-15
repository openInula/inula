var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { createRequire } from 'module';
import { createProxyMiddleware } from 'http-proxy-middleware';
const require = createRequire(import.meta.url);
export default (api) => {
    api.registerCommand({
        name: 'proxy',
        description: 'remote proxy',
        initialState: api.userConfig.remoteProxy,
        fn: function (args, state) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!state) {
                    api.logger.error(`Invalid proxy config!`);
                    return;
                }
                const app = express();
                const proxyConfig = state;
                const staticList = proxyConfig.localStatic;
                staticList.forEach(function (value) {
                    app.use(value.url, express.static(value.local));
                });
                const remoteProxy = createProxyMiddleware(proxyConfig.fowardingURL, {
                    target: proxyConfig.target,
                    secure: false,
                    autoRewrite: true,
                    protocolRewrite: 'http',
                    ws: true,
                    hostRewrite: '',
                    preserveHeaderKeyCase: true,
                    proxyTimeout: 5 * 60 * 60 * 1000,
                    timeout: 5 * 60 * 60 * 1000,
                    onError: handleProxyError,
                });
                function handleProxyError(err) {
                    api.logger.error('Local proxy error. Error is ', err);
                }
                app.use(remoteProxy);
                app.listen(proxyConfig.localPort, () => {
                    api.logger.info(`Start proxy client on http://localhost:${proxyConfig.localPort}`);
                });
            });
        },
    });
};
