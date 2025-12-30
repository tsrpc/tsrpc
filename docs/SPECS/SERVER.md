# 传输协议无关的 Server 设计

```ts
const server = new TsrpcServer({ serviceProto, transport });

// 注册 API 实现
server.registerApi('user/Login', (req, res)=>{});
server.registerApiDir('./api/user', {pathPrefix: 'user/'});
server.registerApiDir('./api/');



// 静态引用
server.implementApi('user/Login', ApiLogin);
// 动态引用
server.implementApi('user/Login', import('./api/user/ApiLogin'));
// 动态导入所有 API
server.implementApi('user/*', import('./api/user/))
```
