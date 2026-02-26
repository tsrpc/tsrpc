/**
 * ServerTransport 是 Server 传输层的抽象，它的职责简单清晰：
 * 1. start 开始监听，在此期间内主动调用 createConnection 创建 ServerConnection
 * 2. stop 停止监听
 */
export interface ServerTransport<DataType> {
  start: (
    /** 创建 ServerConnection */
    createConnection: CreateConnectionFunction<DataType>,
  ) => void;

  stop: () => Promise<void>;
}

export type CreateConnectionFunction123<DataType> = (opts: {
  sendData: (data: DataType) => Promise<void> | void;
}) => {
  onData: (data: DataType) => void;
  onClose: (reason: string) => void;
};

/** 传输层抽象为三类传输数据类型：二进制、字符串、原生 JS Object */
// export type TransportDataType = Uint8Array | string | object;
