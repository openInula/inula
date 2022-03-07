const path = require('path');
const pluginTester = require('babel-plugin-tester').default;
import plugin from '../src';

pluginTester({
  plugin,
  title: 'horizon jsx plugin',
  fixtures: path.join(__dirname, '__fixtures__'),
  snapshot: true
});
