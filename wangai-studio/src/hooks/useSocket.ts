import { SocketManager } from '@/app/utils/socket';
import { useRef, useCallback, useEffect, useState, useSyncExternalStore } from 'react';
// @ts-ignore
// import { useUser } from '@/hooks/useUser'



// 全局状态管理
class SocketStateManager {
    private static instance: SocketStateManager;
    private listeners: Set<() => void> = new Set();
    private state = {
        isConnected: false,
        isConnecting: false,
        reconnectAttempts: 0,
        connectionStatus: null as any
    };

    static getInstance(): SocketStateManager {
        if (!SocketStateManager.instance) {
            SocketStateManager.instance = new SocketStateManager();
        }
        return SocketStateManager.instance;
    }

    subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    getSnapshot() {
        return this.state;
    }

    setState(newState: Partial<typeof this.state>) {
        this.state = { ...this.state, ...newState };
        this.listeners.forEach(listener => listener());
    }

    updateFromSocket(socket: SocketManager) {
        const status = socket.getConnectionStatus();
        this.setState({
            isConnected: status.isConnected,
            reconnectAttempts: status.reconnectAttempts,
            connectionStatus: status
        });
    }
}

const stateManager = SocketStateManager.getInstance();

// 缓存服务端快照以避免无限循环
const serverSnapshot = { isConnected: false, isConnecting: false, reconnectAttempts: 0, connectionStatus: null };

export function useSocket() {
    // const { userId } = useUser();
    const socketRef = useRef<SocketManager | null>(null);
    const eventCleanupRef = useRef<(() => void)[]>([]);
    const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // 使用 useSyncExternalStore 来订阅全局状态
    const globalState = useSyncExternalStore(
        stateManager.subscribe.bind(stateManager),
        stateManager.getSnapshot.bind(stateManager),
        () => serverSnapshot
    );

    const { isConnected, isConnecting, reconnectAttempts, connectionStatus } = globalState;

    /* ---------- 私有工具 ---------- */
    const clearEventListeners = useCallback(() => {
        eventCleanupRef.current.forEach(cleanup => cleanup());
        eventCleanupRef.current = [];
    }, []);

    const addEventCleanup = useCallback((cleanup: () => void) => {
        eventCleanupRef.current.push(cleanup);
    }, []);

    const updateConnectionState = useCallback(() => {
        if (socketRef.current) {
            stateManager.updateFromSocket(socketRef.current);
        }
    }, []);

    // 启动状态检查定时器
    const startStatusCheck = useCallback(() => {
        if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
        }

        statusCheckIntervalRef.current = setInterval(() => {
            if (socketRef.current) {
                stateManager.updateFromSocket(socketRef.current);
            }
        }, 1000); // 每秒检查一次状态
    }, []);

    // 停止状态检查定时器
    const stopStatusCheck = useCallback(() => {
        if (statusCheckIntervalRef.current) {
            clearInterval(statusCheckIntervalRef.current);
            statusCheckIntervalRef.current = null;
        }
    }, []);

    /* ---------- 连接 ---------- */
    const connect = useCallback(() => {
        // 获取单例实例
        const socket = SocketManager.getInstance();
        socketRef.current = socket;

        if (socket.isConnected) {
            updateConnectionState();
            return;
        }

        // 清理之前的事件监听器
        clearEventListeners();
        stateManager.setState({ isConnecting: true });

        // 配置重连参数
        socket.setReconnectConfig(10, 2000);

        // 绑定事件监听器
        const connectHandler = () => {

            const storage = window.localStorage.getItem('user-storage')


            if (!storage) return

            let userStorage = JSON.parse(storage || '{}')
            userStorage.state.userInfo.userId
 
            stateManager.setState({ isConnected: true });

            socket.authenticate(userStorage.state.userInfo.userId);
        };

        const authSuccessHandler = () => { 
            stateManager.setState({
                isConnecting: false,
                isConnected: true
            });
            stateManager.updateFromSocket(socket);
            startStatusCheck(); // 启动状态检查
        };

        const authErrorHandler = (error: any) => { 
            stateManager.setState({
                isConnecting: false,
                isConnected: false
            });
        };

        const disconnectHandler = (data: any) => { 
            stateManager.setState({
                isConnecting: false,
                isConnected: false
            });
            stateManager.updateFromSocket(socket);
            stopStatusCheck(); // 停止状态检查
        };

        const reconnectAttemptHandler = (data: any) => { 
            stateManager.setState({
                isConnecting: true,
                isConnected: false,
                reconnectAttempts: data.attemptNumber || 0
            });
        };

        const reconnectHandler = (data: any) => { 
            stateManager.setState({
                isConnecting: false,
                isConnected: true,
                reconnectAttempts: 0
            });
            startStatusCheck(); // 重连成功后重新启动状态检查
        };

        const reconnectFailedHandler = (data: any) => { 
            stateManager.setState({
                isConnecting: false,
                isConnected: false
            });
            stateManager.updateFromSocket(socket);
            stopStatusCheck(); // 重连失败时停止状态检查
        };

        const connectErrorHandler = (error: any) => { 
            stateManager.setState({
                isConnecting: false,
                isConnected: false
            });
            stateManager.updateFromSocket(socket);
        };

        // 绑定事件并记录清理函数
        socket.on('connect', connectHandler);
        socket.on('auth:success', authSuccessHandler);
        socket.on('auth:error', authErrorHandler);
        socket.on('disconnect', disconnectHandler);
        socket.on('reconnect_attempt', reconnectAttemptHandler);
        socket.on('reconnect', reconnectHandler);
        socket.on('reconnect_failed', reconnectFailedHandler);
        socket.on('connect_error', connectErrorHandler);
        socket.on('task:completed', handleTaskCompleted);

        // 记录清理函数
        addEventCleanup(() => socket.off('connect', connectHandler));
        addEventCleanup(() => socket.off('auth:success', authSuccessHandler));
        addEventCleanup(() => socket.off('auth:error', authErrorHandler));
        addEventCleanup(() => socket.off('disconnect', disconnectHandler));
        addEventCleanup(() => socket.off('reconnect_attempt', reconnectAttemptHandler));
        addEventCleanup(() => socket.off('reconnect', reconnectHandler));
        addEventCleanup(() => socket.off('reconnect_failed', reconnectFailedHandler));
        addEventCleanup(() => socket.off('connect_error', connectErrorHandler));
        addEventCleanup(() => socket.off('task:completed', handleTaskCompleted));

        // 开始连接
        socket.connect();
        updateConnectionState();

    }, [clearEventListeners, addEventCleanup, updateConnectionState, startStatusCheck, stopStatusCheck]);

    /* ---------- 任务完成处理 ---------- */
    const handleTaskCompleted = useCallback(async (data: any) => {
        try {
            // 可以在这里添加通用的任务完成处理逻辑
            // 比如更新全局状态、发送通知等
            
            // 如果任务成功完成，可以触发一些通用操作
            if (data?.status === 'success' || !data?.error) {
                // 这里可以添加成功完成的处理逻辑
                // 例如：刷新相关数据、更新UI状态等
            }
            
        } catch (error) {
            // 处理错误但不输出日志
        }
    }, []);

    /* ---------- 断开连接 ---------- */
    const disconnect = useCallback(() => {
        stopStatusCheck(); // 停止状态检查
        clearEventListeners();
        socketRef.current?.disconnect();
        socketRef.current = null;
        stateManager.setState({
            isConnected: false,
            isConnecting: false,
            reconnectAttempts: 0,
            connectionStatus: null
        });
    }, [clearEventListeners, stopStatusCheck]);

    /* ---------- 手动重连 ---------- */
    const reconnect = useCallback(() => {
        if (socketRef.current) {
            socketRef.current.reconnect();
            updateConnectionState();
        } else {
            connect();
        }
    }, [connect, updateConnectionState]);

    /* ---------- 动态事件监听 ---------- */
    const onTaskCompleted = useCallback((cb: (data: any) => void) => {
        // 确保获取SocketManager实例
        const socketManager = SocketManager.getInstance();
        
        const wrapped = (data: any) => {
            cb(data);
        };

        // 使用 SocketManager 的事件系统注册监听器
        socketManager.on('task:completed', wrapped);

        // 返回清理函数
        const cleanup = () => {
            socketManager.off('task:completed', wrapped);
        };
        addEventCleanup(cleanup);

        return cleanup;
    }, [addEventCleanup]);

    const onConnect = useCallback((cb: (data: any) => void) => {
        if (!socketRef.current) {
            socketRef.current = SocketManager.getInstance();
        }

        socketRef.current.on('connect', cb);
        const cleanup = () => socketRef.current?.off('connect', cb);
        addEventCleanup(cleanup);

        return cleanup;
    }, [addEventCleanup]);

    const onDisconnect = useCallback((cb: (data: any) => void) => {
        if (!socketRef.current) {
            socketRef.current = SocketManager.getInstance();
        }

        socketRef.current.on('disconnect', cb);
        const cleanup = () => socketRef.current?.off('disconnect', cb);
        addEventCleanup(cleanup);

        return cleanup;
    }, [addEventCleanup]);

    /* ---------- 对外工具 ---------- */
    const submitTask = useCallback((taskType: string = 'analysis', data: any) => { 
        
        if (!socketRef.current) { 
            socketRef.current = SocketManager.getInstance();
        }
 

        if (!socketRef.current.isConnected) {
            return false;
        }

        try { 
            socketRef.current.submitTask(taskType, data); 
            return true;
        } catch (error) {
            return false;
        }
    }, []);

    const getStats = useCallback(() => {
        if (!socketRef.current) {
            socketRef.current = SocketManager.getInstance();
        }

        if (!socketRef.current.isConnected) {
            return;
        }

        socketRef.current.getStats();
    }, []);

    const ping = useCallback(() => {
        if (!socketRef.current) {
            socketRef.current = SocketManager.getInstance();
        }

        if (!socketRef.current.isConnected) {
            return;
        }

        socketRef.current.ping();
    }, []);

    const checkHealth = useCallback(() => {
        if (!socketRef.current) {
            socketRef.current = SocketManager.getInstance();
        }
        return socketRef.current?.checkHealth() || { healthy: false, reason: '未初始化' };
    }, []);

    /* ---------- 生命周期管理 ---------- */
    useEffect(() => {
        // 初始化时获取 socket 实例
        if (!socketRef.current) {
            socketRef.current = SocketManager.getInstance();
            // 如果已经连接，更新状态
            if (socketRef.current.isConnected) {
                updateConnectionState();
                startStatusCheck();
            }
        }

        return () => {
            stopStatusCheck(); // 清理状态检查定时器
            clearEventListeners();
        };
    }, [clearEventListeners, stopStatusCheck, updateConnectionState, startStatusCheck]);

    return {
        // 连接管理
        connect,
        disconnect,
        reconnect,

        // 任务操作
        submitTask,
        handleTaskCompleted,
        getStats,
        ping,

        // 事件监听
        onTaskCompleted,
        onConnect,
        onDisconnect,

        // 状态信息 (从全局状态获取)
        isConnected,
        isConnecting,
        reconnectAttempts,
        connectionStatus,

        // 工具方法
        checkHealth,
        updateConnectionState,

        // 原始引用（谨慎使用）
        socketRef,
    };
}
