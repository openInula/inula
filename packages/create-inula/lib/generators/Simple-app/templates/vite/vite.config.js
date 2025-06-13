import react from '@vitejs/plugin-react';

let alias = {
  react: '@cloudsop/horizon', // 新增
  'react-dom': '@cloudsop/horizon', // 新增
  'react/jsx-dev-runtime': '@cloudsop/horizon/jsx-dev-runtime',
};

export default {
  plugins: [react()],
  resolve: {
    alias,
  },
};
