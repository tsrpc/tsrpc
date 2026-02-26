import { ConnectionTransport } from '../connection/ConnectionTransport';
import { EventSlotListener } from '../utils/EventSlot';

// 外部需要监听 serverTransport.onConnection，来 createConnection
// 内部需要 emitConnection
export interface ServerTransport {
  onConnection: EventSlotListener<ConnectionTransport>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
