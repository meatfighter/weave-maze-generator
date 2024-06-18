import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default [
    {
        input: './src/main.ts',
        output: {
            file: './dist/main.bundle.js',
            format: 'es',
            interop: 'esModule',
        },
        external: [
            'sharp',
            'canvas',
            'tinyqueue',
        ],
        plugins: [
            resolve(),
            commonjs(),
            typescript(),
            copy({
                targets: [
                    {
                        src: 'assets/*',
                        dest: 'dist/assets'
                    },
                ]
            }),
        ]
    },
];