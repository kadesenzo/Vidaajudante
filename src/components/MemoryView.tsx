import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Plus,
  Pin,
  Trash2,
  Search,
  Tag,
  Lightbulb,
  FileText
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface MemoryViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const MemoryView: React.FC<MemoryViewProps> = ({ onOpenQuickCapture }) => {
  const { memoryNotes, deleteMemoryNote } = useData();
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const categories = ['ALL', 'IDEIA', 'LEMBRETE', 'ESTUDO', 'PROJETO', 'PESSOAL', 'FINANCEIRO', 'OUTRO'];

  const filtered = memoryNotes.filter(n => {
    if (filterCat !== 'ALL' && n.category !== filterCat) return false;
    if (query) {
      const q = query.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-purple-400 font-semibold">
            Segundo Cérebro
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Memória & Anotações
          </h1>
          <p className="text-sm text-white/60">
            Descarregue ideias, reflexões e lembretes instantaneamente
          </p>
        </div>

        <button
          onClick={() => onOpenQuickCapture('memory')}
          className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova Nota
        </button>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar em todas as notas e memórias..."
            className="w-full bg-[#1c1c1e] border border-white/5 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                filterCat === cat
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              {cat === 'ALL' ? 'Todas' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Masonry / Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(note => {
          return (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ios-glass p-5 rounded-2xl border border-white/5 flex flex-col justify-between space-y-3 hover:border-purple-500/30 transition-all group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                    {note.category}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {new Date(note.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <h3 className="text-base font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {note.title}
                </h3>
                <p className="text-xs text-white/70 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-end">
                <button
                  onClick={() => deleteMemoryNote(note.id)}
                  className="p-1.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <Sparkles className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhuma memória encontrada.</p>
            <p className="text-xs text-white/40 mt-1">Toque em "Nova Nota" para anotar qualquer insight rápido.</p>
          </div>
        )}
      </div>
    </div>
  );
};
