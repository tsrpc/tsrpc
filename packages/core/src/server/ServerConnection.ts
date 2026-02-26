import { Connection } from '../connection/Connection';
import { ConnectionTransport } from '../connection/ConnectionTransport';
import { DisconnectInfo } from '../connection/DisconnectInfo';
import { RpcHost } from '../connection/RpcHost';

/**
 * 由 ServerTransport 创建
 */
export class ServerConnection extends Connection {
  readonly id: number;
  readonly remoteAddress: string;
  readonly ip: string;
  readonly port: number;

  constructor(options: ServerConnectionOptions) {
    super(options);
    this.id = options.id;
    this.remoteAddress = options.remoteAddress;
    // TODO
    this.ip = 'TODO';
    this.port = -1;
    // options.transport.onError(this._onError);
  }

  // Alias for _callRemoteFunction
  async callCmd() {
    // 封装
    // 类型检查
    // 序列化
    const data = null!;
    return this.sendData(data);
  }
}

export interface ServerConnectionOptions {
  rpcHost: RpcHost;
  id: number;
  /**
   * IPv4: 127.0.0.1:8080
   * IPv6: [::1]:8080
   */
  remoteAddress: string;
  transport: ConnectionTransport;
}
