import { describe, expect, it } from 'vitest';
import { transform } from '../../mock.js';
import fs from 'fs';
import path from 'path';
import formatCode from '../../../src/next/formatOutFile.js';

describe('test for v-if instruction', () => {
  it('should transform v-if', async () => {
    const filePath = path.join(__dirname, '../../vue-atom-template/instruction/v-if.vue');
    const expectedFilePath = path.join(__dirname, '../../horizon-atom-template/instruction/v-if.jsx');
    const code = fs.readFileSync(filePath, 'utf-8')
    const transformedCode = await transform(code);
    const expectedCode = fs.readFileSync(expectedFilePath, 'utf-8');
    console.log();
    // expect(transformedCode).toEqual(expectedCode);
  });
});
