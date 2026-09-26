import React from 'react';
import { motion } from 'motion/react';
import { Flame, Plus, Check, Trophy, Calendar, Sparkles } from 'lucide-react';
import { useData } from '../context/DataContext';
import confetti from 'canvas-confetti';

interface HabitsViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const HabitsView: React.FC<HabitsViewProps> = ({ onOpenQuickCapture }) => {
  const { habits, toggleHabitDay } = useData();

  // Last 7 days dates array
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLetter = new Intl.DateTimeFormat('pt-BR', { weekday: 'narrow' }).format(d);
    const dayNumber = d.getDate();
    return { dateStr, dayLetter, dayNumber, isToday: i === 6 };
  });

  const handleDayClick = (habitId: string, dateStr: string) => {
    toggleHabitDay(habitId, dateStr);
    confetti({
      particleCount: 15,
      spread: 40,
      origin: { y: 0.8 },
      colors: ['#FF9F0A', '#FF453A'],
    });
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-orange-400 font-semibold">
            Consistência & Rotina
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Hábitos & Streaks
          </h1>
          <p className="text-sm text-white/60">
            Acompanhe o ritmo diário sem quebrar as sequências
          </p>
        </div>

        <button
          onClick={() => onOpenQuickCapture('habit')}
          className="px-5 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Hábito
        </button>
      </div>

      {/* Habits List */}
      <div className="space-y-3">
        {habits.map(habit => {
          return (
            <motion.div
              key={habit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-glass p-5 rounded-2xl border border-white/5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{habit.name}</h3>
                    <p className="text-xs text-white/40">{habit.category || 'Geral'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <div className="px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono font-bold flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{habit.currentStreak || 0} dias</span>
                  </div>
                </div>
              </div>

              {/* 7-Days Visualizer Matrix */}
              <div className="pt-2 border-t border-white/5">
                <div className="text-[11px] text-white/40 mb-2 flex items-center justify-between">
                  <span>Últimos 7 dias</span>
                  <span className="font-mono text-white/50">Melhor streak: {habit.bestStreak || 0}d</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {last7Days.map(day => {
                    const isCompleted = !!habit.history[day.dateStr];
                    return (
                      <button
                        key={day.dateStr}
                        onClick={() => handleDayClick(habit.id, day.dateStr)}
                        className={`flex flex-col items-center py-2 px-1 rounded-xl border transition-all ${
                          isCompleted
                            ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                            : 'bg-black/30 border-white/5 text-white/40 hover:bg-white/5'
                        } ${day.isToday ? 'ring-1 ring-blue-400/50' : ''}`}
                      >
                        <span className="text-[10px] uppercase font-bold">{day.dayLetter}</span>
                        <span className="text-xs font-mono my-0.5">{day.dayNumber}</span>
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center mt-1 ${
                          isCompleted ? 'bg-orange-500 text-black' : 'border border-white/20'
                        }`}>
                          {isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}

        {habits.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-white/5 border border-white/5">
            <Flame className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhum hábito cadastrado ainda.</p>
            <p className="text-xs text-white/40 mt-1">
              Comece com 1 ou 2 pequenos hábitos diários (beber água, ler 10min, caminhar).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
