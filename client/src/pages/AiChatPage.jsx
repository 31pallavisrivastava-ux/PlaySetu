import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';

const SUGGESTIONS = [
  'Book a badminton court near Gomti Nagar tomorrow evening under ₹500',
  'Football turf near Chinhat for 10 players under ₹2500',
  'Swimming pool tomorrow morning near Gomti Nagar',
];

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I am PlaySetu. Tell me sport, area, time and budget — I will find and book slots in Lucknow.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const accessToken = useAuthStore((s) => s.accessToken);
  const navigate = useNavigate();

  async function send(text) {
    if (!accessToken) {
      navigate('/login');
      return;
    }
    const userMsg = text || input;
    if (!userMsg.trim()) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text: userMsg }]);
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chat', { message: userMsg });
      setMessages((m) => [...m, { role: 'assistant', text: data.data.reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', text: err.response?.data?.error?.message || 'Something went wrong' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col min-h-[70vh]">
      <h1 className="text-2xl font-bold mb-4">AI Assistant</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => send(s)}
            className="text-xs px-3 py-1.5 rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700"
          >
            {s.slice(0, 48)}…
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-xl text-sm ${
              msg.role === 'user' ? 'bg-brand-900/40 ml-8' : 'bg-slate-900 mr-8'
            }`}
          >
            {msg.text}
          </div>
        ))}
        {loading && <p className="text-slate-500 text-sm">Thinking…</p>}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask PlaySetu…"
          className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700"
        />
        <button type="submit" className="px-5 py-3 rounded-xl bg-brand-600 font-semibold">
          Send
        </button>
      </form>
    </div>
  );
}
