import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string, isStreaming: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  updateLastMessage: (content, isStreaming) => set((state) => {
    const newMsgs = [...state.messages];
    if (newMsgs.length > 0 && newMsgs[newMsgs.length - 1].role === 'assistant') {
      newMsgs[newMsgs.length - 1] = { ...newMsgs[newMsgs.length - 1], content, isStreaming };
    }
    return { messages: newMsgs };
  }),
  clearMessages: () => set({ messages: [] }),
}));
