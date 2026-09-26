import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  CheckCircle2,
  Clock,
  Flame,
  BookOpen,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Zap,
  Calendar,
  AlertCircle,
  FolderKanban,
  Target,
  Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import confetti from 'canvas-confetti';

interface DashboardViewProps {
  onOpenQuickCapture: (tab?: any) => void;
  onNavigateToTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenQuickCapture,
  onNavigateToTab,
}) => {
  const { profile } = useAuth();
  const {
    tasks,
    toggleTaskCompleted,
    subjects,
    studySessions,
    reviews,
    habits,
    routines,
    projects,
    goals,
    finances,
    sales,
    memoryNotes,
    workouts,
    seedSampleDataIfEmpty
  } = useData();

  // Date and Time in Portuguese
  const todayStr = new Date().toISOString().split('T')[0];
  const nowHour = new Date().getHours();
  const dayOfWeekToday = new Date().getDay();

  let greeting = 'Bom dia';
  if (nowHour >= 12 && nowHour < 18) greeting = 'Boa tarde';
  if (nowHour >= 18 || nowHour < 5) greeting = 'Boa noite';

  const preferredName = profile?.preferredName || profile?.displayName || 'Você';

  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());

  // Tasks & Next Action
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasksToday = tasks.filter(t => t.status === 'completed');

  const nextAction =
    pendingTasks.find(t => t.isNextAction) ||
    pendingTasks.find(t => t.priority === 'urgent') ||
    pendingTasks[0];

  const totalTasksToday = Math.max(1, tasks.length);
  const completionPercent = Math.min(100, Math.round((completedTasksToday.length / totalTasksToday) * 100));

  // Today routine blocks
  const todayRoutines = routines.filter(r => r.daysOfWeek.includes(dayOfWeekToday));

  // Today reviews
  const todayReviews = reviews.filter(r => r.scheduledDate <= todayStr && r.status !== 'completed');

  // Today finances
  const todayIncome = finances
    .filter(f => f.type === 'income' && f.date === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleCompleteNextAction = async () => {
    if (!nextAction) return;
    await toggleTaskCompleted(nextAction);
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#30D158', '#0A84FF', '#BF5AF2'],
    });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Top Greeting Pill Banner (iOS 26 Style) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-white/50 font-medium capitalize">
              {formattedDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {greeting}, <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">{preferredName}</span>.
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-0.5">
            Vamos organizar o seu foco de hoje com clareza total.
          </p>
        </div>

        {tasks.length === 0 && routines.length === 0 && (
          <button
            onClick={() => seedSampleDataIfEmpty()}
            className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 text-xs text-blue-300 font-medium border border-blue-500/30 flex items-center gap-2 ios-press"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Carregar Exemplo Inicial
          </button>
        )}
      </motion.div>

      {/* 1. AGORA: PRÓXIMA AÇÃO (HERO CARD iOS) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1c1c24] via-[#16161a] to-[#0e0e11] border border-blue-500/20 p-6 sm:p-7 shadow-2xl shadow-blue-950/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[11px] font-semibold tracking-wider uppercase">
                <Zap className="w-3 h-3 text-blue-400" /> Próxima Ação
              </span>
              {nextAction?.estimatedMinutes && (
                <span className="text-xs text-white/50 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-white/40" />
                  {nextAction.estimatedMinutes} min
                </span>
              )}
            </div>

            {nextAction ? (
              <>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
                  {nextAction.title}
                </h2>
                {nextAction.description && (
                  <p className="text-sm text-white/70 line-clamp-2">
                    {nextAction.description}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1 text-xs text-white/50">
                  <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                    {nextAction.category}
                  </span>
                  <span>•</span>
                  <span>Prioridade: <strong className="text-amber-400 font-medium capitalize">{nextAction.priority}</strong></span>
                </div>
              </>
            ) : (
              <div className="py-2">
                <h2 className="text-xl font-semibold text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6" /> Tudo em dia por aqui!
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Nenhuma tarefa pendente no momento. Adicione uma nova ação ou descanse.
                </p>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          {nextAction && (
            <div className="flex flex-row md:flex-col items-center gap-2.5 min-w-[190px]">
              <button
                onClick={handleCompleteNextAction}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 ios-press cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Concluir Ação
              </button>
              <button
                onClick={() => onOpenQuickCapture('study')}
                className="w-full py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-medium transition-all flex items-center justify-center gap-2 ios-press"
              >
                <Play className="w-3.5 h-3.5 text-blue-400" />
                Modo Foco 25m
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* 2. HOJE: RESUMO DO DIA */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Resumo do Dia no LIFE OS
          </h3>
          <span className="text-xs text-blue-400 font-mono">
            {completionPercent}% concluído hoje
          </span>
        </div>

        {/* Progress Bar iOS Fluid */}
        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 rounded-full"
          />
        </div>

        {/* Bento Grid Widget Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {/* Tarefas */}
          <div
            onClick={() => onNavigateToTab('tasks')}
            className="ios-glass p-4 rounded-2xl cursor-pointer hover:border-emerald-500/40 transition-all group ios-press"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4" />
              </span>
              <span className="text-xs text-white/40 font-mono">Tarefas</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {pendingTasks.length} <span className="text-xs font-normal text-white/40">pendentes</span>
            </div>
            <div className="text-[11px] text-white/50 mt-0.5 truncate">
              {completedTasksToday.length} concluídas hoje
            </div>
          </div>

          {/* Rotina */}
          <div
            onClick={() => onNavigateToTab('routine')}
            className="ios-glass p-4 rounded-2xl cursor-pointer hover:border-blue-500/40 transition-all group ios-press"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4" />
              </span>
              <span className="text-xs text-white/40 font-mono">Rotina</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {todayRoutines.length}
            </div>
            <div className="text-[11px] text-white/50 mt-0.5 truncate">
              blocos agendados hoje
            </div>
          </div>

          {/* Revisões */}
          <div
            onClick={() => onNavigateToTab('reviews')}
            className="ios-glass p-4 rounded-2xl cursor-pointer hover:border-purple-500/40 transition-all group ios-press"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-4 h-4" />
              </span>
              <span className="text-xs text-white/40 font-mono">Revisões</span>
            </div>
            <div className="text-2xl font-bold text-purple-300 font-mono">
              {todayReviews.length}
            </div>
            <div className="text-[11px] text-white/50 mt-0.5 truncate">
              para fixar hoje
            </div>
          </div>

          {/* Hábitos */}
          <div
            onClick={() => onNavigateToTab('habits')}
            className="ios-glass p-4 rounded-2xl cursor-pointer hover:border-orange-500/40 transition-all group ios-press"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="p-2 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </span>
              <span className="text-xs text-white/40 font-mono">Hábitos</span>
            </div>
            <div className="text-2xl font-bold text-white font-mono">
              {habits.filter(h => h.history[todayStr]).length}/{habits.length || 0}
            </div>
            <div className="text-[11px] text-white/50 mt-0.5 truncate">
              Sequência ativa hoje
            </div>
          </div>
        </div>
      </div>

      {/* 3. ROTINA DE HOJE SNIPPET */}
      {todayRoutines.length > 0 && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
              Blocos de Rotina Hoje
            </h3>
            <button
              onClick={() => onNavigateToTab('routine')}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Ver linha do tempo
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {todayRoutines.slice(0, 3).map(rt => (
              <div
                key={rt.id}
                onClick={() => onNavigateToTab('routine')}
                className="ios-glass p-3.5 rounded-2xl border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/15"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-blue-400 font-semibold">{rt.time}</span>
                  <h4 className="text-xs font-bold text-white truncate">{rt.title}</h4>
                </div>
                <span className="text-[10px] text-white/40">{rt.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. EXECUÇÃO RÁPIDA: TAREFAS */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Fila de Execução ({pendingTasks.length})
          </h3>
          <button
            onClick={() => onOpenQuickCapture('task')}
            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Nova Tarefa
          </button>
        </div>

        <div className="space-y-2">
          {pendingTasks.slice(0, 4).map((task) => (
            <div
              key={task.id}
              className="ios-glass p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 border border-white/5 hover:border-white/10 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={() => toggleTaskCompleted(task)}
                  className="w-5 h-5 rounded-full border border-white/30 flex items-center justify-center hover:border-emerald-400 hover:bg-emerald-500/20 transition-all flex-shrink-0 cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-emerald-400 transition-colors" />
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-blue-300 transition-colors">
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                    <span className="px-1.5 py-0.2 rounded bg-white/5 text-white/60">
                      {task.category}
                    </span>
                    {task.estimatedMinutes && <span>• {task.estimatedMinutes}m</span>}
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-medium uppercase ${
                task.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                task.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                'bg-white/5 text-white/50'
              }`}>
                {task.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
