import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Book,
  Calendar,
  Sparkles,
  Smile,
  Meh,
  Frown,
  CheckCircle2,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useData } from '../context/DataContext';
import confetti from 'canvas-confetti';

export const JournalView: React.FC = () => {
  const { journalEntries, addJournalEntry } = useData();
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [howWasDay, setHowWasDay] = useState('');
  const [whatIDid, setWhatIDid] = useState('');
  const [whatILearned, setWhatILearned] = useState('');
  const [achievements, setAchievements] = useState('');
  const [challenges, setChallenges] = useState('');
  const [tomorrowFocus, setTomorrowFocus] = useState('');
  const [doNotForget, setDoNotForget] = useState('');
  const [dayRating, setDayRating] = useState(4);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!howWasDay.trim() && !whatIDid.trim()) return;

    await addJournalEntry({
      date: todayStr,
      dayRating,
      howWasDay,
      whatIDid,
      whatILearned,
      achievements,
      challenges,
      tomorrowFocus,
      doNotForget,
    });

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.7 },
      colors: ['#0A84FF', '#BF5AF2'],
    });

    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Diário Pessoal & Reflexão
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Diário & Fechamento do Dia
          </h1>
          <p className="text-sm text-white/60">
            Descarregue o que viveu, aprendeu e organize a cabeça para o dia seguinte
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Escrever Entrada Hoje
        </button>
      </div>

      {/* Form Card */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="ios-glass p-6 rounded-3xl border border-indigo-500/30 space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" /> Fechamento do Dia ({todayStr})
            </h3>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setDayRating(star)}
                  className={`text-sm px-2 py-1 rounded-lg border ${
                    dayRating === star ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/30 border-white/5 text-white/50'
                  }`}
                >
                  {star}★
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                Como foi o seu dia?
              </label>
              <textarea
                rows={2}
                value={howWasDay}
                onChange={(e) => setHowWasDay(e.target.value)}
                placeholder="Sensação geral, energia, produtividade..."
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  O que você aprendeu de mais marcante hoje?
                </label>
                <textarea
                  rows={2}
                  value={whatILearned}
                  onChange={(e) => setWhatILearned(e.target.value)}
                  placeholder="Um conceito, uma lição prática, algo que leu..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Vitórias / Conquistas de hoje
                </label>
                <textarea
                  rows={2}
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  placeholder="O que deu certo? Quais tarefas finalizou?"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Amanhã preciso focar em...
                </label>
                <input
                  type="text"
                  value={tomorrowFocus}
                  onChange={(e) => setTomorrowFocus(e.target.value)}
                  placeholder="A primeira grande coisa de amanhã"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Não posso esquecer de...
                </label>
                <input
                  type="text"
                  value={doNotForget}
                  onChange={(e) => setDoNotForget(e.target.value)}
                  placeholder="Compromisso ou detalhe crítico"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md ios-press"
              >
                Salvar Registro
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Entries Timeline */}
      <div className="space-y-4">
        {journalEntries.map(entry => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="ios-glass p-6 rounded-3xl border border-white/5 space-y-3"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-mono font-bold text-white">{entry.date}</span>
              </div>
              <span className="text-xs text-amber-400 font-mono font-semibold">
                {entry.dayRating || 5}★
              </span>
            </div>

            {entry.howWasDay && (
              <div>
                <span className="text-[10px] text-white/40 uppercase font-semibold">Resumo</span>
                <p className="text-xs text-white/90 leading-relaxed mt-0.5">{entry.howWasDay}</p>
              </div>
            )}

            {entry.whatILearned && (
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
                <span className="text-[10px] text-indigo-300 uppercase font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> O que aprendi
                </span>
                <p className="text-xs text-white/80 mt-0.5">{entry.whatILearned}</p>
              </div>
            )}

            {(entry.tomorrowFocus || entry.doNotForget) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-white/5">
                {entry.tomorrowFocus && (
                  <p className="text-white/60">
                    <strong className="text-white">Amanhã:</strong> {entry.tomorrowFocus}
                  </p>
                )}
                {entry.doNotForget && (
                  <p className="text-white/60">
                    <strong className="text-red-400">Não esquecer:</strong> {entry.doNotForget}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        ))}

        {journalEntries.length === 0 && !showAddForm && (
          <div className="text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <Book className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhuma entrada no diário ainda.</p>
            <p className="text-xs text-white/40 mt-1">Toque em "Escrever Entrada Hoje" para fazer o fechamento do seu dia.</p>
          </div>
        )}
      </div>
    </div>
  );
};
