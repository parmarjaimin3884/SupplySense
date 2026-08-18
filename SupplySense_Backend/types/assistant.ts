export type ResponseType = 'DIRECT_TOOL' | 'AGENT' | 'RAG' | 'UNSUPPORTED_HYBRID' | 'UNKNOWN';

export interface SourceCitation {
  documentId?: string;
  title: string;
  code?: string;
  section?: string;
  page?: number;
  snippet: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  responseType?: ResponseType;
  agentUsed?: string;
  sources?: SourceCitation[];
  timestamp: string;
  isError?: boolean;
}
