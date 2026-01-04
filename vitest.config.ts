import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [
        // 关键：自动读取根目录 tsconfig.json 的 paths 设置
        // 这样你在子包里 import { x } from '@/xxx' 也能正确识别
        tsconfigPaths(),
    ],
    test: {
        // 1. 设置环境 (假设是纯逻辑库用 node，如果是组件库改用 jsdom)
        environment: 'node',

        // 2. 统一匹配所有子包下的测试文件
        // 解释：匹配 packages 下任意文件夹里的 test 文件夹下的 .ts 文件
        include: ['packages/*/test/**/*.test.ts'],

        // 3. 覆盖率设置 (可选)
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            // 源码目录匹配
            include: ['packages/*/src/**/*.ts'],
        },
    },
});