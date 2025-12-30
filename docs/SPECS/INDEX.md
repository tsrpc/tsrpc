# TSRPC 4.x SPECS

## Packages

- tsrpc: All in one 主包
- @tsrpc/core: RPC 核心库，包括 TsrpcServer、TsrpcClient, 传输协议无关
- @tsrpc/transport: 传输协议库，包括 Node.js 和 Browser 的实现
- @tsrpc/types: 该库只有类型定义，无任何外部依赖，含 Proto、Schema、Error 等
- @tsrpc/utils：工具库
- @tsrpc/cli
- @tsrpc/validator
- @tsrpc/serializer
- @tsrpc/transport-node
- @tsrpc/transport-node
- @tsrpc/transport-browser
- @tsrpc/transport-browser

## @tsrpc/core

### TsrpcServer

### TsrpcClient

### ITsrpcTransport

### ITsrpcSerializer

### ITsrpcValidator
