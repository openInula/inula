import { createProxyMiddleware } from 'http-proxy-middleware';
export default (app, api) => {
    const { devProxy } = api.userConfig.devBuildConfig;
    app.use(createProxyMiddleware(devProxy.matcher, {
        target: devProxy.target,
        secure: false,
        changeOrigin: true,
        ws: false,
        onProxyRes: devProxy.onProxyRes
    }));
};
