import react from '@vitejs/plugin-react';

let alias = {
  react: 'inula', // 新增
  'react-dom': 'inula', // 新增
  'react/jsx-dev-runtime': 'inula/jsx-dev-runtime',
};

export default {
  plugins: [react()],
  resolve: {
    alias,
  },
};
