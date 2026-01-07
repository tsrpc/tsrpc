# SPECS

## 传输协议无关的 Server 设计

```ts
const server = new Server({ serviceProto, transport });

// 注册 API
server.registerApi('user/Login', call => { })
server.registerApiDir('*', './api/')
server.registerApiDir('*', './api/', { ignore: '...' })
server.registerApiDir('user/*', './api/user/')

server.flows.xxx.push(...)

server.start()
```

## HTTP

```ts
const server = new HttpServer({
  contract: contract,
  port: 80,
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

## SSE

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

## WebSocket

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

## WebUDP

```ts
conn.sendMsg({});
conn.sendMsgUnreliable({});
conn.onMsg('Xxx', handler);
conn.offMsg('Xxx', handler);
conn.offMsg('Xxx');
```

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
            headerName: 'x-app-token' 
        })
    ]
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

## Gateway (Plus)

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

## 逻辑架构

- Connection
  - Server
    - HttpServer
    - WebSocketServer
    - WebRtcServer
    - UdpServer
  - Client
    - HTTPClient
    - WebSocketClient
    - WebRtcClient
    - UdpClient

- ## Contract
