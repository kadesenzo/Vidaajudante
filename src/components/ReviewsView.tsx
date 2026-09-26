import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Clock,
  Brain,
  Plus,
  BookOpen
} from 'lucide-react';
import { useData } from '../context/DataContext';
import confetti from 'canvas-confetti';

export const ReviewsView: React.FC = () => {
  const { reviews, completeReview, addReview, subjects } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [subjectName, setSubjectName] = useState(subjects[0]?.name || 'Geral');
  const [intervalDays, setIntervalDays] = useState(1);

  const todayStr = new Date().toISOString().split('T')[0];

  const pendingReviews = reviews.filter(r => r.status !== 'completed');
  const completedReviews = reviews.filter(r => r.status === 'completed');

  // Today specific reviews
  const dueToday = pendingReviews.filter(r => r.scheduledDate <= todayStr);
  const upcomingReviews = pendingReviews.filter(r => r.scheduledDate > todayStr);

  const handleComplete = (id: string) => {
    completeReview(id, 5);
    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#BF5AF2', '#0A84FF', '#30D158'],
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + Number(intervalDays));
    const schedDate = targetDate.toISOString().split('T')[0];

    await addReview({
      subjectName,
      topic: topic.trim(),
      scheduledDate: schedDate,
      intervalDays: Number(intervalDays),
      status: 'pending',
    });

    setTopic('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-purple-400" />
            Curva do Esquecimento de Ebbinghaus
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Central de Revisões Espaçadas
          </h1>
          <p className="text-sm text-white/60">
            Revisões programadas nos intervalos ideais (1, 3, 7 e 30 dias) para fixação permanente
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Agendar Revisão
        </button>
      </div>

      {/* Due Today Highlight */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-purple-300 px-1 flex items-center gap-2">
          <span>🔄 Para Revisar Hoje ({dueToday.length})</span>
        </h3>

        <div className="space-y-2.5">
          {dueToday.map((r) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-glass p-4 rounded-2xl border border-purple-500/30 flex items-center justify-between gap-4 shadow-lg shadow-purple-950/20"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                    {r.subjectName}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    Ciclo de {r.intervalDays} dia(s)
                  </span>
                </div>
                <h4 className="text-base font-semibold text-white">{r.topic}</h4>
              </div>

              <button
                onClick={() => handleComplete(r.id)}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 ios-press cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Revisado
              </button>
            </motion.div>
          ))}

          {dueToday.length === 0 && (
            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center text-xs text-white/50">
              Nenhuma revisão vencendo hoje. Ótimo trabalho de retenção!
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Reviews */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 px-1">
          Próximos Ciclos ({upcomingReviews.length})
        </h3>

        <div className="space-y-2">
          {upcomingReviews.map((r) => (
            <div
              key={r.id}
              className="ios-glass p-3.5 rounded-2xl border border-white/5 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-white/40">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{r.topic}</h4>
                  <p className="text-[10px] text-white/40">{r.subjectName} • Intervalo de {r.intervalDays} dias</p>
                </div>
              </div>

              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">
                {r.scheduledDate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add Manual Review */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#1c1c1f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Agendar Revisão</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Tópico / Conteúdo
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Potenciação, Mitose, Simple Past..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-purple-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Matéria / Disciplina
                </label>
                <input
                  type="text"
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Intervalo de Repetição
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 3, 7, 30].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setIntervalDays(d)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                        intervalDays === d
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-black/30 border-white/5 text-white/60'
                      }`}
                    >
                      {d} {d === 1 ? 'dia' : 'dias'}
                    </button>
                  ))}
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
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 ios-press"
                >
                  Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
