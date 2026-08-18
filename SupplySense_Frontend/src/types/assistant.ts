/**
 * SupplySense — AI Assistant Type Definitions
 * Maps to backend: backend/app/schemas/assistant.py
 */

export interface ChatRequest {
  query: string;
  message?: string;
  conversation_id?: string;
  user_id?: string;
}

export interface ChatResponse {
  success: boolean;
  query: string;
  response: string;
  execution_mode: string;
  intent?: string | null;
  sources: string[];
  selected_agents: string[];
  findings: Array<Record<string, unknown>>;
  recommendations: Array<Record<string, unknown>>;
  confidence: number;
  execution_time_ms: number;
}

export interface AIHealth {
  status: string;
  llm_provider: string;
  llm_model: string;
  vector_store: string;
  qdrant_collection: string;
}

export interface StreamChunk {
  chunk_type: "node_start" | "token" | "finding" | "done" | "error";
  content: string;
  agent_name?: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  confidence?: number;
  sources?: string[];
  selected_agents?: string[];
  findings?: Array<Record<string, unknown>>;
  recommendations?: Array<Record<string, unknown>>;
  execution_time_ms?: number;
  isStreaming?: boolean;
}
