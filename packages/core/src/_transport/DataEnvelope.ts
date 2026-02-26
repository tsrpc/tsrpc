/** Transport 层对 data 的二次封包，加入了 metadata 及其他的自定义字段 */
// WIP
export type DataEnvelope =
  | {
      dataType: 'string';
      data: string;
      metadata: Record<string, any>;
    }
  | {
      dataType: 'binary';
      data: Uint8Array;
      metadata: Record<string, any>;
    }
  | {
      dataType: 'json-object';
      data: object;
      metadata: Record<string, any>;
    };
