import { ConnectionTransport } from '../connection/ConnectionTransport';
import { DisconnectInfo } from '../connection/DisconnectInfo';
import { createEventSlot, EventSlotEmitter, EventSlotListener } from '../utils/EventSlot';

export interface ClientTransport extends ConnectionTransport {
  connect(): Promise<void>;
}