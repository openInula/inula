const {preset} = require("./jest.config");
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not ie <= 8'],
          node: 'current',
        },
        useBuiltIns: 'usage',
        corejs: 3,
      },
    ],
    [
      '@babel/preset-typescript',
    ],
    [
      "@babel/preset-react",
      {
        "runtime": "automatic",
        "importSource": "inulajs"
      }
    ]
  ],
};
