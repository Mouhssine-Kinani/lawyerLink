import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import Sidebar from "../../components/layout/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { useChat } from "../../hooks/useChat";

export default function ChatPage() {
  const navigate = useNavigate();
  const {
    sessions,
    activeSessionId,
    messages,
    recommendations,
    sending,
    loadingSessions,
    loadingMessages,
    loadingRecommendations,
    error,
    createSession,
    sendMessage,
    deleteSession,
    selectSession,
  } = useChat();

  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    await sendMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderMessages = () => {
    if (loadingMessages) {
      return (
        <div className="flex justify-center pt-20">
          <span className="material-symbols-outlined text-outline animate-spin text-3xl">refresh</span>
        </div>
      );
    }
    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-on-surface-variant text-sm">Send a message to start the conversation.</p>
        </div>
      );
    }
    return (
      <div className="space-y-8">
        {messages.map((msg) =>
          msg.sender === "client" ? (
            <div key={msg.id} className="flex justify-end">
              <div className="max-w-[75%] bg-surface-container-lowest p-5 rounded-2xl rounded-tr-none shadow-sm border border-outline-variant/10 text-on-surface leading-relaxed">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="text-sm leading-relaxed my-1">{children}</p>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
                <p className="text-[10px] text-outline mt-2 text-right">{formatTime(msg.created_at)}</p>
              </div>
            </div>
          ) : (
            <div key={msg.id} className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-lg">smart_toy</span>
              </div>
              <div className="max-w-[75%] space-y-2">
                <div className="bg-surface-container-high/40 p-5 rounded-2xl rounded-tl-none text-on-surface leading-relaxed border border-surface-container-high">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="text-sm leading-relaxed my-1">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold text-primary">{children}</strong>,
                      ol: ({ children }) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                      ul: ({ children }) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                      li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                      h3: ({ children }) => <h3 className="text-sm font-bold text-primary mt-4 mb-2">{children}</h3>,
                      code: ({ children }) => <code className="text-xs bg-surface-container-highest px-1.5 py-0.5 rounded">{children}</code>,
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <p className="text-[10px] text-outline px-1">{formatTime(msg.created_at)}</p>
              </div>
            </div>
          )
        )}
        {sending && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div className="max-w-[75%]">
              <div className="bg-surface-container-high/40 p-5 rounded-2xl rounded-tl-none border border-surface-container-high">
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0.3s]" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  const renderRecommendations = () => {
    if (loadingRecommendations) {
      return (
        <div className="flex justify-center py-8">
          <span className="material-symbols-outlined text-outline animate-spin">refresh</span>
        </div>
      );
    }
    if (recommendations.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <span className="material-symbols-outlined text-3xl text-outline mb-4 block">gavel</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            No recommendations yet. The AI will recommend lawyers based on your conversation.
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const lawyer = rec.lawyer;
          if (!lawyer) return null;
          const name = [lawyer.first_name, lawyer.last_name].filter(Boolean).join(" ") || `Lawyer #${lawyer.id}`;
          const specialties = lawyer.specialties ? lawyer.specialties.split(",").map((s) => s.trim()).filter(Boolean) : [];
          return (
            <div key={rec.id} onClick={() => navigate(`/client/lawyers/${lawyer.id}`)} className="bg-surface-container-high/40 p-4 rounded-xl border border-surface-container-high cursor-pointer hover:border-primary/30 transition-colors">
              {rec.rank === 1 && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="bg-tertiary text-white text-[9px] px-2 py-0.5 font-bold rounded uppercase">Top Match</span>
                </div>
              )}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-bold text-sm shrink-0">
                  {name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-on-surface truncate">{name}</p>
                  {lawyer.firm && (
                    <p className="text-[10px] text-on-surface-variant truncate">{lawyer.firm}</p>
                  )}
                </div>
              </div>
              {specialties.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {specialties.slice(0, 3).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white/50 border border-outline-variant/30 rounded-full text-[9px] font-bold uppercase tracking-wider text-outline">
                      {s}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                {lawyer.hourly_rate && (
                  <span className="font-bold text-primary">${parseFloat(lawyer.hourly_rate).toFixed(0)}<span className="text-outline font-normal text-[10px]">/hr</span></span>
                )}
                {lawyer.city && (
                  <span className="text-on-surface-variant truncate ml-2">{lawyer.city}</span>
                )}
              </div>
              {lawyer.rating_avg && (
                <div className="flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-xs text-on-tertiary-container" style={{fontVariationSettings: "'FILL' 1"}}>star</span>
                  <span className="text-[10px] font-bold text-on-surface">{parseFloat(lawyer.rating_avg).toFixed(1)}</span>
                  {lawyer.rating_count && (
                    <span className="text-[10px] text-outline">({lawyer.rating_count})</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar>
        <div className="px-2 space-y-1">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Recent Chats
            </p>
            <button
              onClick={createSession}
              disabled={sending}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-primary text-white hover:opacity-90 transition-opacity cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">add</span>
            </button>
          </div>
          <div className="overflow-y-auto no-scrollbar bg-gray-100 rounded-xl" style={{ maxHeight: "calc(100vh - 580px)" }}>
          {loadingSessions ? (
            <div className="flex justify-center py-8">
              <span className="material-symbols-outlined text-outline animate-spin">refresh</span>
            </div>
          ) : sessions.length === 0 ? (
            <p className="text-xs text-on-surface-variant px-3 py-6 text-center">
              No conversations yet
            </p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${
                  activeSessionId === s.id
                    ? "bg-surface-container text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container-low"
                }`}
              >
                <span className="truncate flex-1">{s.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession(s.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-outline hover:text-error cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            ))
          )}
          </div>
        </div>
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        {error && (
          <div className="px-8 pt-4">
            <div className="max-w-4xl mx-auto p-4 rounded-xl bg-error-container text-on-error-container text-sm text-center">
              {error}
            </div>
          </div>
        )}

        {!activeSessionId ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center max-w-md px-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-4xl text-primary">smart_toy</span>
              </div>
              <h2 className="text-2xl font-bold text-on-surface mb-3">AI Legal Assistant</h2>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                Start a new consultation. Describe your legal situation in detail and our AI will
                analyze your case, suggest next steps, and recommend specialized lawyers.
              </p>
              <button
                onClick={createSession}
                disabled={sending}
                className="inline-flex items-center gap-2 px-8 py-3.5 primary-gradient text-white font-semibold rounded-xl shadow-lg shadow-primary/20 hover:opacity-90 transition-opacity cursor-pointer"
              >
                <span className="material-symbols-outlined">add</span>
                Start New Consultation
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-8">
                <div className="max-w-4xl mx-auto">
                  {renderMessages()}
                </div>
              </div>
              <footer className="px-8 py-5 bg-surface-container-lowest border-t border-outline-variant/20">
                <div className="max-w-4xl mx-auto relative">
                  <div className="flex items-end gap-3 bg-surface border border-outline-variant/40 rounded-2xl p-3 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    <button className="p-2 text-outline hover:text-primary transition-colors cursor-pointer">
                      <span className="material-symbols-outlined">attach_file</span>
                    </button>
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface placeholder:text-outline text-sm py-1.5 resize-none no-scrollbar max-h-32"
                      placeholder="Describe your legal issue in detail..."
                      rows={1}
                      disabled={sending}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || sending}
                      className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20 disabled:opacity-40 transition-opacity cursor-pointer"
                    >
                      <span className="material-symbols-outlined">send</span>
                    </button>
                  </div>
                </div>
              </footer>
            </div>
            <aside className="hidden xl:flex w-80 glass-sidebar border-l border-outline-variant/30 flex-col overflow-y-auto no-scrollbar">
              <div className="p-6">
                <h2 className="text-sm font-bold text-on-surface uppercase tracking-widest mb-6">
                  Matched Lawyers
                </h2>
                {renderRecommendations()}
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
