import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  BookOpen,
  Dumbbell,
  FolderKanban,
  Target,
  Sparkles
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const CalendarView: React.FC = () => {
  const { tasks, routines, studySessions, reviews, workouts, projects, goals } = useData();
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());

  // Generate calendar days for current month
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthName = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(currentMonthDate);

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  // Connected aggregates for the selected day
  const dayOfWeekSelected = new Date(selectedDate + 'T00:00:00').getDay();

  const dayTasks = tasks.filter(t => t.dueDate === selectedDate);
  const dayRoutines = routines.filter(r => r.daysOfWeek.includes(dayOfWeekSelected));
  const dayStudies = studySessions.filter(s => s.date === selectedDate);
  const dayReviews = reviews.filter(r => r.scheduledDate === selectedDate);
  const dayWorkouts = workouts.filter(w => w.date === selectedDate);

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
          Visão Temporal Integrada
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
          Calendário Geral
        </h1>
        <p className="text-sm text-white/60">
          Todas as suas tarefas, rotinas, revisões espaçadas e treinos conectados no mesmo fluxo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Month Calendar Matrix Card */}
        <div className="lg:col-span-7 ios-glass p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white capitalize">{monthName}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-white/40 uppercase">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="p-3" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              // Indicators
              const hasTask = tasks.some(t => t.dueDate === dateStr);
              const hasReview = reviews.some(r => r.scheduledDate === dateStr);
              const hasWorkout = workouts.some(w => w.date === dateStr);

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-2 sm:p-3 rounded-2xl flex flex-col items-center justify-between min-h-[58px] border transition-all ${
                    isSelected
                      ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                      : isToday
                      ? 'bg-white/10 border-blue-500/50 text-white'
                      : 'bg-black/20 border-white/5 text-white/70 hover:bg-white/5'
                  }`}
                >
                  <span className="text-xs font-mono font-semibold">{dayNum}</span>
                  <div className="flex gap-1 mt-1">
                    {hasTask && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    {hasReview && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                    {hasWorkout && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda View */}
        <div className="lg:col-span-5 ios-glass p-5 sm:p-6 rounded-3xl border border-white/5 space-y-4 flex flex-col">
          <div className="border-b border-white/5 pb-3">
            <span className="text-[10px] uppercase font-mono text-blue-400 font-semibold">
              Agenda do Dia
            </span>
            <h3 className="text-lg font-bold text-white capitalize">
              {new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(selectedDate + 'T00:00:00'))}
            </h3>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[460px] pr-1">
            {/* Reviews Scheduled */}
            {dayReviews.map(r => (
              <div key={r.id} className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{r.topic}</h4>
                    <p className="text-[10px] text-indigo-300">Revisão ({r.intervalDays}d) • {r.subjectName}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {r.status === 'completed' ? '✓ Feito' : 'Pendente'}
                </span>
              </div>
            ))}

            {/* Routine Blocks for this day */}
            {dayRoutines.map(rt => (
              <div key={rt.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-white/5 text-white/50">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{rt.title}</h4>
                    <p className="text-[10px] text-white/40">{rt.time} às {rt.endTime || 'fim'} • {rt.category}</p>
                  </div>
                </div>
                <span className="text-[10px] text-white/40 font-mono">Rotina</span>
              </div>
            ))}

            {/* Tasks for this day */}
            {dayTasks.map(t => (
              <div key={t.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold text-white ${t.status === 'completed' ? 'line-through opacity-50' : ''}`}>{t.title}</h4>
                    <p className="text-[10px] text-white/40">{t.category} • {t.priority}</p>
                  </div>
                </div>
                <span className="text-[10px] text-white/40 font-mono">Tarefa</span>
              </div>
            ))}

            {/* Workouts */}
            {dayWorkouts.map(w => (
              <div key={w.id} className="p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                    <Dumbbell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">{w.activity}</h4>
                    <p className="text-[10px] text-orange-300">{w.durationMinutes} min • {w.intensity}</p>
                  </div>
                </div>
                <span className="text-[10px] text-orange-400 font-mono">Treino</span>
              </div>
            ))}

            {dayReviews.length === 0 && dayRoutines.length === 0 && dayTasks.length === 0 && dayWorkouts.length === 0 && (
              <div className="text-center py-10 text-white/40 text-xs">
                Nenhum compromisso registrado para este dia.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
