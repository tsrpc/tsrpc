import { EventSlotListener } from '../utils/EventSlot';
import { DisconnectInfo } from './DisconnectInfo';

export interface ConnectionTransport {
  sendData: (data: any) => Promise<void> | void;
  disconnect(): Promise<void> | void;
  onData: EventSlotListener<any>;
  onDisconnect: EventSlotListener<DisconnectInfo>;
  onError: EventSlotListener<Error>;
}
