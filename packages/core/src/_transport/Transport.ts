import { Signal } from '../common/Signal';
import { Connection } from '../connection/Connection';
import { CloseInfo } from '../connection/DisconnectInfo';

export interface Transport {
  // 本质：Transport 提供给 Connect 的方法
  sendData: (data: any) => Promise<void> | void;
  // 抛出的事件，需要外部赋值
  onData?: (data: any) => Promise<void> | void;
  // 抛出的事件，需要外部赋值
  onClose?: (closeInfo: CloseInfo) => void;
  // 抛出的事件，需要外部赋值
  onError?: (error: any) => void;
}

function createTransport(options: {
  onData: (data: any) => void;
  onClose: (closeInfo: CloseInfo) => void;
  onError: (error: any) => void;
}): {
  sendData: (data: any) => Promise<void> | void;
} {
  throw new Error('TODO');
}

// Connection
function createConnection(transport: Transport) {
  const trans = createTransport({
    onData: this._onData,
    onClose: this._onClose,
    onError: this._onError,
  });
  const conn: any = {
    sendData: trans.sendData,
  };
}

// Transport
function createTransport(options: {
  onData: (data: any) => void;
  onClose: (closeInfo: CloseInfo) => void;
  onError: (error: any) => void;
}): Transport {
  const server = http.createServer((req, res) => {
    const transport = {
      sendData: (data: any) => {
        res.end(data);
      },
      onData: null!,
      onClose: null!,
      onError: null!,
    };

    req.on('data', (data) => {
      transport.onData(data);
    });
    req.on('end', () => {
      transport.onClose({ code: 0, reason: 'normal' });
    });
    req.on('error', (error) => {
      transport.onError(error);
    });
  });
  const onData = new Signal<any>();

  return transport;
}

// Server
http.createServer((req, res) => {
  const connectionTransport = createTransport({});
  createConnection({
    sendData: connectionTransport.sendData,
    dataSignal: connectionTransport.dataSignal,
    closeSignal: connectionTransport.closeSignal,
    errorSignal: connectionTransport.errorSignal,
  });
});

// ServerTransport
class ServerTransport {
  server: http.Server;

  constructor({ onConnectionTransport }) {
    // onConnection
    this.server = http.createServer((req, res) => {
      const connectionTransport = createConnectionTransport({
        onData: this._onData,
        onClose: this._onClose,
        onError: this._onError,
      });
      // 外层会 createServerConnection({connectionTransport})
      onConnectionTransport({ connectionTransport });
    });
  }

  start() {
    this.server.listen(0, () => {
      console.log(`ServerTransport started on port ${this.server.address().port}`);
    });
  }
}

class Server {
  constructor({ serverTransport }) {}
}

interface ServerTransport {
  connectionSignal: Signal<ConnectionTransport>;
  start(): void;
  stop(): void;
}

class HttpServerTransport {
  connectionSignal: Signal<{
    connectionTransport: ConnectionTransport;
    httpReq: http.Request;
    httpRes: http.Response;
  }>;

  constructor(onConnection) {
    this.server = http.createServer((req, res) => {
      const connectionTransport = new ConnectionTransport({
        sendData: (data) => res.end('data'),
      });
      req.on('data', (data) => {
        connectionTransport.dataSignal.emit(data);
      });
      req.on('close', () => {
        connectionTransport.closeSignal.emit({ code: 0, reason: 'normal' });
      });
      req.on('error', (error) => {
        connectionTransport.errorSignal.emit(error);
      });
      // 在外层 ServerConnection 里，会用到 connectionTransport.dataSignal.on(data => {}) 监听数据
      this.connectionSignal.emit({ connectionTransport });
    });
  }

  start() {}

  stop() {}
}

class ServerConnection extends Connection {
  constructor(transport: Transport) {
    super(transport);
  }
}

class Client extends Connection {
  constructor(transport: Transport) {
    super(transport);
  }
}
