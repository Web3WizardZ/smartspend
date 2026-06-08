import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function CampaignGuideChat() {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Start conversation when chat opens
  useEffect(() => {
    if (!open || conversation) return;
    base44.agents.createConversation({
      agent_name: 'campaign_guide',
      metadata: { name: 'Campaign Guide' },
    }).then(conv => {
      setConversation(conv);
      setMessages(conv.messages || []);
    });
  }, [open]);

  // Subscribe to live message updates
  useEffect(() => {
    if (!conversation?.id) return;
    const unsub = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
    });
    return unsub;
  }, [conversation?.id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !conversation || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    await base44.agents.addMessage(conversation, { role: 'user', content: text });
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
        aria-label="Open campaign guide"
      >
        <MessageCircle className="w-6 h-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:justify-end sm:p-6 sm:pb-24 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm h-[520px] bg-white rounded-3xl shadow-2xl border border-border flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm font-bold">Campaign Guide</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && !conversation && (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
                </div>
              )}
              {messages.length === 0 && conversation && (
                <p className="text-xs text-muted-foreground text-center pt-8">Ask me about active campaigns, your progress, or how to earn G$ rewards!</p>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.content
                    ) : (
                      <ReactMarkdown className="prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-3 border-t border-border flex-shrink-0">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about campaigns…"
                className="flex-1 text-sm bg-muted rounded-xl px-3 py-2 outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending || !conversation}
                className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center disabled:opacity-40 transition-opacity"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}