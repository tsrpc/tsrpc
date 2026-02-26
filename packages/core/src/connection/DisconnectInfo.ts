/**
 * 通用断线信息实体
 * 使用泛型 TCode 支持业务方传入任意类型的自定义状态码（如 string, number, 或特定的 Enum）
 */
export interface DisconnectInfo {
  // ==========================================
  // 1. 核心标识区 (Extensible)
  // ==========================================

  /**
   * 标准化或自定义的错误码
   */
  code: DisconnectCode | string | number;

  /**
   * 人类可读的断开原因，用于日志打印和 Debug
   */
  reason: string;

  // ==========================================
  // 2. 策略辅助区 (Simple for RetryPolicy)
  // ==========================================

  /**
   * 谁导致了连接断开？
   * - CLIENT: 客户端主动调用 close() -> 策略通常直接 return false
   * - NETWORK: 物理断网/心跳超时 -> 策略通常走指数退避重连
   * - SERVER: 服务端主动踢人/拒绝 -> 策略根据 code 判断是否重连
   */
  initiator: DisconnectInitiator;

  /**
   * 服务端明确下发的重试等待时间暗示（毫秒）。
   * Transport 负责将底层的 HTTP Retry-After 或 WebSocket 自定义消息解析到这里。
   * 使得 RetryPolicy 计算时间变得极其简单：优先用这个值，没有再自己算。
   */
  retryHintMs?: number;

  // ==========================================
  // 3. 扩展透传区 (Extensible)
  // ==========================================

  /**
   * 存放底层协议特有的数据，或服务端下发的任意自定义上下文。
   * 例如：{ "traceId": "xxx", "redirectUrl": "wss://..." }
   */
  metadata?: Record<string, any>;
}

/**
 * RPC 框架层核心断开状态码 (Server/Client 双向通用)
 * 采用 Peer-to-Peer 语义，任何一端都可以作为发起方(Initiator)发送这些状态码
 */
export enum DisconnectCode {
    // ==========================================
    // 正常行为 (通常不重连)
    // ==========================================
    
    /** 正常关闭 (本端主动断开，且期望正常结束) */
    OK = 'OK',
    
    /** 主动取消 (本端主动取消了连接/任务，如：客户端页面卸载，或服务端主动掐断某个耗时过长的流) */
    CANCELED = 'CANCELED',

    /** 
     * 节点停机/离开 (本端正在平滑重启或下线，通知对端离开) 
     * - Server 发送：网关缩容/重启，通知 Client 重连其他节点
     * - Client 发送：App 退出/进程销毁，通知 Server 清理资源
     */
    SHUTDOWN = 'SHUTDOWN',

    // ==========================================
    // 网络与传输层异常 (通常需要重连)
    // ==========================================
    
    /** 未知错误 (本端捕获到了无法分类的底层异常) */
    UNKNOWN = 'UNKNOWN',
    
    /** 物理网络断开 (本端感知到 TCP RST、Socket 错误等物理断线) */
    NETWORK_ERROR = 'NETWORK_ERROR',
    
    /** 超时 (本端检测到超时，如：Client 发现 Server 心跳丢失，或 Server 发现 Client 长期空闲) */
    TIMEOUT = 'TIMEOUT',

    // ==========================================
    // 协议与安全层错误 (通常不重连)
    // ==========================================
    
    /** 协议解析错误 (本端收到了对端发来的非法数据帧、序列化失败或违反 RPC 状态机) */
    PROTOCOL_ERROR = 'PROTOCOL_ERROR',
    
    /** 
     * 认证失败/身份无效 
     * - Server 发送：Client 提供的 Token 无效
     * - Client 发送：Server 提供的 TLS 证书无效 (mTLS 场景)
     */
    UNAUTHENTICATED = 'UNAUTHENTICATED',

    // ==========================================
    // 资源与内部异常 (视情况重连)
    // ==========================================
    
    /** 
     * 内部错误 (本端 RPC 框架内部发生崩溃或未捕获异常) 
     * - Server 发送：网关内部空指针、反向代理失败
     * - Client 发送：客户端 SDK 内部状态机崩溃
     */
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    
    /** 
     * 资源耗尽/背压 (本端无法处理更多请求) 
     * - Server 发送：连接数打满、触发 QPS 限流 (通常附带 retryHintMs)
     * - Client 发送：接收缓冲区打满、内存 OOM (反向背压，保护客户端)
     */
    RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
}

/**
 * 断开事件的发起方（客观事实，非策略）
 * CLIENT: 客户端主动调用 close() -> 不重连
 * NETWORK: 物理断网/心跳超时 -> 框架层自动重连
 * SERVER: 服务端主动踢人/拒绝 -> 框架层不重连， 应用层根据 code 处理
 */
export type DisconnectInitiator = 'CLIENT' | 'SERVER' | 'NETWORK';