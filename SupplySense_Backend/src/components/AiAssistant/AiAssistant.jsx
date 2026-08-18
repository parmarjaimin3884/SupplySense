import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer/Drawer';
import { Input } from '../ui/Input/Input';
import { Button } from '../ui/Button/Button';
import { mockApiService } from '../../services/mockApi';
import { useSupplyChain } from '../../context/SupplyChainContext';
import { FiSend, FiCpu, FiFileText, FiZap } from 'react-icons/fi';

export const AiAssistant = () => {
  const { isAiDrawerOpen, setIsAiDrawerOpen } = useSupplyChain();
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'Hello Dr. Vance. I am your SupplySense AI Copilot. How can I assist with your supply chain risk intelligence today?'
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedPrompts = [
    'Analyze Taiwan port delay risk',
    'Which SKUs are near stockout?',
    'Supplier reliability benchmark'
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || inputVal;
    if (!query.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputVal('');

    setIsTyping(true);

    try {
      const res = await mockApiService.askAiAssistant(query);
      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: res.answer,
        sources: res.sources
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI assistant error', err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Drawer isOpen={isAiDrawerOpen} onClose={() => setIsAiDrawerOpen(false)} title="SupplySense AI Intelligence Assistant" width="560px">
      <div className="ai-assistant-container">
        <div className="suggested-prompts-row">
          {suggestedPrompts.map((p, idx) => (
            <button key={idx} className="suggested-prompt-chip" onClick={() => handleSend(p)}>
              <FiZap size={12} style={{ marginRight: 4 }} />
              {p}
            </button>
          ))}
        </div>

        <div className="ai-assistant-messages">
          {messages.map((m) => (
            <div key={m.id} className={`chat-bubble ${m.sender}`}>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              {m.sources && (
                <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }}>
                  <strong style={{ color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FiFileText size={12} /> Data Citations & Sources:
                  </strong>
                  <ul style={{ paddingLeft: 16, marginTop: 4 }}>
                    {m.sources.map((s, sIdx) => (
                      <li key={sIdx} style={{ opacity: 0.8 }}>{s.title}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="chat-bubble ai chat-typing-dots">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="ai-input-bar">
          <Input
            placeholder="Ask AI about stockouts, risk, lead times..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
          />
          <Button variant="purple" type="submit" disabled={isTyping || !inputVal.trim()}>
            <FiSend size={16} />
          </Button>
        </form>
      </div>
    </Drawer>
  );
};

export default AiAssistant;

