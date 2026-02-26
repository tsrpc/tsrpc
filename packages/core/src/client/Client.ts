import { Connection } from '../connection/Connection';
import { RpcHost } from '../connection/RpcHost';
import { ClientTransport } from './ClientTransport';

export class Client extends Connection<ClientTransport> {
  constructor(options: ClientOptions) {
    super({
      transport: options.transport,
      rpcHost: new RpcHost(),
    });
  }

  async connect() {
    return this._transport.connect();
  }

  registerCmd() {}
  async registerCmdDir() {}

  async callApi(cmdName: string, cmd: any) {}
}

export interface ClientOptions {
  transport: ClientTransport;
}
