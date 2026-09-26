import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  CheckCircle2,
  BookOpen,
  Sparkles,
  FolderKanban,
  Target,
  Flame,
  Wallet,
  Dumbbell,
  Clock,
  X,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { tasks, subjects, memoryNotes, projects, goals, habits, finances } = useData();
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search in all modules
  const filteredTasks = q ? tasks.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)) : [];
  const filteredNotes = q ? memoryNotes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)) : [];
  const filteredSubjects = q ? subjects.filter(s => s.name.toLowerCase().includes(q)) : [];
  const filteredProjects = q ? projects.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)) : [];
  const filteredGoals = q ? goals.filter(g => g.title.toLowerCase().includes(q)) : [];

  const totalResults = filteredTasks.length + filteredNotes.length + filteredSubjects.length + filteredProjects.length + filteredGoals.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-[#18181b] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10">
          <Search className="w-5 h-5 text-white/40 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar em todo o LIFE OS (tarefas, notas, estudos, metas...)"
            className="flex-1 bg-transparent text-sm sm:text-base text-white outline-none placeholder:text-white/30"
            autoFocus
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-white/40 hover:text-white mr-2">
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/5 hidden sm:inline">
            ESC
          </span>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="text-center py-10 text-white/30 text-xs">
              Digite palavras-chave como <span className="text-blue-400">"potenciação"</span>, <span className="text-emerald-400">"projeto"</span> ou <span className="text-purple-400">"ideia"</span> para buscar no sistema.
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="text-center py-10 text-white/40 text-xs">
              Nenhum resultado encontrado para "{query}".
            </div>
          )}

          {filteredTasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 px-2">Tarefas ({filteredTasks.length})</span>
              {filteredTasks.map(t => (
                <div
                  key={t.id}
                  onClick={() => { onNavigate('tasks'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">{t.title}</span>
                  </div>
                  <span className="text-[10px] text-white/40 font-mono">{t.category}</span>
                </div>
              ))}
            </div>
          )}

          {filteredNotes.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 px-2">Memória & Notas ({filteredNotes.length})</span>
              {filteredNotes.map(n => (
                <div
                  key={n.id}
                  onClick={() => { onNavigate('memory'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <div>
                      <h4 className="font-semibold text-white">{n.title}</h4>
                      <p className="text-[10px] text-white/50 line-clamp-1">{n.content}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-purple-300 font-mono">{n.category}</span>
                </div>
              ))}
            </div>
          )}

          {filteredSubjects.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 px-2">Estudos ({filteredSubjects.length})</span>
              {filteredSubjects.map(s => (
                <div
                  key={s.id}
                  onClick={() => { onNavigate('studies'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span className="font-semibold text-white">{s.name}</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono">Disciplina</span>
                </div>
              ))}
            </div>
          )}

          {filteredProjects.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 px-2">Projetos ({filteredProjects.length})</span>
              {filteredProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => { onNavigate('projects'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <FolderKanban className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-white">{p.name}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-mono">{p.progressPercent}%</span>
                </div>
              ))}
            </div>
          )}

          {filteredGoals.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-white/40 px-2">Metas ({filteredGoals.length})</span>
              {filteredGoals.map(g => (
                <div
                  key={g.id}
                  onClick={() => { onNavigate('goals'); onClose(); }}
                  className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">{g.title}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono">{g.unit} {g.targetValue}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
