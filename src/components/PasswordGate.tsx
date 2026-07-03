import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const CORRECT_PASSWORD = 'C1997C';
const SESSION_KEY = 'caio_session_auth';
const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hora em milissegundos

function isSessionValid(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { expiry } = JSON.parse(raw);
    return Date.now() < expiry;
  } catch {
    return false;
  }
}

function saveSession() {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ expiry: Date.now() + SESSION_TTL_MS })
  );
}

interface PasswordGateProps {
  children: React.ReactNode;
}

export default function PasswordGate({ children }: PasswordGateProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSessionValid()) {
      setUnlocked(true);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!unlocked && ready) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [unlocked, ready]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input === CORRECT_PASSWORD) {
      saveSession();
      setError(false);
      setUnlocked(true);
    } else {
      setError(true);
      setShake(true);
      setInput('');
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setError(false), 2500);
    }
  };

  if (!ready) return null;

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      {/* Fundo com glow animado */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-tertiary/5 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-tertiary/5 blur-[80px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        {/* Card */}
        <motion.div
          animate={shake ? { x: [0, -10, 10, -10, 10, -6, 6, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-surface-container-high border border-outline-variant/20 rounded-[2rem] p-8 shadow-[0_32px_96px_rgba(0,0,0,0.8)] backdrop-blur-sm"
        >
          {/* Logo / Ícone */}
          <div className="flex flex-col items-center mb-8 gap-4">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
              <span className="text-2xl">🔐</span>
            </div>
            <div className="text-center">
              <h1 className="font-headline font-black text-2xl tracking-widest uppercase text-primary">
                CaioAD
              </h1>
              <p className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant mt-1 opacity-60">
                Acesso Restrito
              </p>
            </div>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                Senha de Acesso
              </label>
              <input
                ref={inputRef}
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className={`w-full bg-surface-container-highest border rounded-xl px-4 py-3 font-label text-sm text-primary placeholder:text-on-surface-variant/30 focus:outline-none transition-all duration-200 tracking-widest ${
                  error
                    ? 'border-error/60 bg-error/5 focus:border-error'
                    : 'border-outline-variant/20 focus:border-primary/50 focus:bg-surface-container'
                }`}
              />
              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="font-label text-[10px] uppercase tracking-wider text-error font-bold"
                  >
                    Senha incorreta. Tente novamente.
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              disabled={input.length === 0}
              className="w-full bg-primary text-on-primary py-3 rounded-xl font-label text-xs uppercase tracking-widest font-bold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-primary/10 mt-2"
            >
              Entrar
            </button>
          </form>
        </motion.div>

        {/* Rodapé */}
        <p className="text-center font-label text-[9px] uppercase tracking-widest text-on-surface-variant/30 mt-6">
          A sessão é válida por 1 hora após o acesso
        </p>
      </motion.div>
    </div>
  );
}
