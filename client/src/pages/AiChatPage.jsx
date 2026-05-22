import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { getUserLocation } from '../lib/geolocation.js';
import { useAuthStore } from '../store/authStore.js';

const SUGGESTIONS = [
  'Book a badminton court near Gomti Nagar tomorrow evening under ₹500',
  'Football turf near Chinhat for 10 players under ₹2500',
  'Swimming pool tomorrow morning near Gomti Nagar',
];

export default function AiChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I\'m your PlaySetu assistant — like having Playo in your pocket for Lucknow. Tell me sport, area, time & budget.',
    },
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
      const location = await getUserLocation();
      const { data } = await api.post('/ai/chat', {
        message: userMsg,
        ...(location ? { location } : {}),
      });
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
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-gradient-to-r from-playo-green to-emerald-600 text-white">
        <div className="max-w-2xl mx-auto px-4 py-10 text-center">
          <h1 className="text-2xl md:text-3xl font-extrabold">AI Sports Assistant</h1>
          <p className="text-emerald-50 text-sm mt-2">Ask in plain English or Hindi</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="text-xs px-3 py-2 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-playo-green hover:text-playo-green shadow-sm"
            >
              {s.length > 42 ? `${s.slice(0, 42)}…` : s}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto min-h-[320px] mb-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-playo-green text-white rounded-br-md'
                    : 'bg-white border border-slate-100 text-slate-700 shadow-sm rounded-bl-md'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-playo-green animate-pulse" />
              Finding venues…
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-lg sticky bottom-20 md:bottom-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. badminton near Gomti Nagar under ₹500"
            className="flex-1 px-4 py-3 rounded-xl bg-transparent focus:outline-none text-slate-800"
          />
          <button type="submit" className="btn-playo py-2 px-6 shrink-0">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
