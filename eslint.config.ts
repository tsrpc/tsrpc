import eslint from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

export default [
    // 1. 忽略的文件 (相当于以前的 .eslintignore)
    { ignores: ['dist', 'node_modules'] },

    // 2. 基础 JS 推荐规则
    eslint.configs.recommended,

    // 3. TypeScript 推荐规则 (包含了解析器和插件设置)
    ...tseslint.configs.recommended,

    // 4. 自定义规则 (可选)
    {
        // 仅针对 packages 下 src 目录的代码生效
        files: ['packages/*/src/**/*.{ts,tsx}'],

        // 注册插件
        plugins: {
            'import-x': importX,
        },

        settings: {
            'import-x/resolver': {
                typescript: {
                    alwaysTryTypes: true,
                    project: './tsconfig.json',
                },
                node: true,
            },
        },

        rules: {
            'import-x/no-extraneous-dependencies': [
                'error',
                {
                    devDependencies: false,
                    peerDependencies: true,
                },
            ],
            'import-x/no-relative-packages': 'error',
            // 'no-console': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
];