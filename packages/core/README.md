@tsrpc/core (核心逻辑，Transport基类)

- Server
  - registerApi
  - onMsg / offMsg
- Client
  - connect / disconnect
  - callApi / sendMsg（自动 connect）
  - onMsg / offMsg
- Server.connections[0]
- client.connect(); client.registerApi