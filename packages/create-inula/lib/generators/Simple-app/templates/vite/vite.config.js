import react from '@vitejs/plugin-react';

let alias = {
  react: 'inulajs', // 新增
  'react-dom': 'inulajs', // 新增
  'react/jsx-dev-runtime': 'inulajs/jsx-dev-runtime',
};

export default {
  plugins: [react()],
  resolve: {
    alias,
  },
};
