import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Compass,
  Clock,
  Target,
  Brain,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEFAULT_APP_CONFIG } from '../config/appConfig';
import { LifeOsLogo } from './LifeOsLogo';

interface OnboardingQuizProps {
  onComplete: () => void;
}

const GOALS_LIST = [
  { id: 'Estudos', label: '📚 Estudos e Aprendizado', color: '#0A84FF' },
  { id: 'Programação', label: '💻 Programação & Código', color: '#5E5CE6' },
  { id: 'Inglês', label: '🇬🇧 Idiomas / Inglês', color: '#BF5AF2' },
  { id: 'Exercícios', label: '🏃 Treinos & Saúde', color: '#30D158' },
  { id: 'Organização', label: '🎯 Organização Diária', color: '#64D2FF' },
  { id: 'Finanças', label: '💰 Controle Financeiro', color: '#30D158' },
  { id: 'Empreendedorismo', label: '🚀 Projetos & Negócios', color: '#FF9F0A' },
  { id: 'Hábitos', label: '🔥 Consistência de Hábitos', color: '#FF453A' },
  { id: 'Produtividade', label: '⚡ Foco & Execução', color: '#FFD60A' },
];

const FORGET_REASONS = [
  { id: 'esqueço rapidamente', label: 'Minha mente apaga detalhes rápido', icon: '🧠' },
  { id: 'muitas coisas simultâneas', label: 'Tenho muitas coisas acontecendo ao mesmo tempo', icon: '🌪️' },
  { id: 'não sei por onde começar', label: 'Sinto paralisia ao não saber por onde começar', icon: '🧭' },
  { id: 'começo e não termino', label: 'Costumo começar tarefas e perder tração no meio', icon: '⏳' },
  { id: 'falta de rotina', label: 'Minha rotina ainda oscila muito sem horários fixos', icon: '📅' },
];

export const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onComplete }) => {
  const { profile, updateUserProfile } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>(profile?.preferredName || profile?.displayName || '');
  const [wakeTime, setWakeTime] = useState<string>(profile?.wakeTime || '07:00');
  const [sleepTime, setSleepTime] = useState<string>(profile?.sleepTime || '23:00');
  const [studiesActive, setStudiesActive] = useState<boolean>(profile?.studiesActive ?? true);
  const [worksActive, setWorksActive] = useState<boolean>(profile?.worksActive ?? true);
  const [hasProjects, setHasProjects] = useState<boolean>(profile?.hasProjects ?? true);
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile?.mainGoals || ['Estudos', 'Organização', 'Produtividade']);
  const [forgetReason, setForgetReason] = useState<string>(profile?.forgetfulnessReason || 'muitas coisas simultâneas');
  const [currency, setCurrency] = useState<string>(profile?.currency || 'BRL');
  const [saving, setSaving] = useState<boolean>(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId) ? prev.filter(g => g !== goalId) : [...prev, goalId]
    );
  };

  const handleFinish = async () => {
    setSaving(true);
    await updateUserProfile({
      preferredName: name.trim() || 'Você',
      wakeTime,
      sleepTime,
      studiesActive,
      worksActive,
      hasProjects,
      mainGoals: selectedGoals,
      forgetfulnessReason: forgetReason,
      currency,
      onboardingCompleted: true,
    });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 sm:p-10 max-w-xl mx-auto selection:bg-blue-500/30">
      {/* Top Header iOS 26 Pill */}
      <div className="flex items-center justify-between pt-2">
        <LifeOsLogo variant="header" size="xs" showSubtitle={false} />
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-medium text-white/70">
          Etapa {step} de 4
        </div>
      </div>

      {/* Dynamic Slide Questions */}
      <div className="my-auto py-8">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">Identidade</span>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
                  Como você quer ser chamado?
                </h1>
                <p className="text-white/60 text-sm mt-2">
                  Seu LIFE OS adapta todas as notificações e saudações a você.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5 font-medium">
                    Seu Nome ou Apelido
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Enzo, Kaen, Alex..."
                    className="w-full bg-[#1C1C1E] border border-white/10 focus:border-blue-500 rounded-2xl px-5 py-4 text-lg text-white outline-none placeholder:text-white/30 transition-all shadow-inner"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-xs text-white/50 uppercase tracking-wider block mb-1.5 font-medium">
                    Moeda Principal
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { code: 'BRL', symbol: 'R$ (Real)' },
                      { code: 'USD', symbol: '$ (Dólar)' },
                      { code: 'EUR', symbol: '€ (Euro)' },
                    ].map(c => (
                      <button
                        type="button"
                        key={c.code}
                        onClick={() => setCurrency(c.code)}
                        className={`p-3.5 rounded-xl border text-sm font-medium transition-all text-center ${
                          currency === c.code
                            ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                            : 'bg-[#1C1C1E] border-white/5 text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {c.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">Rotina & Ritmo</span>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
                  Como é seu dia a dia?
                </h1>
                <p className="text-white/60 text-sm mt-2">
                  Usamos esses horários para calcular o seu bloco "Agora" e não sobrecarregar sua noite.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1C1C1E] border border-white/10 p-4 rounded-2xl">
                  <span className="text-xs text-white/50 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-blue-400" /> Normalmente acorda
                  </span>
                  <input
                    type="time"
                    value={wakeTime}
                    onChange={(e) => setWakeTime(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-lg w-full outline-none"
                  />
                </div>
                <div className="bg-[#1C1C1E] border border-white/10 p-4 rounded-2xl">
                  <span className="text-xs text-white/50 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" /> Costuma dormir
                  </span>
                  <input
                    type="time"
                    value={sleepTime}
                    onChange={(e) => setSleepTime(e.target.value)}
                    className="bg-black/50 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-lg w-full outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <span className="text-xs uppercase tracking-wider text-white/50 font-medium">Atividades Atuais</span>
                {[
                  { label: 'Sou estudante (Escola, Faculdade, Cursos ou Concurso)', active: studiesActive, toggle: () => setStudiesActive(!studiesActive) },
                  { label: 'Trabalho ou presto serviços profissionais', active: worksActive, toggle: () => setWorksActive(!worksActive) },
                  { label: 'Possuo projetos pessoais ou empreendimentos paralelos', active: hasProjects, toggle: () => setHasProjects(!hasProjects) },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={item.toggle}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      item.active
                        ? 'bg-blue-500/10 border-blue-500/40 text-white'
                        : 'bg-[#1C1C1E] border-white/5 text-white/60 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-sm font-medium pr-4">{item.label}</span>
                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${item.active ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/20'}`}>
                      {item.active && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Foco Atual</span>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
                  Quais são suas prioridades?
                </h1>
                <p className="text-white/60 text-sm mt-2">
                  Escolha quantos desejar. O LIFE OS ativará widgets relevantes para cada um.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                {GOALS_LIST.map((g) => {
                  const isSelected = selectedGoals.includes(g.id);
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => toggleGoal(g.id)}
                      className={`p-3.5 rounded-xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                          : 'bg-[#1C1C1E] border-white/5 text-white/70 hover:bg-white/5'
                      }`}
                    >
                      <span>{g.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="space-y-6"
            >
              <div>
                <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Segundo Cérebro</span>
                <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mt-1">
                  O que mais costuma te atrapalhar?
                </h1>
                <p className="text-white/60 text-sm mt-2">
                  Adaptamos a interface para diminuir essa fricção no seu fluxo diário.
                </p>
              </div>

              <div className="space-y-3">
                {FORGET_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    type="button"
                    onClick={() => setForgetReason(reason.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      forgetReason === reason.id
                        ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border-blue-500 text-white shadow-md shadow-blue-500/10'
                        : 'bg-[#1C1C1E] border-white/5 text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{reason.icon}</span>
                      <span className="text-sm font-medium">{reason.label}</span>
                    </div>
                    {forgetReason === reason.id && (
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons Footer */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Voltar
          </button>
        ) : (
          <div />
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/30 ios-press"
          >
            Continuar <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all shadow-lg shadow-blue-600/40 ios-press disabled:opacity-50"
          >
            {saving ? 'Configurando...' : 'Entrar no LIFE OS'} <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
