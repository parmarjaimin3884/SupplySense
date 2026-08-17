import React, { useState } from 'react';
import { mockApiService } from '../../services/mockApi';
import { FiCpu, FiSend, FiFileText, FiUploadCloud, FiBookOpen, FiHelpCircle, FiPaperclip } from 'react-icons/fi';

export const KnowledgeBasePage = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your SupplySense Neural RAG Copilot. Ask any question regarding active ERP inventory ledgers, vendor SLAs, ocean freight manifests, or procurement compliance.',
      sources: []
    }
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    'What is our financial exposure on Taiwanese component delays?',
    'Summarize supplier SLA compliance for Lithium battery vendors.',
    'Recommend reorder quantities for Microcontrollers next month.',
    'Which warehouses have excess spatial storage capacity?'
  ];

  const handleAsk = async (e) => {
    e?.preventDefault();
    if (!query.trim() || loading) return;

    const userQ = query;
    setQuery('');
    setMessages((prev) => [...prev, { sender: 'user', text: userQ }]);
    setLoading(true);

    try {
      const res = await mockApiService.askAiAssistant(userQ);
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.answer, sources: res.sources }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: 'Error querying RAG knowledge graph. Please retry.', sources: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="knowledge-base-page">
      {/* Page Title */}
      <div className="page-header-row">
        <div>
          <h1 className="page-title"><FiCpu size={22} color="#7C3AED" /> Enterprise RAG Knowledge Base</h1>
          <p className="page-subtitle">Natural language vector query over ERP ledgers, contracts, manifests & customs logs</p>
        </div>
      </div>

      {/* Main RAG Layout: Chat Area + Right Sources Panel */}
      <div className="rag-layout-grid">
        {/* Chat Conversation Column */}
        <div className="card-panel rag-chat-container">
          <div className="rag-chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`rag-msg-row ${msg.sender}`}>
                <div className="rag-avatar">
                  {msg.sender === 'ai' ? <FiCpu size={16} /> : 'YOU'}
                </div>
                <div className="rag-bubble">
                  <div className="msg-text">{msg.text}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="rag-sources-list">
                      <div className="sources-header"><FiFileText size={12} /> Retrieved Document Sources:</div>
                      {msg.sources.map((src, sIdx) => (
                        <div key={sIdx} className="source-item">
                          <strong>{src.title}</strong> — <em>"{src.snippet}"</em>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="rag-msg-row ai loading">
                <div className="rag-avatar"><FiCpu size={16} /></div>
                <div className="rag-bubble">
                  <span className="typing-dots">Searching vector vector DB & synthesizing summary...</span>
                </div>
              </div>
            )}
          </div>

          {/* Suggested Prompts */}
          <div className="suggested-questions-row">
            {suggestedQuestions.map((q, qIdx) => (
              <button key={qIdx} className="sug-btn" onClick={() => { setQuery(q); }}>
                <FiHelpCircle size={12} /> {q}
              </button>
            ))}
          </div>

          {/* Chat Input Bar */}
          <form onSubmit={handleAsk} className="rag-input-form">
            <input
              type="text"
              className="rag-input"
              placeholder="Ask business telemetry question across contracts, ERP ledgers, telematics..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button type="submit" className="rag-send-btn" disabled={loading}>
              <FiSend size={16} /> Ask AI
            </button>
          </form>
        </div>

        {/* Right Panel: Document Upload & Knowledge Graph */}
        <div className="rag-side-panel">
          <div className="card-panel upload-zone-card">
            <h3><FiUploadCloud size={18} color="#3B82F6" /> Ingest Enterprise Docs</h3>
            <p className="upload-desc">Drag & drop PDF contracts, customs manifests or ERP CSV exports to index into vector store.</p>
            <div className="dropzone-box" onClick={() => alert("Document upload placeholder: Select PDF/CSV file")}>
              <FiPaperclip size={24} color="#64748B" />
              <span>Click to Upload Documents</span>
              <span className="drop-sub">Supported: PDF, CSV, DOCX (Max 50MB)</span>
            </div>
          </div>

          <div className="card-panel indexed-docs-card">
            <h3><FiBookOpen size={18} color="#10B981" /> Active Vector Index</h3>
            <div className="doc-index-list">
              <div className="doc-file-item">
                <FiFileText color="#3B82F6" />
                <div>
                  <div className="doc-name">ERP_Inventory_Ledger_2026.pdf</div>
                  <div className="doc-meta">Indexed 2h ago • 4,250 vectors</div>
                </div>
              </div>
              <div className="doc-file-item">
                <FiFileText color="#7C3AED" />
                <div>
                  <div className="doc-name">Supplier_SLA_Contracts_2026.docx</div>
                  <div className="doc-meta">Indexed 1d ago • 1,820 vectors</div>
                </div>
              </div>
              <div className="doc-file-item">
                <FiFileText color="#10B981" />
                <div>
                  <div className="doc-name">Ocean_Freight_Manifests_Q3.csv</div>
                  <div className="doc-meta">Indexed 3h ago • 8,900 vectors</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBasePage;
