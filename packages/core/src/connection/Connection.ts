import { ConnectionTransport } from './ConnectionTransport';
import { DisconnectInfo } from './DisconnectInfo';
import { RpcHost } from './RpcHost';

export class Connection<Transport extends ConnectionTransport = ConnectionTransport> {
  protected _rpcHost: RpcHost;
  protected _transport: Transport;
  constructor(options: ConnectionOptions<Transport>) {
    this._rpcHost = options.rpcHost;
    this._transport = options.transport;
    this._sendData = options.transport.sendData;
    options.transport.onData(this._onData);
    options.transport.onDisconnect(this._onDisconnect);
    // options.transport.onError(this._onError);
  }

  private _sendData: (data: any) => Promise<void> | void;
  async sendData(data: any) {
    // Pre
    const ret = await this._sendData(data);
    // Post
  }

  protected _onData = (data: any) => {
    // 反序列化
    // Flow
    // 处理 Data
  };
  // protected _onError = () => {};
  protected _onDisconnect = (info: DisconnectInfo) => {
    // 外抛事件
    // 清理资源
  };

  async sendMsg() {
    // 封装
    // 类型检查
    // 序列化
    const data = null!;
    return this.sendData(data);
  }
  // onMsg('xxx', ({msg, path, connection})=>{ ... })
  onMsg() {
    // Flow
    // handlers
  }
  offMsg() {
    // remove handlers
  }

  async disconnect() {}

  // Server 端的 Function 叫 API，Client 端的 Function 叫 Cmd
  protected _registerLocalFunction() {}
  protected _callRemoteFunction() {}
}

export interface ConnectionOptions<Transport extends ConnectionTransport> {
  transport: Transport;
  rpcHost: RpcHost;
}
