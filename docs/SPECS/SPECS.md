# TSRPC 4.x Specifications

## 1. Overview

TSRPC 4.x 旨在打造一个 **TypeScript 优先、AI 友好、支持实时交互** 的下一代 RPC 框架。

### Core Features

- **类型即协议 (Type Is All You Need)**: 直接使用 TypeScript `interface` / `type` 定义协议，无需 IDL 文件，零学习成本。
- **传输协议无关 (Transport Agnostic)**: 核心架构与传输层解耦，一套代码可运行于 HTTP, WebSocket, SSE, WebRTC, UDP 等多种信道。
- **高性能 (High Performance)**: 默认搭载自研 TSBuffer 编解码引擎（支持 AOT/JIT），体积比 JSON 小 40%，且开放支持 JSON/Protobuf。
- **多平台支持 (Multi-Platform)**: 浏览器、Node.js、小程序、React Native 等全平台客户端开箱即用。

### Values

- **简单 (Simple)**: 约定大于配置，极简的 API 设计。
- **高效 (Efficient)**: 极致的运行时性能与开发效率。
- **优雅 (Elegant)**: 代码即文档，完美的类型推导与上下文提示。
- **先进 (Advanced)**: 专为 AI 辅助编程（提供清晰上下文）和实时交互应用（内置长连接管理）设计。

---

## 2. 包生态与工程结构

采用 Monorepo 管理，Flat Config 精简结构。

### Packages

**面向开发者:**

- **`tsrpc`**: All-in-one 入口包，通过 Subpath Exports 导出：
  - 入口包，依赖 `@tsrpc/node`, `@tsrpc/browser`, `@tsrpc/mini-program`, `@tsrpc/react`, `@tsrpc/cli`
  - 子路径导出：`tsrpc/node`, `tsrpc/browser`, `tsrpc/mini-program`, `tsrpc/react` (Optional PeerDep), `tsrpc/cli`
- **`create-tsrpc-app`**: 脚手架工具，快速创建项目。

**核心依赖:**

- `@tsrpc/core`: 传输协议无关的 Server / Client 实现, IServerTransport / IClientTransport 的抽象定义。
- `@tsrpc/types`: 纯类型定义 (Contract, Schema, TsrpcError)，无外部依赖。
- `@tsrpc/utils`: 通用工具库。
- `@tsrpc/contract-generator`: Schema / Contract 生成器。
- `@tsrpc/validator`: 运行时校验库 (支持 AOT)。
- `@tsrpc/serializer`: 序列化库 (TSBuffer / Protobuf / JSON)。
- `@tsrpc/cli`: 命令行工具 (Sync, Dev, Build, Deploy)。

---

## 3. 应用层范式

遵循 **Contract-First** 开发模式，采用 **约定大于配置** 的文件路由系统。

### 命名规范

- **API**: Client 调用 Server (Req/Res)。前缀 `Api` / `api`。
- **Msg**: 单向消息 (Message)。前缀 `Msg`。
- **Cmd**: Server 调用 Client (Command)。前缀 `Cmd` / `cmd`。

### API (Client -> Server)

1.  **定义**: `src/contract/ApiHello.ts`
    ```ts
    export interface ReqHello {
      name: string;
    }
    export interface ResHello {
      message: string;
    }
    ```
2.  **实现**: `src/api/apiHello.ts`
    ```ts
    export default apiHandler<ReqHello, ResHello>(async (call) => {
      return call.success({ message: `Hello, ${call.req.name}` });
    });
    ```
3.  **调用**:
    ```ts
    const result = await client.callApi('Hello', { name: 'World' });
    ```

### Msg (Realtime Message)

1.  **定义**: `src/contract/MsgChat.ts`
    ```ts
    export interface MsgChat {
      content: string;
    }
    ```
2.  **收发**:

    ```ts
    // Client Send
    client.sendMsg('Chat', { content: 'Hi' });

    // Server Listen (支持强类型通配符)
    server.onMsg('Chat', {pathname, msg} => { ... });
    server.onMsg('room/*', {pathname, msg} => { ... });
    ```

### Cmd (Server -> Client)

1.  **定义**: `src/contract/CmdHello.ts`
    ```ts
    export interface ReqHello {
      name: string;
    }
    export interface ResHello {
      message: string;
    }
    ```
2.  **实现**: Client 端 `src/cmd/cmdHello.ts`
    ```ts
    export default cmdHandler<ReqHello, ResHello>(async (call) => {
      return call.success({ message: `Hello, ${call.req.name}` });
    });
    ```
3.  **调用**:
    ```ts
    await server.connections[0].callCmd('Hello', { name: 'World' });
    ```

### Contract 生成与配置

- **配置**: `tsrpc.config.ts` 定义输入输出目录。
- **ID 冲突策略 (WIP)**:
  - 方案 A: 无 Contract 模式 (No-Schema)，纯运行时类型。
  - 方案 B: JSDoc `@id` 标记，自动生成唯一 ID 避免多人协作冲突。

---

## 4. 传输层范式

核心设计理念：**唯一且通用的 Server/Client 逻辑，通过注入 Transport 适配不同协议。**

### 核心抽象

- **Server**: `new Server({ transport, contract, plugins })`
- **Client**: `new Client({ transport, contract, plugins })`
- **Transport**: 负责底层数据的发送与接收，屏蔽协议差异。

### 传输协议设计

- **Channel (信道)**:
  - `reliable`: 可靠有序 (TCP/HTTP/WebSocket)。
  - `unreliable`: 不可靠 (UDP/WebRTC)，适用于高频实时数据。
- **Envelop**: 统一封装结构，包含 `Meta` (元数据) 和 `Payload` (业务数据)。

### 协议兼容性实现

#### HTTP

- **模式**: 短连接，无状态。
- **实现**: `HttpServer` / `HttpClient`。
- **特性**: 避免 Preflight/OPTIONS 请求，Header 携带 Meta。

#### SSE (Server-Sent Events)

- **模式**: 单向流式传输。
- **实现**: `TsrpcStream` 对象。
  ```ts
  export type ResChat = TsrpcStream<Item, Res>;
  // API 实现
  call.sendItem({ ... });
  return call.success({});
  ```

#### WebSocket

- **模式**: 全双工长连接。
- **连接管理**:
  - **AutoConnect**: `callApi` / `sendMsg` 时自动连接。
  - **AutoDisconnect**: 闲置超时自动断开。
  - **AutoReconnect**: 意外断开自动重连，并恢复 `connection.meta` 和消息订阅状态。

#### WebRTC / UDP

- **模式**: 不可靠传输。
- **用法**: 指定 Channel 参数。
  ```ts
  client.sendMsg('Move', { x, y }, { channel: 'unreliable' });
  ```

### 工厂方法

提供便捷入口：

- `createHttpServer`, `createWsServer`
- `createBrowserHttpClient`, `createNodeHttpClient`, `createMiniProgramHttpClient`

---

## 5. 可扩展性设计

### Validator / Serializer 开放架构

- **可配置**: 不再绑定 TSBuffer，允许用户选择编解码方案。
- **预置方案**:
  - **JSON**: 基于 Typia，极致性能。
  - **TSBuffer**: 二进制，体积小，支持自定义类型。
  - **Protobuf**: 兼容传统生态。
- **性能**: 全面落地 AOT (Ahead-of-Time) 或 JIT 生成检测代码，移除运行时反射开销。

### Flow 管线系统

非洋葱模型，基于 FlowContext 的可中断管线。

- **Common**: `beforeSendData`, `beforeRecvData`, `beforeSendMsg`, `beforeRecvMsg`
- **Server**: `beforeApiHandler`, `beforeApiHandlerReturn`, `beforeCallCmd`, `beforeCallCmdReturn`
- **Client**: `beforeCallApi`, `beforeCallApiReturn`, `beforeCmdHandler`, `beforeCmdHandlerReturn`

### Plugin 插件系统

- **CLI 插件**: 介入编译流程 (Schema 转换, 代码生成)。
- **Server/Client 插件**: 介入运行时 Flow，挂载额外功能 (如 Auth, Log)。

---

## 6. v3 -> v4 迁移指南

### 命名变更 (国际化适配)

- `isSucc` -> **`success`**
- `ret` -> **`result`**
- `Ptl` (Protocol) -> **`Api`**
- `Miniapp` -> **`MiniProgram`**
- `listenMsg` -> **`onMsg`** / **`offMsg`**

### API 返回结构变更

API 实现改为 Promise 返回，结构统一为 `ApiResult<T>`：

```ts
// v3
return call.succ(data);

// v4
return call.success(data);
// 或
return {
    success: true,
    data: { ... }
};
```
