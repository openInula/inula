var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { createServer } from 'vite';
import setupProxy from '../../../utils/setupProxy.js';
export default (api) => {
    api.registerCommand({
        name: 'dev',
        description: 'build application for development',
        initialState: api.devBuildConfig,
        fn: function (args, state) {
            return __awaiter(this, void 0, void 0, function* () {
                api.applyHook({ name: 'beforeDevConfig' });
                switch (api.compileMode) {
                    case 'webpack':
                        if (state) {
                            api.applyHook({ name: 'beforeDevCompile', config: state });
                            const compiler = webpack(state);
                            const devServerOptions = {
                                client: {
                                    overlay: false,
                                },
                                host: 'localhost',
                                port: '8888',
                                open: true,
                                historyApiFallback: true,
                            };
                            if (api.userConfig.devBuildConfig.devProxy) {
                                devServerOptions.onBeforeSetupMiddleware = (devServer) => {
                                    setupProxy(devServer.app, api);
                                };
                            }
                            api.applyHook({
                                name: 'beforeStartDevServer',
                                config: { compiler: compiler, devServerOptions: devServerOptions },
                            });
                            const server = new WebpackDevServer(compiler, devServerOptions);
                            server.startCallback((err) => {
                                api.applyHook({ name: 'afterStartDevServer' });
                            });
                        }
                        else {
                            api.logger.error("Can't find config");
                        }
                        break;
                    case 'vite':
                        if (state) {
                            yield createServer(state)
                                .then(server => {
                                return server.listen();
                            })
                                .then(server => {
                                server.printUrls();
                            });
                        }
                        else {
                            api.logger.error("Can't find config");
                        }
                        break;
                }
            });
        },
    });
};
