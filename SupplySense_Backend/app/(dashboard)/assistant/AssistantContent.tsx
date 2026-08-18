'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useAssistantStore } from '@/stores/useAssistantStore';
import { assistantService } from '@/lib/services/assistantService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AIMessage } from '@/types';

export default function AssistantContent() {
  const { messages, addMessage, isTyping, setIsTyping, contextQuery, setContextQuery } = useAssistantStore();
  const [input, setInput] = useState('');
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contextQuery) {
      setInput(contextQuery);
      setContextQuery(null);
    }
  }, [contextQuery, setContextQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isTyping) return;

    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(userMsg);
    if (!queryText) setInput('');
    setIsTyping(true);

    try {
      const response = await assistantService.askQuestion(textToSend);
      addMessage(response);
    } catch {
      addMessage({
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        content: 'Assistant service encountered an operational error processing your request.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } finally {
      setIsTyping(false);
    }
  };

  const toggleSource = (msgId: string) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const suggestedPrompts = [
    'How many units of Apple ProBook Ultra 15" are available in stock?',
    'Why is shipment SHP-9021 delayed and what is the revised ETA?',
    'What is our Emergency Sourcing Policy for critical stock breaches?',
    'Provide a risk overview of high-defect suppliers in Europe.',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] animate-in fade-in duration-200">
      {/* Header */}
      <div className="p-4 bg-white border border-slate-200 rounded-t-2xl flex items-center justify-between shadow-subtle shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-ai-glow">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">SupplySense AI Operations Assistant</h1>
              <Badge variant="ai" size="sm">
                Supply Chain Model
              </Badge>
            </div>
            <p className="text-[11px] text-slate-500">Autonomous supply chain intelligence service</p>
          </div>
        </div>
      </div>

      {/* Message History Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 border-x border-slate-200 scrollbar-thin">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${msg.sender === 'user' ? 'bg-slate-900' : 'bg-indigo-600 shadow-ai-glow'}`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`space-y-2 text-xs rounded-2xl p-4 shadow-subtle ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'}`}>
              {msg.agentUsed && (
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-[10px] text-indigo-600 font-mono font-bold">
                  <Sparkles className="w-3 h-3" />
                  <span>Agent Executed: {msg.agentUsed}</span>
                  {msg.responseType && <Badge variant="neutral" size="sm" className="ml-auto text-[9px] uppercase">{msg.responseType}</Badge>}
                </div>
              )}

              <div className="prose prose-xs max-w-none dark:prose-invert whitespace-pre-line leading-relaxed">
                {msg.content}
              </div>

              {/* RAG Source Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleSource(msg.id)}
                    className="flex items-center justify-between w-full p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-indigo-700">
                      <FileText className="w-3.5 h-3.5" />
                      Cited Knowledge Sources ({msg.sources.length})
                    </span>
                    {expandedSources[msg.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {expandedSources[msg.id] && (
                    <div className="mt-2 space-y-2 pl-2 border-l-2 border-indigo-500">
                      {msg.sources.map((src) => (
                        <div key={src.documentId} className="p-2 bg-slate-50 rounded text-[11px] space-y-0.5 border border-slate-200">
                          <div className="font-bold text-slate-900 flex items-center justify-between">
                            <span>{src.title}</span>
                            <span className="text-[9px] font-mono text-slate-400">Page {src.page}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">{src.code} â€¢ Section: {src.section}</div>
                          <p className="text-[10px] text-slate-600 italic mt-1">&quot;{src.snippet}&quot;</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className={`text-[9px] text-right font-mono ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="p-3 bg-white rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
              Processing domain query...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Banner */}
      <div className="p-3 bg-slate-100 border-x border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 font-mono">Suggested:</span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(prompt)}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-full text-[11px] text-slate-700 hover:text-indigo-700 whitespace-nowrap transition-all shadow-2xs font-medium"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-b-2xl shadow-subtle shrink-0">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
          <Input
            placeholder="Ask AI Assistant about stock levels, POs, shipments, or company SOP policies..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            className="flex-1"
          />
          <Button type="submit" variant="ai" size="md" disabled={!input.trim() || isTyping}>
            <Send className="w-4 h-4 mr-1" />
            Send Query
          </Button>
        </form>
      </div>
    </div>
  );
}
