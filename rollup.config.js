import path from 'path';
import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import { terser } from 'rollup-plugin-terser';

const EXTENSIONS = ['.ts'];
const DIST = path.resolve(__dirname, 'dist');

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: path.resolve(DIST, 'cloud.js'),
        format: 'es',
        sourcemap: true,
        indent: false,
      },
    ],
    external: ['react', 'react-dom', '@alesmenzel/cloud'],
    plugins: [
      resolve({ extensions: EXTENSIONS }),
      typescript({ tsconfig: path.resolve(__dirname, 'tsconfig.json') }),
      commonjs({ include: 'node_modules/**' }),
      terser(),
      progress(),
    ],
  },
];
