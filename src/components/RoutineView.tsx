import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Plus,
  CheckCircle2,
  Calendar,
  AlertCircle,
  MoreVertical,
  Trash2,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Coffee,
  BookOpen,
  Dumbbell,
  Laptop
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { RoutineBlock } from '../types';
import confetti from 'canvas-confetti';

interface RoutineViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ onOpenQuickCapture }) => {
  const { routines, addRoutineBlock, updateRoutineBlock, deleteRoutineBlock } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDay()); // 0 = Dom, 1 = Seg...

  // Form State
  const [time, setTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Estudo');
  const [days, setDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const daysLabels = [
    { num: 0, label: 'Dom' },
    { num: 1, label: 'Seg' },
    { num: 2, label: 'Ter' },
    { num: 3, label: 'Qua' },
    { num: 4, label: 'Qui' },
    { num: 5, label: 'Sex' },
    { num: 6, label: 'Sáb' },
  ];

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addRoutineBlock({
      time,
      endTime,
      durationMinutes: 60,
      title: title.trim(),
      category,
      daysOfWeek: days,
      statusToday: 'pending',
    });

    setTitle('');
    setShowAddModal(false);
  };

  const handleToggleStatus = (block: RoutineBlock, status: 'completed' | 'skipped' | 'postponed') => {
    const newStatus = block.statusToday === status ? 'pending' : status;
    updateRoutineBlock(block.id, { statusToday: newStatus });
    if (newStatus === 'completed') {
      confetti({
        particleCount: 25,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#30D158', '#0A84FF'],
      });
    }
  };

  // Filter routines by selected day
  const filteredRoutines = routines.filter(r => r.daysOfWeek.includes(selectedDay));

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
            Ritmo & Blocos de Tempo
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Rotina Diária Inteligente
          </h1>
          <p className="text-sm text-white/60">
            Acompanhe horários sem rigidez punitiva: conclua, pule ou remarque quando precisar
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Bloco de Rotina
        </button>
      </div>

      {/* Weekday Selector Pills (Apple Style) */}
      <div className="flex items-center justify-between bg-[#161619] p-1.5 rounded-2xl border border-white/5 overflow-x-auto">
        {daysLabels.map(d => {
          const isSelected = selectedDay === d.num;
          return (
            <button
              key={d.num}
              onClick={() => setSelectedDay(d.num)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Timeline List */}
      <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-7 sm:before:left-8 before:w-0.5 before:bg-white/5">
        <AnimatePresence>
          {filteredRoutines.map((block) => {
            const isDone = block.statusToday === 'completed';
            const isSkipped = block.statusToday === 'skipped';
            const isPostponed = block.statusToday === 'postponed';

            return (
              <motion.div
                key={block.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative flex items-start gap-4 p-4 sm:p-5 rounded-3xl border transition-all ${
                  isDone
                    ? 'bg-[#18181c]/50 border-emerald-500/20 text-white/50'
                    : isSkipped
                    ? 'bg-[#18181c]/40 border-white/5 opacity-50'
                    : 'ios-glass border-white/10 hover:border-white/20'
                }`}
              >
                {/* Time Indicator Node */}
                <div className="flex flex-col items-center min-w-[55px] z-10">
                  <span className="text-xs font-bold font-mono text-white/90">{block.time}</span>
                  {block.endTime && (
                    <span className="text-[10px] font-mono text-white/40">{block.endTime}</span>
                  )}
                  <div className={`w-3.5 h-3.5 rounded-full mt-2 border-2 transition-all ${
                    isDone ? 'bg-emerald-500 border-emerald-400' :
                    isSkipped ? 'bg-zinc-600 border-zinc-500' :
                    isPostponed ? 'bg-amber-500 border-amber-400' :
                    'bg-blue-500 border-blue-400'
                  }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/5 text-blue-400 font-medium">
                      {block.category}
                    </span>
                    {isDone && (
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Realizado
                      </span>
                    )}
                    {isSkipped && (
                      <span className="text-[10px] text-white/40 font-semibold">Pulado hoje</span>
                    )}
                    {isPostponed && (
                      <span className="text-[10px] text-amber-400 font-semibold">Adiado para mais tarde</span>
                    )}
                  </div>

                  <h3 className={`text-base font-semibold text-white truncate ${isDone ? 'line-through text-white/40' : ''}`}>
                    {block.title}
                  </h3>
                </div>

                {/* Flexible Intelligent Actions */}
                <div className="flex items-center gap-1.5 self-center">
                  <button
                    onClick={() => handleToggleStatus(block, 'completed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-white/60'
                    }`}
                  >
                    {isDone ? '✓ Feito' : 'Concluir'}
                  </button>

                  {!isDone && (
                    <>
                      <button
                        onClick={() => handleToggleStatus(block, 'postponed')}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isPostponed
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-white/5 hover:bg-white/10 text-white/50'
                        }`}
                        title="Adiar para mais tarde"
                      >
                        Adiar
                      </button>
                      <button
                        onClick={() => handleToggleStatus(block, 'skipped')}
                        className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 text-xs font-medium"
                        title="Pular sem culpa"
                      >
                        Pular
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => deleteRoutineBlock(block.id)}
                    className="p-1.5 text-white/20 hover:text-red-400 transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredRoutines.length === 0 && (
          <div className="text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <Clock className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhum bloco de rotina agendado para este dia.</p>
            <p className="text-xs text-white/40 mt-1">Toque em "Novo Bloco de Rotina" para começar.</p>
          </div>
        )}
      </div>

      {/* Modal Add Routine Block */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#1c1c1f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Criar Bloco de Rotina</h3>
            <form onSubmit={handleCreateBlock} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Atividade
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Bloco de Estudos, Treino, Programação..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Horário Início
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Horário Fim
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Estudo', 'Trabalho', 'Treino', 'Refeição', 'Saúde', 'Pessoal'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCategory(c)}
                      className={`p-2 rounded-xl text-xs font-medium border ${
                        category === c ? 'bg-blue-600/20 border-blue-500 text-blue-300' : 'bg-black/30 border-white/5 text-white/60'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1.5">
                  Dias da Semana
                </label>
                <div className="flex gap-1.5">
                  {daysLabels.map(d => {
                    const isSelected = days.includes(d.num);
                    return (
                      <button
                        key={d.num}
                        type="button"
                        onClick={() => {
                          setDays(prev => prev.includes(d.num) ? prev.filter(x => x !== d.num) : [...prev, d.num]);
                        }}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          isSelected ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/40 border-white/5 text-white/40'
                        }`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 ios-press"
                >
                  Salvar Bloco
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
