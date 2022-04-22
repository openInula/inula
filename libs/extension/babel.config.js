module.exports = api => {
  const isTest = api.env('test');
  console.log('isTest', isTest);
  return {
    presets: [
      '@babel/preset-env',
      '@babel/preset-typescript',
      ['@babel/preset-react', {
        runtime: 'classic',
        'pragma': 'Horizon.createElement',
        'pragmaFrag': 'Horizon.Fragment',
      }]],
    plugins: ['@babel/plugin-proposal-class-properties'],
  };
};