import webpack from 'webpack';
import { build } from 'vite';

export default (api: any) => {
  api.registerCommand({
    name: 'build',
    description: 'build application for production',
    initialState: api.buildConfig,
    fn: async function (args: any, state: any) {
      switch (api.compileMode) {
        case 'webpack':
          if (state) {
            api.applyHook({ name: 'beforeCompile', args: state });
            state.forEach((s: any) => {
              webpack(s.config, (err: any, stats: any) => {
                // api.applyHook({ name: 'afterCompile' });
                if (err || stats.hasErrors()) {
                  api.logger.error(`Build failed.err: ${err}, stats:${stats}`);
                }
              });
            });
          } else {
            api.logger.error(`Build failed. Can't find build config.`);
          }
          break;
        case 'vite':
          if (state) {
            api.applyHook({ name: 'beforeCompile' });
            build(state);
          } else {
            api.logger.error(`Build failed. Can't find build config.`);
          }
          break;
      }
    },
  });
};
