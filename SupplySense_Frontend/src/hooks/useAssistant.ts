/**
 * SupplySense — AI Assistant React Query Hooks
 */

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryKeys } from "@/lib/react-query/keys";
import { assistantApi } from "@/lib/api/assistant";
import type { ChatRequest, ChatResponse, ChatMessage, StreamChunk } from "@/types/assistant";

export function useAIHealth() {
  return useQuery({
    queryKey: queryKeys.assistant.health,
    queryFn: assistantApi.getHealth,
    staleTime: 30_000,
  });
}

export function useAIChat() {
  return useMutation({
    mutationFn: (payload: ChatRequest) => assistantApi.chat(payload),
  });
}

export function useAIStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const startStream = useCallback(async (payload: ChatRequest): Promise<string> => {
    setIsStreaming(true);
    setStreamedContent("");
    setActiveAgents([]);
    setError(null);

    let fullContent = "";

    try {
      for await (const chunk of assistantApi.streamChat(payload)) {
        switch (chunk.chunk_type) {
          case "node_start":
            if (chunk.agent_name) {
              setActiveAgents((prev) => [...prev, chunk.agent_name!]);
            }
            break;
          case "token":
            fullContent += chunk.content;
            setStreamedContent(fullContent);
            break;
          case "done":
            break;
          case "error":
            setError(chunk.content);
            break;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Stream failed";
      setError(message);
    } finally {
      setIsStreaming(false);
    }

    return fullContent;
  }, []);

  const reset = useCallback(() => {
    setIsStreaming(false);
    setStreamedContent("");
    setActiveAgents([]);
    setError(null);
  }, []);

  return {
    isStreaming,
    streamedContent,
    activeAgents,
    error,
    startStream,
    reset,
  };
}

/**
 * Full chat session manager with history
 */
export function useChatSession() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const aiChat = useAIChat();
  const aiStream = useAIStream();

  const sendMessage = useCallback(async (query: string, useStreaming = false) => {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: "user",
      content: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    const assistantMessageId = `msg-${Date.now()}-assistant`;

    if (useStreaming) {
      const placeholderMsg: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };
      setMessages((prev) => [...prev, placeholderMsg]);

      const finalContent = await aiStream.startStream({ query });

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                content: finalContent,
                isStreaming: false,
                selected_agents: aiStream.activeAgents,
              }
            : m
        )
      );
    } else {
      try {
        const response: ChatResponse = await aiChat.mutateAsync({ query });
        const assistantMsg: ChatMessage = {
          id: assistantMessageId,
          role: "assistant",
          content: response.response,
          timestamp: new Date(),
          confidence: response.confidence,
          sources: response.sources,
          selected_agents: response.selected_agents,
          findings: response.findings,
          recommendations: response.recommendations,
          execution_time_ms: response.execution_time_ms,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        const errorMsg: ChatMessage = {
          id: assistantMessageId,
          role: "assistant",
          content: err instanceof Error ? err.message : "Failed to get response from AI assistant.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    }
  }, [aiChat, aiStream]);

  const clearHistory = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    sendMessage,
    clearHistory,
    isLoading: aiChat.isPending || aiStream.isStreaming,
  };
}
