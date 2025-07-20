import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  id?: string;
  [key: string]: any;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onError?: (error: Event) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pendingMessages = useRef<Map<string, { resolve: Function; reject: Function }>>(new Map());

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setConnectionError(null);
        options.onOpen?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          // Handle pending promises
          if (message.id && pendingMessages.current.has(message.id)) {
            const { resolve } = pendingMessages.current.get(message.id)!;
            pendingMessages.current.delete(message.id);
            resolve(message);
          }
          
          options.onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        setConnectionError('WebSocket connection error');
        options.onError?.(error);
      };

      ws.onclose = () => {
        setIsConnected(false);
        options.onClose?.();
        
        // Reject all pending promises
        pendingMessages.current.forEach(({ reject }) => {
          reject(new Error('WebSocket connection closed'));
        });
        pendingMessages.current.clear();
      };

    } catch (error) {
      setConnectionError('Failed to create WebSocket connection');
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (message: WebSocketMessage): Promise<WebSocketMessage> => {
    return new Promise((resolve, reject) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket is not connected'));
        return;
      }

      const messageId = Math.random().toString(36).substr(2, 9);
      const messageWithId = { ...message, id: messageId };

      // Store promise for response
      pendingMessages.current.set(messageId, { resolve, reject });

      try {
        wsRef.current.send(JSON.stringify(messageWithId));
      } catch (error) {
        pendingMessages.current.delete(messageId);
        reject(error);
      }
    });
  };

  const sendMessageNoResponse = (message: WebSocketMessage): void => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  };

  return {
    isConnected,
    connectionError,
    sendMessage,
    sendMessageNoResponse,
  };
};
