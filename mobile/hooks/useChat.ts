import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { useChatStore } from '../stores/chatStore';
import { WebSocketClient } from '../services/websocket';

export const useChat = (docId: string) => {
  const { messages, addMessage, updateLastMessage } = useChatStore();
  const wsRef = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const wsHost = Platform.OS === 'android' ? '10.0.2.2:8000' : 'localhost:8000';
    wsRef.current = new WebSocketClient(`ws://${wsHost}/chat/${docId}`, (data) => {
      try {
        const msg = JSON.parse(data);
        if (msg.event === 'start') {
          addMessage({ id: Date.now().toString(), role: 'assistant', content: '', isStreaming: true });
        } else if (msg.event === 'chunk') {
          updateLastMessage(msg.text, true); // Actually should append, simplifying for demo
        } else if (msg.event === 'end') {
          updateLastMessage(msg.text, false);
        }
      } catch (e) {
        console.error(e);
      }
    });
    wsRef.current.connect();
    return () => wsRef.current?.disconnect();
  }, [docId, addMessage, updateLastMessage]);

  const sendMessage = (text: string) => {
    addMessage({ id: Date.now().toString(), role: 'user', content: text });
    wsRef.current?.send(JSON.stringify({ text }));
  };

  return { messages, sendMessage };
};
