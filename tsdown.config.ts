import { defineConfig } from 'tsdown';

export default defineConfig({
    // 1. 入口文件
    entry: ['./src/index.ts'],

    // 2. 输出格式
    format: ['esm', 'cjs'],

    // 3. 构建目标 (基准线：ES2019)
    // 兼容：Node 14+, Node 18+, 现代浏览器
    target: 'es2019',

    // 4. 指定构建专用的 TSConfig
    // 避免使用开发环境的 tsconfig.json (可能包含 demo 或 test 目录)
    tsconfig: './tsconfig.build.json',

    // 5. 类型定义
    dts: true,

    // 6. 辅助配置
    sourcemap: true,   // 生成 sourcemap
    // platform: 'neutral', // 中立平台，不注入特定 polyfill
    minify: 'dce-only',     // 库通常不压缩，交给使用者的 bundler 处理
});