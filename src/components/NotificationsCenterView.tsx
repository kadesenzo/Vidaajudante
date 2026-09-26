import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  Sparkles,
  Target,
  Calendar,
  Wallet,
  Clock,
  Check,
  Trash2,
  AlarmClock,
  Filter
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const NotificationsCenterView: React.FC = () => {
  const { notifications, markNotificationRead, clearAllNotifications } = useData();
  const [filter, setFilter] = useState<'all' | 'unread' | 'today'>('all');

  const todayDateStr = new Date().toISOString().split('T')[0];

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'today') {
      const d = new Date(n.createdAt).toISOString().split('T')[0];
      return d === todayDateStr;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-28 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            Avisos & Lembretes
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Central de Notificações
          </h1>
          <p className="text-sm text-white/60">
            Avisos inteligentes de tarefas, rotinas, revisões pendentes e prazos de metas
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium flex items-center gap-1.5 ios-press self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" /> Limpar Todas
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#161619] p-1 rounded-2xl w-fit border border-white/5">
        {[
          { id: 'all', label: `Todas (${notifications.length})` },
          { id: 'unread', label: `Não lidas (${notifications.filter(n => !n.read).length})` },
          { id: 'today', label: 'Hoje' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filter === tab.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filtered.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`ios-glass p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
              n.read ? 'border-white/5 opacity-60' : 'border-blue-500/30 bg-blue-500/5'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl mt-0.5 ${
                n.type === 'alarm' ? 'bg-amber-500/20 text-amber-400' :
                n.type === 'review' ? 'bg-purple-500/20 text-purple-400' :
                n.type === 'goal' ? 'bg-emerald-500/20 text-emerald-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {n.type === 'alarm' ? <AlarmClock className="w-4 h-4" /> :
                 n.type === 'review' ? <Sparkles className="w-4 h-4" /> :
                 n.type === 'goal' ? <Target className="w-4 h-4" /> :
                 <Clock className="w-4 h-4" />}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">{n.title}</h4>
                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                </div>
                <p className="text-xs text-white/70">{n.message}</p>
                <span className="text-[10px] text-white/40 font-mono">
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>

            {!n.read && (
              <button
                onClick={() => markNotificationRead(n.id)}
                className="p-1.5 rounded-lg text-xs text-blue-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Marcar como lida"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhuma notificação encontrada.</p>
            <p className="text-xs text-white/40 mt-1">Lembretes automáticos aparecerão conforme seus compromissos se aproximarem.</p>
          </div>
        )}
      </div>
    </div>
  );
};
