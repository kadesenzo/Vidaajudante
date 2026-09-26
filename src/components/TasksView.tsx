import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Star,
  Clock,
  Filter,
  Search,
  Check,
  Tag
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { TaskItem, TaskPriority } from '../types';
import confetti from 'canvas-confetti';

interface TasksViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenQuickCapture }) => {
  const { tasks, toggleTaskCompleted, deleteTask, setAsNextAction, updateTask } = useData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean)));

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.status === 'completed') return false;
    if (filter === 'completed' && task.status !== 'completed') return false;
    if (selectedCategory !== 'all' && task.category !== selectedCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchDesc = task.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const handleToggle = (task: TaskItem) => {
    toggleTaskCompleted(task);
    if (task.status !== 'completed') {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#30D158', '#0A84FF'],
      });
    }
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
            Módulo de Execução
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Tarefas & Prioridades
          </h1>
          <p className="text-sm text-white/60">
            {tasks.filter(t => t.status !== 'completed').length} pendentes • {tasks.filter(t => t.status === 'completed').length} concluídas
          </p>
        </div>

        <button
          onClick={() => onOpenQuickCapture('task')}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex bg-[#1c1c1e] p-1 rounded-xl border border-white/5">
            {[
              { id: 'pending', label: 'Pendentes' },
              { id: 'completed', label: 'Concluídas' },
              { id: 'all', label: 'Todas' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === tab.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar tarefas..."
              className="w-full bg-[#1c1c1e] border border-white/5 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white outline-none placeholder:text-white/30 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/5 text-white/50 hover:bg-white/10'
              }`}
            >
              Todas Categorias
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white/5 text-white/50 hover:bg-white/10'
                }`}
              >
                <Tag className="w-2.5 h-2.5" />
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        <AnimatePresence>
          {filteredTasks.map(task => {
            const isDone = task.status === 'completed';
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-[#18181a]/40 border-white/5 opacity-60'
                    : 'ios-glass border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(task)}
                    className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all mt-0.5 flex-shrink-0 cursor-pointer ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-400 text-white'
                        : 'border-white/30 hover:border-blue-400'
                    }`}
                  >
                    {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="space-y-1 min-w-0">
                    <p className={`text-sm font-medium text-white truncate ${isDone ? 'line-through text-white/40' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-xs text-white/60 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-[11px] text-white/40 pt-0.5">
                      <span className="px-2 py-0.5 rounded bg-white/5 text-white/70">
                        {task.category}
                      </span>
                      {task.estimatedMinutes && (
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-white/30" />
                          {task.estimatedMinutes}m
                        </span>
                      )}
                      {task.dueDate && (
                        <span>• Para: {task.dueDate}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  {!isDone && (
                    <button
                      onClick={() => setAsNextAction(task.id)}
                      title="Definir como Próxima Ação no topo da Dashboard"
                      className={`p-2 rounded-xl text-xs flex items-center gap-1 transition-all ${
                        task.isNextAction
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold'
                          : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${task.isNextAction ? 'fill-blue-400 text-blue-400' : ''}`} />
                      {task.isNextAction ? 'Próxima Ação' : 'Foco'}
                    </button>
                  )}

                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md uppercase font-medium ${
                    task.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                    task.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' :
                    'bg-white/5 text-white/50'
                  }`}>
                    {task.priority}
                  </span>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 rounded-xl text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 px-4 rounded-2xl bg-white/5 border border-white/5">
            <CheckCircle2 className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhuma tarefa encontrada neste filtro.</p>
            <p className="text-xs text-white/40 mt-1">Clique em "Nova Tarefa" para adicionar.</p>
          </div>
        )}
      </div>
    </div>
  );
};
