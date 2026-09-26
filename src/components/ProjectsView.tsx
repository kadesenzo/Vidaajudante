import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FolderKanban,
  Plus,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  ListTodo,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface ProjectsViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ onOpenQuickCapture }) => {
  const { projects, tasks, updateProject } = useData();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');

  const filteredProjects = projects.filter(p => {
    if (filter === 'active' && p.status === 'completed') return false;
    if (filter === 'completed' && p.status !== 'completed') return false;
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-indigo-400 font-semibold">
            Visão Geral de Objetivos
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Projetos & Empreendimentos
          </h1>
          <p className="text-sm text-white/60">
            Acompanhe o progresso de cada iniciativa pessoal
          </p>
        </div>

        <button
          onClick={() => onOpenQuickCapture('project')}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Projeto
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#1c1c1e] p-1 rounded-xl w-fit border border-white/5">
        {[
          { id: 'active', label: 'Em Andamento' },
          { id: 'completed', label: 'Concluídos' },
          { id: 'all', label: 'Todos' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completedProjectTasks = projectTasks.filter(t => t.status === 'completed');

          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-glass p-6 rounded-3xl border border-white/5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md font-semibold ${
                    project.status === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    project.status === 'completed' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {project.status === 'active' ? 'Ativo' : project.status}
                  </span>

                  {project.deadline && (
                    <span className="text-xs text-white/40 font-mono">
                      Prazo: {project.deadline}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white">{project.name}</h3>
                <p className="text-xs text-white/60 line-clamp-2">{project.description}</p>
              </div>

              {/* Progress Slider / Bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-white/60">
                  <span>Progresso do Projeto</span>
                  <span className="font-mono font-bold text-blue-400">{project.progressPercent || 0}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${project.progressPercent || 0}%` }}
                  />
                </div>
              </div>

              {/* Next Step Highlight */}
              {project.nextStep && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span className="truncate"><strong>Próximo passo:</strong> {project.nextStep}</span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <ListTodo className="w-3.5 h-3.5" />
                  <span>{projectTasks.length} tarefas associadas</span>
                </div>

                <button
                  onClick={() => {
                    const newProgress = Math.min(100, (project.progressPercent || 0) + 20);
                    updateProject(project.id, {
                      progressPercent: newProgress,
                      status: newProgress === 100 ? 'completed' : 'active',
                    });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
                >
                  +20% Progresso
                </button>
              </div>
            </motion.div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <FolderKanban className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhum projeto cadastrado nesta lista.</p>
            <p className="text-xs text-white/40 mt-1">Crie um projeto para agrupar tarefas e metas.</p>
          </div>
        )}
      </div>
    </div>
  );
};
