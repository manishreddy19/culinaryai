
import React, { useState, useRef, useEffect } from 'react';
import { fitnessConsultant } from '../services/geminiService';
import { ChatMessage, UserProfile } from '../types';

interface AssistantProps {
  profile: UserProfile;
}

const Assistant: React.FC<AssistantProps> = ({ profile }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Hello ${profile.name}! I'm your Fitness & Diet Consultant. Based on your goal of ${profile.healthGoals}, how can I help you optimize your nutrition or meal planning today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const response = await fitnessConsultant([...messages, userMsg], profile);
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl flex items-center justify-between overflow-hidden relative">
        <div className="z-10">
          <h2 className="text-xl font-black heading-font mb-1">Fitness Consultant</h2>
          <p className="text-xs text-emerald-100 font-medium">Science-backed nutritional coaching.</p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-4 min-h-[400px]">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-5 text-sm font-medium shadow-sm border ${
              msg.role === 'user' 
                ? 'bg-emerald-600 text-white border-emerald-500 rounded-tr-none' 
                : 'bg-white text-slate-700 border-slate-100 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm rounded-tl-none">
                <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
                </span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for a meal plan or budget list..."
          className="flex-1 rounded-2xl bg-white border-none shadow-inner p-4 focus:ring-2 focus:ring-emerald-500 text-slate-700 font-medium"
        />
        <button type="submit" disabled={loading} className="bg-emerald-600 text-white p-4 rounded-2xl shadow-xl hover:bg-emerald-700 transition-all active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
        </button>
      </form>
    </div>
  );
};

export default Assistant;
