import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  CheckCircle2,
  GraduationCap,
  Flame,
  Sparkles,
  Wallet,
  Dumbbell,
  FolderKanban,
  Target,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Utensils,
  AlarmClock
} from 'lucide-react';
import { useData } from '../context/DataContext';
import confetti from 'canvas-confetti';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'task' | 'reminder' | 'study' | 'habit' | 'memory' | 'finance' | 'workout' | 'project' | 'goal' | 'routine';
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'task',
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const {
    addTask,
    addReminder,
    addStudySession,
    addHabit,
    addMemoryNote,
    addTransaction,
    addWorkout,
    addProject,
    addGoal,
    addRoutineBlock,
    subjects,
    projects
  } = useData();

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [amount, setAmount] = useState('');
  const [txType, setTxType] = useState<'income' | 'expense'>('expense');
  const [subjectId, setSubjectId] = useState('');
  const [difficulty, setDifficulty] = useState<'fácil' | 'médio' | 'difícil'>('médio');
  const [activity, setActivity] = useState('Musculação');
  const [time, setTime] = useState('09:00');
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('');
    setAmount('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && activeTab !== 'workout' && activeTab !== 'finance') return;
    setSaving(true);
    const todayStr = new Date().toISOString().split('T')[0];

    try {
      if (activeTab === 'task') {
        await addTask({
          title,
          description,
          priority,
          status: 'todo',
          category: category || 'Geral',
          dueDate: todayStr,
          estimatedMinutes: Number(estimatedMinutes) || 30,
          isNextAction: false,
        });
      } else if (activeTab === 'reminder') {
        await addReminder({
          title,
          description,
          date: todayStr,
          time: time || '16:00',
          leadMinutes: 10,
          recurrence: 'none',
          category: (category as any) || 'Geral',
          priority: 'high',
          isAlarm: true,
          enabled: true,
          notificationEnabled: true,
          completed: false,
        });
      } else if (activeTab === 'study') {
        const foundSub = subjects.find(s => s.id === subjectId) || subjects[0];
        await addStudySession({
          subjectId: foundSub?.id || 'default',
          subjectName: foundSub?.name || 'Geral',
          topic: title,
          durationMinutes: Number(estimatedMinutes) || 30,
          date: todayStr,
          difficulty,
          masteryLevel: 3,
          notes: description,
        });
      } else if (activeTab === 'habit') {
        await addHabit({
          name: title,
          frequency: 'daily',
          targetPerDay: 1,
          category: category || 'Rotina',
          color: '#0A84FF',
        });
      } else if (activeTab === 'memory') {
        await addMemoryNote({
          title: title || 'Nota rápida',
          content: description || title,
          category: (category as any) || 'IDEIA',
          isPinned: false,
        });
      } else if (activeTab === 'finance') {
        await addTransaction({
          type: txType,
          amount: parseFloat(amount) || 0,
          category: category || 'Geral',
          description: title || 'Lançamento avulso',
          date: todayStr,
        });
      } else if (activeTab === 'workout') {
        await addWorkout({
          activity: activity || title || 'Treino',
          durationMinutes: Number(estimatedMinutes) || 45,
          intensity: 'moderado',
          notes: description,
          date: todayStr,
        });
      } else if (activeTab === 'project') {
        await addProject({
          name: title,
          description,
          status: 'active',
          progressPercent: 0,
          budget: parseFloat(amount) || 0,
        });
      } else if (activeTab === 'goal') {
        await addGoal({
          title,
          category: 'pessoal',
          targetValue: parseFloat(amount) || 100,
          currentValue: 0,
          unit: 'R$',
          status: 'in_progress',
          steps: [{ id: '1', title: 'Iniciar planejamento', completed: false }],
        });
      } else if (activeTab === 'routine') {
        await addRoutineBlock({
          time: time || '09:00',
          title,
          durationMinutes: Number(estimatedMinutes) || 60,
          category: category || 'Geral',
          daysOfWeek: [1, 2, 3, 4, 5],
          statusToday: 'pending',
        });
      }

      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.8 },
        colors: ['#0A84FF', '#30D158', '#5E5CE6'],
      });

      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal / Sheet Container */}
        <motion.div
          initial={{ y: '100%', opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="relative w-full max-w-lg bg-[#18181b] border border-white/10 rounded-t-[32px] sm:rounded-[28px] overflow-hidden shadow-2xl z-10 max-h-[90vh] flex flex-col"
        >
          {/* iOS Drawer Grabber Handle */}
          <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                Captura Rápida
              </span>
              <h2 className="text-lg font-semibold text-white">Adicionar ao LIFE OS</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all ios-press"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Segmented Category Picker (Apple iOS Style) */}
          <div className="px-6 pt-4 pb-2">
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-1 p-1 bg-black/40 rounded-2xl border border-white/5">
              {[
                { id: 'task', label: 'Tarefa', icon: CheckCircle2 },
                { id: 'reminder', label: 'Lembrete', icon: AlarmClock },
                { id: 'study', label: 'Estudo', icon: GraduationCap },
                { id: 'habit', label: 'Hábito', icon: Flame },
                { id: 'routine', label: 'Rotina', icon: Clock },
                { id: 'memory', label: 'Nota', icon: Sparkles },
                { id: 'finance', label: 'Dinheiro', icon: Wallet },
                { id: 'project', label: 'Projeto', icon: FolderKanban },
                { id: 'goal', label: 'Meta', icon: Target },
              ].map(item => {
                const Icon = item.icon;
                const active = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                      active
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-[10px] font-medium leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dynamic Form */}
          <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
            {activeTab === 'finance' ? (
              <div className="space-y-4">
                <div className="flex bg-white/5 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setTxType('expense')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                      txType === 'expense' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'text-white/50'
                    }`}
                  >
                    Saída / Gasto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTxType('income')}
                    className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                      txType === 'income' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-white/50'
                    }`}
                  >
                    Entrada / Receita
                  </button>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Valor (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0,00"
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-2xl font-mono text-white outline-none"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Descrição
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Almoço, Curso, Cliente X..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    {activeTab === 'task' ? 'O que precisa ser feito?' :
                     activeTab === 'reminder' ? 'Do que você precisa ser lembrado?' :
                     activeTab === 'study' ? 'Assunto / Tópico de Estudo' :
                     activeTab === 'habit' ? 'Qual hábito deseja construir?' :
                     activeTab === 'routine' ? 'Atividade da Rotina' :
                     activeTab === 'goal' ? 'Qual meta deseja alcançar?' :
                     activeTab === 'memory' ? 'Ideia ou Pensamento' : 'Nome do Projeto'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={
                      activeTab === 'task' ? 'Ex: Resolver lista de exercícios' :
                      activeTab === 'reminder' ? 'Ex: Tomar remédio, Ligar pro cliente...' :
                      activeTab === 'study' ? 'Ex: Funções Afim e Logaritmos' :
                      activeTab === 'habit' ? 'Ex: Ler 10 páginas por dia' :
                      activeTab === 'routine' ? 'Ex: Bloco de Código' :
                      activeTab === 'goal' ? 'Ex: Guardar R$ 5.000' :
                      activeTab === 'memory' ? 'Ex: Ideia de novo módulo' : 'Ex: Novo aplicativo KVB'
                    }
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-3 text-base text-white outline-none placeholder:text-white/30"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Detalhes / Anotações
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Adicione contexto, detalhes ou observações..."
                    className="w-full bg-black/40 border border-white/10 focus:border-blue-500 rounded-xl px-4 py-2.5 text-sm text-white outline-none resize-none placeholder:text-white/30"
                  />
                </div>

                {(activeTab === 'routine' || activeTab === 'reminder') && (
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                      Horário do Alarme / Lembrete
                    </label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-medium text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 ios-press disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Registrando...' : 'Salvar Registro'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
