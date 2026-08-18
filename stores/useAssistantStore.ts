import { create } from 'zustand';
import { AIMessage } from '@/types';

interface AssistantState {
  messages: AIMessage[];
  isTyping: boolean;
  contextQuery: string | null;
  activeQueryContext: string | null;
  addMessage: (msg: AIMessage) => void;
  setIsTyping: (typing: boolean) => void;
  setContextQuery: (query: string | null) => void;
  clearMessages: () => void;
}

export const useAssistantStore = create<AssistantState>((set) => ({
  messages: [
    {
      id: 'init-1',
      sender: 'assistant',
      content: 'Hello Alex, I am SupplySense AI Intelligence. How can I assist with your inventory, shipment telemetry, supplier SLAs, or risk mitigation today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      responseType: 'AGENT',
      agentUsed: 'Supervisor AI Agent'
    }
  ],
  isTyping: false,
  contextQuery: null,
  activeQueryContext: null,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setIsTyping: (typing) => set({ isTyping: typing }),
  setContextQuery: (query) => set({ contextQuery: query, activeQueryContext: query }),
  clearMessages: () => set({
    messages: [
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        content: 'Conversation history cleared. How can SupplySense AI assist you now?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responseType: 'AGENT',
        agentUsed: 'Supervisor AI Agent'
      }
    ]
  }),
}));
