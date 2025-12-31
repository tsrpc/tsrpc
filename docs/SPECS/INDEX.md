# TSRPC 4.x SPECS

## Packages

- tsrpc: All in one 主包
- create-tsrpc-app
- @tsrpc/core: RPC 核心库，包括 TsrpcServer、TsrpcClient, 传输协议无关 Transport
- @tsrpc/types: 该库只有类型定义，无任何外部依赖，含 Proto、Schema、Error 等
- @tsrpc/utils：工具库
- @tsrpc/cli: 生成 Contract、Sync、Dev、Build、Deploy
- @tsrpc/contract-generator: Schema / Contract 生成器
- @tsrpc/validator
- @tsrpc/serializer
- @tsrpc/node：Node 平台实现
- @tsrpc/browser：Browser 平台实现
- @tsrpc/mini-program：小程序平台实现
- @tsrpc/react：React Hook

## Structure

- Monorepo
- Flat config: 精简结构的 monorepo，packages 里只需要 src、__test_

## @tsrpc/core

### TsrpcServer

### TsrpcClient

### ITsrpcTransport

### ITsrpcSerializer

### ITsrpcValidator
