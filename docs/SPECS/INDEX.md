# TSRPC 4.x SPECS

## Packages

- tsrpc: All in one 主包
- create-tsrpc-app
- @tsrpc/core: RPC 核心库，包括 BaseServer、BaseClient, BaseTransport
- @tsrpc/types: 该库只有类型定义，无任何外部依赖，含 Contract、Schema、TsrpcError 等
- @tsrpc/utils：工具库
- @tsrpc/cli: 生成 Contract、Sync、Dev、Build、Deploy
- @tsrpc/contract-generator: Schema / Contract 生成器
- @tsrpc/validator
- @tsrpc/serializer
- @tsrpc/platform-node：Node 平台实现
- @tsrpc/platform-browser：Browser 平台实现
- @tsrpc/platform-mini-program：小程序平台实现
- @tsrpc/react：React Hook

## Structure

- Monorepo
- Flat config: 精简结构的 monorepo，packages 里只需要 src、\__test_

## @tsrpc/core

- base
- http
- ws
- udp
- utils

- Server
  - HTTP Server
- Client
  - HTTP Client
- Transport
- ITsrpcSerializer
- ITsrpcValidator

HttpServer extends BaseServer implements IHttpServer
WsServer extends BaseServer implements IWsServer