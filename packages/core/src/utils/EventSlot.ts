export type EventSlotListener<T> = (handler: (data: T) => void) => void;
export type EventSlotEmitter<T> = (data: T) => void;
export type EventSlot<T> = [listen: EventSlotListener<T>, emit: EventSlotEmitter<T>];

/**
 * Create a unicast event slot
 * @example
 * ```ts
 * const [onData, emitData] = createEventSlot<number>();
 * onData((data) => { console.log(data) });
 * emitData(123);
 * ```
 * @returns [listen, emit]
 */
export function createEventSlot<T>(): [listen: EventSlotListener<T>, emit: EventSlotEmitter<T>] {
  let handler: ((data: T) => void) | undefined;
  return [
    (handler) => {
      handler = handler;
    },
    (data) => {
      handler?.(data);
    },
  ];
}
