import { ConnectionTransport } from '../connection/ConnectionTransport';
import { RpcHost } from '../connection/RpcHost';
import { ServerConnection } from './ServerConnection';
import { ServerTransport } from './ServerTransport';

export class Server {
  readonly connections: ServerConnection[] = [];
  protected _transport: ServerTransport;
  protected _rpcHost: RpcHost = new RpcHost();

  constructor(options: ServerOptions) {
    this._transport = options.transport;
    this._transport.onConnection(this._onConnection);
  }

  async start() {
    return this._transport.start();
  }

  async stop() {
    return this._transport.stop();
  }

  private _lastConnectionId = 0;
  protected _onConnection = (transport: ConnectionTransport) => {
    const id = this._lastConnectionId >= Number.MAX_SAFE_INTEGER ? 1 : ++this._lastConnectionId;
    const connection = new ServerConnection({
      id,
      remoteAddress: '127.0.0.1:8080',
      transport,
      rpcHost: this._rpcHost,
    });
    this.connections.push(connection);
  };

  registerApi() {}
  async registerApiDir() {}

  // onMsg('xxx', ({msg, path, connection})=>{ ... })
  onMsg() {}
  offMsg() {}
  async broadcastMsg(
    msgName: string,
    msg: any,
    options?: {
      /** 指定发送给哪些连接，默认广播给所有连接 */
      to?: ServerConnection[];
      channel?: 'reliable' | 'unreliable';
    },
  ) {}

  async broadcastCmd(
    cmdName: string,
    cmd: any,
    options?: {
      /** 指定发送给哪些连接，默认广播给所有连接 */
      to?: ServerConnection[];
      channel?: 'reliable' | 'unreliable';
    },
  ) {}
}

export interface ServerOptions {
  transport: ServerTransport;
}
