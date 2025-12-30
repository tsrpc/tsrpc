[ ] 静态文件 Server [ ] Method 配置支持，完整的 Restful 兼容，QueryString 支持 [
] TS Compiler 注入，Mapped Type 和泛型支持 [ ] ClientAPI

- 协议定义:
  - tsrpc.config.ts 中 proto 增加 clientApi 的配置项，可配置 Glob 目录，例如 client/\*_/Api_.ts
  - 可在 tsrpc.config.ts 的 proto 中单独配置 Client API 的协议和实现目录
WIP
```ts tsrpc.config.ts
{
  proto: [
    {
      protocols: './shared/protocols/',
      output: './shared/serviceProto.ts',
      apiDir: './src/api/',
      clientApiPath: 'client/**/*',
      clientApiDir: '../frontend/src/api/',
    },
  ];
}
```
  - Add `server.connections[0].callClientApi` `client.registerClientApi`