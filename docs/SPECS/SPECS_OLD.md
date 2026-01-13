# SPECS

## Packages

对开发者提供

- tsrpc: All-in-one package, subpath exports
  - tsrpc/node, tsrpc/browser, tsrpc/mini-program, tsrpc/react, tsrpc/cli
  - react 为可选 peer dependencies
- create-tsrpc-app

核心依赖

- @tsrpc/core: RPC 核心库，包括 BaseServer、BaseClient, BaseTransport,
- @tsrpc/types: 该库只有类型定义，无任何外部依赖，含 Contract、Schema、TsrpcError 等
- @tsrpc/utils：工具库
- @tsrpc/node
- @tsrpc/browser
- @tsrpc/mini-program
- @tsrpc/react
- @tsrpc/cli: 生成 Contract、Sync、Dev、Build、Deploy
- @tsrpc/contract-generator: Schema / Contract 生成器
- @tsrpc/validator
- @tsrpc/serializer

## Project Structure

- Monorepo
- Flat config: 精简结构的 monorepo，packages 里只需要 src、test

## Basic Usage

### API

#### Definition

```ts ApiHello.ts
export interface ReqHello {
  name: string;
}
export interface ResHello {
  message: string;
}
```

#### Server Implementation

```ts apiHello.ts
export async function apiHello(call: ApiCall<ReqHello, ResHello>): Promise<ApiResult<ResHello>> {
  return call.success({ message: `Hello, ${call.req.name}!` });
}
```

#### Client Call

```ts
const client = new HttpClient({
  server: 'http://localhost:3000',
});
client.callApi('hello', { name: 'World' });
```

### Realtime Message

#### Definition

```ts MsgHello.ts
export interface MsgHello {
  name: string;
  message: string;
}
```

#### Send

```ts
client.sendMsg('Hello', { name: 'World', message: 'Hello, World!' });
server.connections[0].sendMsg('Hello', { name: 'World', message: 'Hello, World!' });
```

#### Receive

```ts
server.onMsg('Hello', (call: MsgCall<MsgHello, 'Hello'>) => {
  console.log(call.msg.name, call.msg.message);
});

server.offMsg('Hello', handler);
server.offMsg('Hello'); // 移除所有 Hello 的监听
```

通配符监听

强类型，通过 TS 自动推断所有通配符

```ts
server.onMsg(
  'room/*',
  (call: MsgCall<MsgUserJoin, 'user/Join'> | MsgCall<MsgUserLeave, 'user/Leave'>) => {
    console.log(call.path, call.msg);
  },
);
server.offMsg('Hello/*', handler);
server.offMsg('Hello/*'); // 移除所有 Hello/* 的监听
```

### Client Command

#### Definition

```ts CmdHello.ts
export interface ReqHello {
  name: string;
}
export interface ResHello {
  message: string;
}
```

#### Client Implementation

```ts cmdHello.ts
export async function cmdHello(call: CmdCall<ReqHello, ResHello>): Promise<CmdResult<ResHello>> {
  return call.success({ message: `Hello, ${call.req.name}!` });
}
```

#### Server Call

```ts
server.connections[0].callCmd('Hello', { name: 'World' });
```

### HTTP

```ts
const server = new HttpServer({
  contract: contract,
  port: 80,
  // 同时监听 2 个端口
  https: {
    port: 443,
    pem: 'xxx',
    key: 'xxx',
  },
});

// API
export default async function (call: ApiCall<Req, Res>): Promise<ApiResult<Res>> {
  const { a, b, c } = call.req;

  return {
    success: true,
    data: {
      // ...
    },
  };

  return call.error('xxx');
}

// Contractless Client
const client = new HttpClientBrowser<ContractType>({
  server: 'https://xxx.com/api/',
});
```

### SSE

application/octet-stream 和 event/text-stream 同时支持

```ts
const server = new HttpServer({
    // ...
})

/**
 * TSRPC 专用的流对象
 * Item: 流过程中的数据 (Data)
 * Result: 流结束后的汇总 (Summary)
 */
export interface TsrpcStream<Chunk, Res> extends AsyncIterable<Item> {
    /**
     * 等待流结束并获取 Summary
     * 注意：如果你不遍历完流，这个 Promise 可能永远不会 Resolve
     */
    result: Promise<ApiResult<Res>>;
}

// 协议定义
export interface ReqChatWithAI {}
export type ResChatWithAI = TsrpcStream<ChunkType, ResType>

// API
call.sendChunk({ content: 'XX', time: new Date(), ...});
return call.success({});
```

### WebSocket

```ts
conn.sendMsg({});
conn.onMsg('room/UserJoin', {msg} => {
  console.log(msg)
});
conn.onMsg('room/*', ({path, msg})=>{
  if(path === 'room/UserJoin'){
    console.log(msg.userId)
  }
})
conn.onMsg('xxx', (call: MsgCall<Msg, MsgName>)=>{
  // ...
})
conn.onMsg('xxx/*', (call: MsgCall<Msg1, 'a/a1'> | MsgCall<Msg2, 'a/a2'>)=>{
  // ...
})
conn.offMsg('Xxx', handler);
conn.offMsg('Xxx');
```

#### 增加 AutoConnect 和 AutoDisconnect 机制

- AutoConnect: 在 callApi / onMsg 时，自动 ensureConnected，默认启用
- AutoDisconnect: 如果是通过 AutoConnect 连接的，则超过时间限制没有 callApi / onMsg 时，自动关闭；如果是通过 connect 手动连接的，则永远不触发 AutoDisconnect
- AutoReconnect: 默认开启，意外断开时自动重连，通过 lastConnectionId 自动恢复 connection.meta 状态和 msg 订阅状态；手动断开时不重连

### WebRTC

```ts
conn.sendMsg({});
conn.sendMsgUnreliable({});
conn.onMsg('Xxx', handler);
conn.offMsg('Xxx', handler);
conn.offMsg('Xxx');
```

### 认证和状态恢复

WIP

- 是否需要框架提供？
- server.connection.meta
- server needAuth
- client afterConnect, beforeCallApi & beforeSendMsg

## 双向调用设计

### 协议定义

- 保持现在的不变，增加一个 Client Command
  - Server call Client 叫 Command
  - 即 RPC 有 3 种服务：Server API、Client Command、Message
- API 的约定：定义 CmdXxx.ts，实现（在 client 项目下） cmdXxx.ts，请求类型 ReqXxx，响应类型 ResXxx
- contract.ts 里区分 api 和 cmd，client.callApi 和 server.connections\[0].callCmd 类型隔离

### 运行时

```ts
server.registerApiDir('*', import.meta.url + './api');
server.connections[0].callCmd('GetStatus');

client.registerCmd('GetStatus/', import('./api/GetStatus'));
client.registerCmdDir('*', import.meta.url + './api');
client.callApi('server/user/Login', {});
```

```ts tsrpc.config.ts
contracts: [
  {
    defDir: './contracts',
    apiDir: './src/api',
    cmdDir: '../frontend/src/cmd'
    output: './contracts/contract.ts',
  },
],
```

## 传输协议无关架构设计

### @tsrpc/core

- 提供 Server / Client / Transport 的核心抽象
- 如何兼容长连接、短连接、无连接？

## Flow

可自定义的管线系统，支持中断。
Flow 有在 Flow 内传递的 ctx: FlowContext，但出了 Flow 即消失。
传递信息应该挂在 conn 或 call 上。

### 公共 Flow: （server/client 都有）

- beforeConnect
- beforeDisconnect
- beforeSendData
- beforeRecvData
- beforeSendMsg
- beforeRecvMsg

### Server Flows:

- beforeHandleApi
- beforeHandleApiReturn
- beforeCallCmd
- beforeCallCmdReturn

### Client Flows:

- beforeCallApi
- beforeCallApiReturn
- beforeHandleCmd
- beforeHandleCmdReturn

### 用法示例

```ts
server.flows.beforeHandleApi(async (ctx) => {
  // 可修改 ctx
  ctx.xxx = 'xxx';
  // 默认继续后续流程

client.flows.beforeCallApi(async (ctx) => {
  // 显式中断
  return Flow.break;
});

client.flows.beforeCallApi(async (ctx) => {
  // 没有显式中断，但条件触发后续流程变化
  ctx.result = {
    success: true,
    res: {
      // ...
    },
  };
});

client.flows.beforeRecvData(async (ctx) => {
  const {conn} = ctx;
  if(conn.method === 'GET' && conn.url = '/test'){
    conn.httpRes.end('xxx');
    return Flow.break;
  }
});
```

## 插件系统

插件系统面向开发时刻、编译时刻、运行时刻设计。

- CLI 插件: 在 tsrpc.config.ts 注册，可以影响开发、编译、构建 Contract 等行为。
- Server 插件: 在 new Server 时通过 plugins 参数挂载
- Client 插件: 在 new Client 时通过 plugins 参数挂载

例如:

```
@tsrpc/plugin-auth/
├── package.json
├── tsconfig.json
├── src/
│   ├── common.ts      # [通用] 共享的类型定义、常量、错误码
│   ├── client.ts      # [运行时-Client] 浏览器/App 端逻辑
│   ├── server.ts      # [运行时-Server] Node.js/Edge 端逻辑
│   └── cli.ts         # [编译时-CLI] 代码生成、Contract 修改
```

```ts
// tsrpc.config.ts
import { AuthPluginCLI } from '@tsrpc/plugin-auth/cli';

export default {
    proto: [ ... ],
    plugins: [
        AuthPluginCLI({
            // 编译时配置：例如指定哪些 API 必须鉴权
            exclude: ['Login', 'Register']
        })
    ]
}
```

**CLI 插件接口定义：**

```ts
export interface TsrpcCliPlugin {
  /** 在生成 proto 前，修改 schema */
  transformSchema?: (schema: Schema) => Schema;
  /** 在生成 client 代码后，自动生成额外的辅助文件 */
  afterGenerate?: (outDir: string) => void;
}
```

```ts
// src/index.ts (后端入口)
import { HttpServer } from 'tsrpc';
import { AuthPluginServer } from '@tsrpc/plugin-auth/server';

const server = new HttpServer({
  // ...
  plugins: [
    AuthPluginServer({
      secret: process.env.JWT_SECRET,
      // 运行时配置：从哪里读取 Token
      headerName: 'x-app-token',
    }),
  ],
});
```

```ts
const server = new Server({
  // ...
  validatorOptions: {},
  serializerOptions: {}
  plugins: [new Plugin1({}), new Plugin2({})],
});

const MyPlugin = new TsrpcPlugin<{
  RecvDataContext: {};
  ApiCall: {};
  MsgCall: {};
  Connection: {};
}>({
  name: 'my-plugin-name',
});

type MyApiCall = typeof server.ApiCall;
type MyConn = typeof server.Connection;
```

## 增加 meta 机制

- 方便插件自定义传值
- WebSocket 直接在 Envelop 上增加 meta
- HTTP 放在 Header X-TSRPC-Request-Meta

## 避免 Preflight / OPTIONS 请求

- HTTP 请求不发送自定义 Header

## Contract 系统

```ts tsrpc.config.ts
contracts: [
  {
    input: [
      './src/shared/contracts',
      {
        files: './src/shared/b/**/Api*.ts',
        rootDir: './src/shared/b',
      },
    ],
    output: './src/shared/contract.ts',
  },
];
```

```ts
const server = new HttpServer(options);

server.use(
  new FileServer({
    // ...
  }),
);

server.use(
  get('/xxx', (req, res) => {}),
  post('/xxx', (req, res) => {}),
);
```

## Draft: Gateway (Plus)

支持 HttpServer、WsServer 等多种 Server 复用同一个 port

```ts
new HttpGateway({
  port: 8080,
  routes: {
    '/api': httpServer, // 所有 /api 开头的 HTTP 请求
    '/ws': wsServer, // 所有 /ws 开头的 Upgrade 请求
    '/static': fileServer, // 所有 /static 开头的 HTTP 请求
  },
});
```

## WIP: validator / serializer

- 实现 AOT 或 JIT 模式（运行时生成检测代码 eval）加速，大幅提升编解码性能

## Draft: 防止多人协作时的 id 冲突

contract 不再存储存储字段和 shchema id，统一由 Server 在运行时生成
client 连接 server 后，如是 json 则无需获取 schema。
如是二进制，则无 schema 时通过 string tag 发送，server 发现收到 string tag 后，会自动回传 id number tag，client 收到后则后续所有通讯都通过 number tag 进行。

## miscs

- 剔除未知字段，改叫 strip，而非 prune
