/**
 * SupplySense — AI Assistant API Service
 */

import apiClient, { getStoredAuth } from "@/lib/api/client";
import type { BaseResponse } from "@/types/common";
import type { ChatRequest, ChatResponse, AIHealth, StreamChunk } from "@/types/assistant";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const assistantApi = {
  chat: async (payload: ChatRequest): Promise<ChatResponse> => {
    const response = await apiClient.post<ChatResponse>("/ai/chat", payload, {
      timeout: 180_000,
    });
    return response.data;
  },

  getHealth: async (): Promise<AIHealth> => {
    const response = await apiClient.get<BaseResponse<AIHealth>>("/ai/health");
    return response.data.data;
  },

  /**
   * Streaming SSE chat endpoint.
   * Uses native fetch + ReadableStream for Server-Sent Events.
   * Returns an async generator yielding StreamChunk objects.
   */
  streamChat: async function* (payload: ChatRequest): AsyncGenerator<StreamChunk> {
    const auth = getStoredAuth();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (auth?.accessToken) {
      headers["Authorization"] = `Bearer ${auth.accessToken}`;
    }

    const response = await fetch(`${BASE_URL}/ai/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Stream request failed with status ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No readable stream available");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            try {
              const chunk: StreamChunk = JSON.parse(trimmed.slice(6));
              yield chunk;
            } catch {
              // Skip malformed SSE data
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  },
};
