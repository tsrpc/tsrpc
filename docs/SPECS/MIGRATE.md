# 从 3.x 迁移到 4.x

## 更名（以更好的适应国际化）

- isSucc 全线更名为 success，以更好的适应国际化
- API 返回结构改为：

```ts
type ApiResult<Res> = {
  success: true,
  data: Res
}
  | {
    success: false,
    error: {
      /** 默认 -1 */
      code: string | number,
      message: string,
      type: 'AppError' | 'NetworkError' | 'InternalError',
      ...other: any
    }
  }
```

JoinRoom {
  return await room.match(call);
}

- call.succ / call.error 改为 return call.success(Res) / return call.error({ ... })
- API 实现的返回，改为 ApiResult<Res>，可通过：

```ts
return call.success({ ...Res });
return call.error({ ... });
throw new TsrpcError('xxx')
call.result
```

- 也可以 call.success / call.error 提前返回
- serviceProto -> contract.ts

- API 的延迟返回，改为 Promise 模式：

```ts
// 假设 room.addMember 被改造为：
// async addMember(userId: string): Promise<Res> { ... }

export async function apiXxxx(
  call: ApiCall<Req, Res>,
): Promise<ApiResult<Res>> {
  const resultData = await roomServer.match(call);
  return { success: true, data: resultData };
}
```

- Validator 的 isSucc 更名为 ok，以更好的适应国际化
- listenMsg 更名为 `onMsg` `offMsg`
- logger.prefixs 改为 logger.prefixes
- TsrpcErrorType 改为 AppError / NetworkError / InternalError
- 返回结构改为 { success=true, data=XxxRes } | {success=false, error={...}}
- Api 定义：ApiXxx.ts export errorCode
- MsgCall 更名为 MsgContext
- 文档：ret 更名为 result
- 协议定义 Ptl 更名为 Api, Api 实现前缀更名为 api
- Miniapp 更名为 MiniProgram

## Flow 更名

### Common

- beforeSendData
- beforeRecvData
- beforeSendMsg
- beforeRecvMsg

### Server

- beforeHandleApi
- beforeReturnApi
- beforeCallClientApi
- beforeClientApiResult

### Client

- beforeCallApi
- beforeApiResult
- beforeHandleClientApi
- beforeReturnClientApi

- 支持 Symlink + Monorepo 两种代码共享模式