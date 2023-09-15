declare const buildConfig: (fileName: string, format?: 'esm' | 'cjs') => Promise<string>;
export default buildConfig;
