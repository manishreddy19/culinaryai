
import React, { useState } from 'react';

interface AuthProps {
  onLogin: (user: { email: string; name: string }) => void;
}

interface StoredUser {
  email: string;
  password: string;
  name: string;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const getUsers = (): StoredUser[] => {
    const users = localStorage.getItem('culinary_users');
    return users ? JSON.parse(users) : [];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const users = getUsers();

    if (isLogin) {
      // Login Logic
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        setError("No account found with this email.");
        return;
      }
      if (user.password !== password) {
        setError("Incorrect password. Please try again.");
        return;
      }
      // Success
      onLogin({ email: user.email, name: user.name });
    } else {
      // Registration Logic
      if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        setError("An account with this email already exists.");
        return;
      }
      
      const newUser: StoredUser = { email, password, name: name || 'User' };
      const updatedUsers = [...users, newUser];
      localStorage.setItem('culinary_users', JSON.stringify(updatedUsers));
      
      // Auto-login after registration
      onLogin({ email: newUser.email, name: newUser.name });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 animate-in fade-in duration-700">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 border border-slate-100">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-black heading-font text-slate-800 mb-2">CulinaryAI</h1>
          <p className="text-slate-400 font-medium">{isLogin ? "Sign in to your private kitchen." : "Create your wellness profile."}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700 font-medium placeholder:text-slate-300 shadow-inner"
                placeholder="Jane Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700 font-medium placeholder:text-slate-300 shadow-inner"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all text-slate-700 font-medium placeholder:text-slate-300 shadow-inner"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-black transition-all active:scale-[0.98] uppercase tracking-widest text-sm"
          >
            {isLogin ? "Enter App" : "Get Started"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors uppercase tracking-widest"
          >
            {isLogin ? "Need an account? Sign Up" : "Already a member? Log In"}
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-slate-300 text-[10px] font-bold uppercase tracking-widest">
        SECURE LOCAL AUTHENTICATION ACTIVE
      </p>
    </div>
  );
};

export default Auth;
