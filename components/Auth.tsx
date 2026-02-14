
import React, { useState } from 'react';
import { supabase } from '../App';

interface AuthProps {
  onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUsername = (val: string) => {
    const re = /^[a-zA-Z0-9]+$/;
    return val.length >= 4 && re.test(val);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        if (!validateUsername(username)) {
          throw new Error("Логин должен быть от 4 символов (английские буквы и цифры).");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username }
          }
        });
        if (error) throw error;
        alert("Регистрация успешна! Теперь вы можете войти.");
        setIsLogin(true);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message === 'Invalid login credentials' ? 'Неверный email или пароль' : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-[#222] p-10 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-black text-center mb-10 tracking-tighter italic">
          CASE<span className="text-white">OGO</span>
        </h1>
        
        <form onSubmit={handleAuth} className="space-y-5">
          {!isLogin && (
            <div>
              <label className="block text-[10px] uppercase font-black text-gray-500 mb-2 ml-1 tracking-widest">Имя пользователя (EN)</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black border border-[#333] p-4 rounded-2xl text-white focus:outline-none focus:border-white/30 transition-all"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2 ml-1 tracking-widest">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black border border-[#333] p-4 rounded-2xl text-white focus:outline-none focus:border-white/30 transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase font-black text-gray-500 mb-2 ml-1 tracking-widest">Пароль</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-[#333] p-4 rounded-2xl text-white focus:outline-none focus:border-white/30 transition-all"
              required
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-wider text-center bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 uppercase tracking-tighter italic"
          >
            {loading ? 'Обработка...' : (isLogin ? 'ВОЙТИ' : 'ЗАРЕГИСТРИРОВАТЬСЯ')}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 text-[11px] font-black uppercase tracking-widest">
          {isLogin ? "Нет аккаунта?" : "Уже есть аккаунт?"}{' '}
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-white hover:underline ml-1"
          >
            {isLogin ? 'Регистрация' : 'Вход'}
          </button>
        </p>
      </div>
    </div>
  );
};