import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  TrendingUp,
  Trash2,
  Check
} from 'lucide-react';
import { useData } from '../context/DataContext';
import confetti from 'canvas-confetti';

interface GoalsViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const GoalsView: React.FC<GoalsViewProps> = ({ onOpenQuickCapture }) => {
  const { goals, addGoal, updateGoal, deleteGoal } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'pessoal' | 'estudos' | 'financeiro' | 'projetos' | 'hábitos' | 'saúde'>('financeiro');
  const [targetValue, setTargetValue] = useState(5000);
  const [currentValue, setCurrentValue] = useState(1000);
  const [unit, setUnit] = useState('R$');
  const [deadline, setDeadline] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addGoal({
      title: title.trim(),
      category,
      targetValue: Number(targetValue) || 100,
      currentValue: Number(currentValue) || 0,
      unit,
      deadline,
      status: 'in_progress',
      steps: [
        { id: '1', title: 'Definir plano de ação', completed: true },
        { id: '2', title: 'Atingir 50% do objetivo', completed: false },
        { id: '3', title: 'Finalizar e comemorar conquista', completed: false },
      ],
    });

    setTitle('');
    setShowAddModal(false);
  };

  const handleIncrement = (goalId: string, current: number, target: number, inc: number) => {
    const updated = Math.min(target, current + inc);
    const isFinished = updated >= target;
    updateGoal(goalId, {
      currentValue: updated,
      status: isFinished ? 'completed' : 'in_progress',
    });
    if (isFinished) {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#30D158', '#FFD60A', '#0A84FF'],
      });
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Visão de Futuro & Conquistas
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Metas & Objetivos
          </h1>
          <p className="text-sm text-white/60">
            Acompanhe a barra de progresso visual de cada grande marco pessoal
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova Meta
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.currentValue / Math.max(1, goal.targetValue)) * 100));
          const isDone = percent === 100;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-glass p-6 rounded-3xl border border-white/5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md font-semibold bg-emerald-500/20 text-emerald-300">
                    {goal.category}
                  </span>
                  {goal.deadline && (
                    <span className="text-xs text-white/40 font-mono">
                      Prazo: {goal.deadline}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-white">{goal.title}</h3>

                {/* Progress Bar & Indicators */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs text-white/60 font-mono">
                    <span>
                      {goal.unit} {goal.currentValue} de {goal.unit} {goal.targetValue}
                    </span>
                    <span className="font-bold text-emerald-400">{percent}%</span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden border border-white/5">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Steps Checklist */}
              {goal.steps && goal.steps.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-white/5">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Etapas</span>
                  {goal.steps.map(step => (
                    <div
                      key={step.id}
                      onClick={() => {
                        const newSteps = goal.steps.map(s => s.id === step.id ? { ...s, completed: !s.completed } : s);
                        updateGoal(goal.id, { steps: newSteps });
                      }}
                      className="flex items-center gap-2 text-xs text-white/70 cursor-pointer hover:text-white"
                    >
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${step.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-white/20'}`}>
                        {step.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className={step.completed ? 'line-through text-white/40' : ''}>{step.title}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Increment Action Button */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="p-1.5 text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {!isDone ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleIncrement(goal.id, goal.currentValue, goal.targetValue, Math.max(1, Math.round(goal.targetValue * 0.1)))}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all ios-press"
                    >
                      +10% Progresso
                    </button>
                    <button
                      onClick={() => handleIncrement(goal.id, goal.currentValue, goal.targetValue, goal.targetValue - goal.currentValue)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-md transition-all ios-press"
                    >
                      Concluir Meta
                    </button>
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Meta Atingida!
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}

        {goals.length === 0 && (
          <div className="col-span-full text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <Target className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhuma meta cadastrada ainda.</p>
            <p className="text-xs text-white/40 mt-1">Defina seus marcos financeiros, de estudos ou projetos.</p>
          </div>
        )}
      </div>

      {/* Modal Add Goal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#1c1c1f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Criar Nova Meta</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Qual é o seu objetivo?
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Comprar Notebook, Ler 12 livros, Guardar R$ 5.000..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Valor Alvo
                  </label>
                  <input
                    type="number"
                    required
                    value={targetValue}
                    onChange={(e) => setTargetValue(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Unidade
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Ex: R$, livros, horas..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Prazo Final
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                />
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 ios-press"
                >
                  Criar Meta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
