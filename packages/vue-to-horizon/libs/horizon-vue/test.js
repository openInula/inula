import { resolve, relative } from 'path';
const filePath = '/project/src/components/MyComponent.js';
const vueSrcPath = '/project/src';
let data = `import utility from "vue";`;

import { vueFileConvert, vueJsFileConvert } from './src/next/convert/index.js';
import fs from 'fs';

let config = JSON.parse(fs.readFileSync(resolve('./configs/sdh-config.json'), 'utf-8'));
vueFileConvert('Login.vue', 'Login.jsx', { config });
