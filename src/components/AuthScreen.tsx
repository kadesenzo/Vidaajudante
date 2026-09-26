import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Mail,
  User as UserIcon,
  Smartphone,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_APP_CONFIG } from '../config/appConfig';
import { LifeOsLogo } from './LifeOsLogo';

export const AuthScreen: React.FC = () => {
  const {
    loginEmail,
    signupEmail,
    signInWithGoogle,
    signInGuest,
    lastAccount,
    autoLoginEnabled,
    clearDeviceMemory
  } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(() => lastAccount?.email || '');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If last account email exists and field is empty, prefill
  useEffect(() => {
    if (lastAccount?.email && !email) {
      setEmail(lastAccount.email);
    }
  }, [lastAccount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!name.trim()) throw new Error('Por favor, informe seu nome.');
        await signupEmail(email.trim(), password, name.trim(), rememberDevice);
      } else {
        await loginEmail(email.trim(), password, rememberDevice);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Este e-mail já está cadastrado. Faça login.');
      } else if (err.code === 'auth/weak-password') {
        setError('A senha deve ter no mínimo 6 caracteres.');
      } else {
        setError(err.message || 'Erro ao autenticar. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle(rememberDevice);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao autenticar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInGuest(rememberDevice);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao iniciar sessão local.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseAnotherAccount = () => {
    setEmail('');
    setPassword('');
    clearDeviceMemory();
  };

  return (
    <div className="min-h-screen bg-[#000000] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* iOS Fluid Glow Background Spheres */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Official Life OS Logo & Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-2">
            <LifeOsLogo variant="icon" size="xl" />
          </div>
          <div className="flex items-center text-3xl font-bold tracking-tight text-white mt-1">
            <span>Life</span>
            <span className="bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent ml-1.5">
              OS
            </span>
          </div>
          <p className="text-[11px] uppercase tracking-[0.25em] font-semibold text-white/50 mt-1">
            Sua Vida, Organizada
          </p>
        </div>

        {/* Known Account Quick Badge (if previously logged in on this device) */}
        {lastAccount && !isSignUp && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3.5 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-between gap-3 shadow-lg"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {lastAccount.preferredName?.charAt(0) || lastAccount.displayName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-mono tracking-wider text-blue-400 font-bold block">
                  Conta deste Dispositivo
                </span>
                <p className="text-xs font-semibold text-white truncate">
                  {lastAccount.preferredName || lastAccount.displayName || 'Usuário'}
                </p>
                <p className="text-[11px] text-white/50 truncate font-mono">
                  {lastAccount.email || 'Sessão Conectada'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleUseAnotherAccount}
              className="text-[10px] text-white/50 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors whitespace-nowrap cursor-pointer"
            >
              Trocar
            </button>
          </motion.div>
        )}

        {/* Glass Card Container */}
        <div className="ios-glass rounded-[28px] p-7 shadow-2xl border border-white/10 backdrop-blur-3xl">
          <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/5">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                !isSignUp ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                isSignUp ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1 font-medium">
                  Seu Nome
                </label>
                <div className="relative flex items-center">
                  <UserIcon className="w-4 h-4 text-white/40 absolute left-4 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como quer ser chamado?"
                    className="w-full bg-[#141416] border border-white/10 focus:border-blue-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1 font-medium">
                E-mail
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-white/40 absolute left-4 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#141416] border border-white/10 focus:border-blue-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1 font-medium">
                Senha
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-white/40 absolute left-4 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141416] border border-white/10 focus:border-blue-500 rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 transition-all"
                />
              </div>
            </div>

            {/* Permanent Auto-Login Guarantee Checkbox */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-blue-500/40 transition-colors">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-blue-500 rounded cursor-pointer flex-shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                    Entrar automaticamente sempre neste aparelho
                  </span>
                  <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                    Você não precisará digitar sua senha novamente ao abrir o LIFE OS.
                  </p>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Criar Conta & Ficar Conectado' : 'Acessar & Lembrar Conta'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6 flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#1C1C1E] px-3 text-[11px] text-white/40 uppercase tracking-widest absolute">
              ou
            </span>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogle}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition-all flex items-center justify-center gap-2.5 ios-press cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar com Google
            </button>

            <button
              type="button"
              onClick={handleGuest}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all flex items-center justify-center gap-2 ios-press cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Experimentar Instantaneamente (Anônimo)
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/30 mt-6 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-white/40" />
          Sessão segura e persistente gravada no dispositivo
        </p>
      </motion.div>
    </div>
  );
};
