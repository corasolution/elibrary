import { useState, useRef, useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { MessageCircle, X, Send, Loader2, Sparkles, BookOpen } from 'lucide-react';

/**
 * Floating catalog-aware AI assistant for the OPAC.
 * Renders only when ai.chatbot_enabled is true (shared Inertia prop).
 */
export default function ChatbotWidget() {
    const { props } = usePage();
    const tenant = props?.tenant ?? {};
    const ai = props?.ai ?? {};
    const slug = tenant.slug;

    if (!ai.chatbot_enabled || !slug) return null;

    const [open, setOpen] = useState(false);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: `Hi! I'm the ${tenant.name ?? 'library'} assistant. Ask me to find books or about the library.` },
    ]);
    const endRef = useRef(null);

    useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

    const csrf = () => document.querySelector('meta[name="csrf-token"]')?.content ?? '';

    const send = async (e) => {
        e?.preventDefault();
        const text = input.trim();
        if (!text || sending) return;
        setInput('');
        const history = messages.filter(m => m.role).map(m => ({ role: m.role, text: m.text })).slice(-8);
        setMessages(m => [...m, { role: 'user', text }]);
        setSending(true);
        try {
            const res = await fetch(`/${slug}/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrf() },
                body: JSON.stringify({ message: text, history }),
            });
            const data = await res.json();
            if (!res.ok) {
                setMessages(m => [...m, { role: 'assistant', text: data.error || 'Sorry, the assistant is unavailable.' }]);
            } else {
                setMessages(m => [...m, { role: 'assistant', text: data.reply, sources: data.sources ?? [] }]);
            }
        } catch {
            setMessages(m => [...m, { role: 'assistant', text: 'Network error — please try again.' }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {/* Launcher */}
            {!open && (
                <button onClick={() => setOpen(true)}
                    className="fixed z-40 bottom-5 right-5 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm font-medium hidden sm:inline">Ask the library</span>
                </button>
            )}

            {/* Panel */}
            {open && (
                <div className="fixed z-50 bottom-5 right-5 w-[92vw] max-w-sm h-[70vh] max-h-[560px] flex flex-col bg-white rounded-2xl shadow-2xl ring-1 ring-black/10 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex-shrink-0">
                        <Sparkles className="w-5 h-5" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold leading-tight">Library Assistant</div>
                            <div className="text-[11px] text-white/70">AI-powered · catalog-aware</div>
                        </div>
                        <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/15 rounded-lg"><X className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-gray-50">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                    {m.sources?.length > 0 && (
                                        <div className="mt-2 pt-2 border-t border-gray-100 space-y-1">
                                            {m.sources.map(s => (
                                                <a key={s.id} href={s.url} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                                                    <BookOpen className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{s.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {sending && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl px-3.5 py-2 text-sm text-gray-400 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" /> thinking…
                                </div>
                            </div>
                        )}
                        <div ref={endRef} />
                    </div>

                    <form onSubmit={send} className="flex-shrink-0 p-3 border-t border-gray-100 flex gap-2 bg-white">
                        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Find books on…"
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="submit" disabled={sending || !input.trim()}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}
        </>
    );
}
