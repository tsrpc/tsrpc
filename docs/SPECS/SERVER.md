# 传输协议无关的 Server 设计

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
        key: 'xxx'
    }
});

// API
export default async function (call: ApiCall<Req, Res>): Promise<ApiResult<Res>>{
    const { a, b, c } = ...call.req;

    return {
        success: true,
        data: {
            ...
        }
    }

    return call.error('xxx')
}
```

## SSE
application/octet-stream 和 event/text-stream 同时支持
```
const server = new HttpServer( ... )

/**
 * TSRPC 专用的流对象
 * Item: 流过程中的数据 (Data)
 * Result: 流结束后的汇总 (Summary)
 */
export interface Stream<Chunk, Res> extends AsyncIterable<Item> {
    /**
     * 等待流结束并获取 Summary
     * 注意：如果你不遍历完流，这个 Promise 可能永远不会 Resolve
     */
    result: Promise<ApiResult<Res>>;
}

// 协议定义
export interface ReqChatWithAI {}
export type ResChatWithAI = Stream<ChunkType, ResType>

// API
call.sendChunk({ content: 'XX', time: new Date(), ...});
return call.success({});
```

## WebSocket
```
conn.sendMsg({})
conn.onMsg('Xxx', handler)
conn.offMsg('Xxx', handler)
conn.offMsg('Xxx')
```

## WebUDP
```
conn.sendMsg({})
conn.sendMsgUnreliable({})
conn.onMsg('Xxx', handler)
conn.offMsg('Xxx', handler)
conn.offMsg('Xxx')
```