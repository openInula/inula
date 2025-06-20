import { createProxyMiddleware } from 'http-proxy-middleware';
import { API } from '../types/types';

export default (app: any, api: API) => {
    const { devProxy } = api.userConfig.devBuildConfig;
    app.use(createProxyMiddleware(devProxy.matcher, {
        target: devProxy.target,
        secure: false,
        changeOrigin: true,
        ws: false,
        onProxyRes: devProxy.onProxyRes
    }));
}