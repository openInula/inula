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
import { build } from 'vite';
export default (api) => {
    api.registerCommand({
        name: 'build',
        description: 'build application for production',
        initialState: api.buildConfig,
        fn: function (args, state) {
            return __awaiter(this, void 0, void 0, function* () {
                switch (api.compileMode) {
                    case 'webpack':
                        if (state) {
                            api.applyHook({ name: 'beforeCompile', args: state });
                            state.forEach((s) => {
                                webpack(s.config, (err, stats) => {
                                    // api.applyHook({ name: 'afterCompile' });
                                    if (err || stats.hasErrors()) {
                                        api.logger.error(`Build failed.err: ${err}, stats:${stats}`);
                                    }
                                });
                            });
                        }
                        else {
                            api.logger.error(`Build failed. Can't find build config.`);
                        }
                        break;
                    case 'vite':
                        if (state) {
                            api.applyHook({ name: 'beforeCompile' });
                            build(state);
                        }
                        else {
                            api.logger.error(`Build failed. Can't find build config.`);
                        }
                        break;
                }
            });
        },
    });
};
