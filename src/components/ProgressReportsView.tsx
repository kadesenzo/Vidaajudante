import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Dumbbell,
  Flame,
  Wallet,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const ProgressReportsView: React.FC = () => {
  const {
    tasks,
    studySessions,
    habits,
    workouts,
    finances,
    projects,
    goals,
    reviews
  } = useData();

  const [activeTab, setActiveTab] = useState<'day' | 'week' | 'progress'>('week');

  // Calculations
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const totalStudyMinutes = studySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  const totalIncome = finances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
  const totalExpense = finances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);

  const completedReviews = reviews.filter(r => r.status === 'completed');

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Consistência & Métricas Pessoais
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Relatórios & Meu Progresso
          </h1>
          <p className="text-sm text-white/60">
            Visão consolidada da sua semana e evolução real sem julgamentos
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#161619] p-1 rounded-2xl border border-white/5">
          {[
            { id: 'week', label: 'Sua Semana' },
            { id: 'day', label: 'Resumo Diário' },
            { id: 'progress', label: 'Evolução por Área' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === tab.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. WEEK VIEW */}
      {activeTab === 'week' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="ios-glass p-5 rounded-3xl border border-white/5 space-y-1">
              <span className="text-[11px] text-white/40 uppercase font-mono">Tempo Estudado</span>
              <div className="text-2xl font-bold text-white font-mono">
                {Math.floor(totalStudyMinutes / 60)}h {totalStudyMinutes % 60}m
              </div>
              <p className="text-[10px] text-white/40">{studySessions.length} sessões</p>
            </div>

            <div className="ios-glass p-5 rounded-3xl border border-white/5 space-y-1">
              <span className="text-[11px] text-white/40 uppercase font-mono">Tarefas Concluídas</span>
              <div className="text-2xl font-bold text-emerald-400 font-mono">
                {completedTasks.length}
              </div>
              <p className="text-[10px] text-white/40">{tasks.length} totais</p>
            </div>

            <div className="ios-glass p-5 rounded-3xl border border-white/5 space-y-1">
              <span className="text-[11px] text-white/40 uppercase font-mono">Treinos Realizados</span>
              <div className="text-2xl font-bold text-orange-400 font-mono">
                {workouts.length}
              </div>
              <p className="text-[10px] text-white/40">{totalWorkoutMinutes} min em movimento</p>
            </div>

            <div className="ios-glass p-5 rounded-3xl border border-white/5 space-y-1">
              <span className="text-[11px] text-white/40 uppercase font-mono">Revisões Fixadas</span>
              <div className="text-2xl font-bold text-purple-400 font-mono">
                {completedReviews.length}
              </div>
              <p className="text-[10px] text-white/40">{reviews.length} no radar</p>
            </div>
          </div>

          <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-3">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Movimentação de Projetos & Finanças
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-xs text-white/50">Projetos Ativos</span>
                <div className="text-xl font-bold text-white">{projects.length} iniciativas</div>
                <div className="space-y-1">
                  {projects.slice(0, 3).map(p => (
                    <div key={p.id} className="flex justify-between text-xs text-white/70">
                      <span className="truncate">{p.name}</span>
                      <span className="font-mono text-blue-400">{p.progressPercent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="text-xs text-white/50">Balanço Semanal</span>
                <div className="text-xl font-bold text-emerald-400 font-mono">
                  + R$ {(totalIncome - totalExpense).toFixed(2)}
                </div>
                <p className="text-xs text-white/60">
                  Entradas: R$ {totalIncome.toFixed(2)} | Saídas: R$ {totalExpense.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROGRESS BY AREA */}
      {activeTab === 'progress' && (
        <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-6">
          <h3 className="text-base font-bold text-white">Progresso Geral das Áreas</h3>

          <div className="space-y-5">
            {[
              { label: 'Estudos & Retenção', val: Math.min(100, studySessions.length * 20), color: 'from-blue-500 to-indigo-500' },
              { label: 'Execução de Tarefas', val: Math.min(100, Math.round((completedTasks.length / Math.max(1, tasks.length)) * 100)), color: 'from-emerald-500 to-teal-400' },
              { label: 'Atividade Física & Treino', val: Math.min(100, workouts.length * 25), color: 'from-orange-500 to-amber-500' },
              { label: 'Consistência de Hábitos', val: Math.min(100, habits.length * 20), color: 'from-pink-500 to-rose-500' },
              { label: 'Avanço de Metas', val: Math.min(100, goals.length > 0 ? 50 : 20), color: 'from-purple-500 to-indigo-500' },
            ].map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-white/80">{item.label}</span>
                  <span className="font-mono text-white/60">{item.val}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
                  <div
                    className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-700`}
                    style={{ width: `${item.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DAY VIEW */}
      {activeTab === 'day' && (
        <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-white">Fechamento do Dia Hoje</h3>
          <p className="text-xs text-white/60">
            Resumo consolidado das tarefas, estudos e rotinas marcadas nas últimas 24h.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-xs text-white/40 font-mono">Tarefas Feitas</span>
              <div className="text-xl font-bold text-white mt-1">{completedTasks.length} concluídas</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-xs text-white/40 font-mono">Sessões Gravadas</span>
              <div className="text-xl font-bold text-blue-400 mt-1">{studySessions.length} sessões</div>
            </div>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-xs text-white/40 font-mono">Treino Registrado</span>
              <div className="text-xl font-bold text-orange-400 mt-1">{workouts.length > 0 ? 'Concluído' : 'Descanso'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
