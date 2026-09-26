import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  Plus,
  Clock,
  AlarmClock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Volume2,
  VolumeX,
  Repeat,
  Trash2,
  AlertTriangle,
  Play,
  RotateCcw,
  Check,
  Zap,
  Info
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { ReminderItem } from '../types';
import {
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationTone,
  sendDeviceNotification,
  AVAILABLE_SOUND_TONES
} from '../services/notificationService';
import { NotificationPermissionModal } from './NotificationPermissionModal';
import confetti from 'canvas-confetti';

interface RemindersViewProps {
  onOpenQuickCapture?: (tab?: any) => void;
}

export const RemindersView: React.FC<RemindersViewProps> = () => {
  const {
    reminders,
    addReminder,
    deleteReminder,
    snoozeReminder,
    completeReminder,
    notificationSettings
  } = useData();

  const [permState, setPermState] = useState(getNotificationPermission());
  const [showPermModal, setShowPermModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'completed' | 'alarms'>('pending');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('16:00');
  const [leadMinutes, setLeadMinutes] = useState(10);
  const [recurrence, setRecurrence] = useState<ReminderItem['recurrence']>('none');
  const [category, setCategory] = useState<ReminderItem['category']>('Estudo');
  const [priority, setPriority] = useState<ReminderItem['priority']>('high');
  const [isAlarm, setIsAlarm] = useState(false);
  const [alarmTone, setAlarmTone] = useState<'radar' | 'chime' | 'waves' | 'crystal' | 'bell'>('chime');

  const handleTestChime = () => {
    playNotificationTone(alarmTone, true);
    sendDeviceNotification(
      '⏰ Teste de Alarme do LIFE OS',
      'Notificação sonora e vibração integradas com sucesso ao seu aparelho.',
      'reminders',
      undefined,
      true,
      { category: 'Rotina', tone: alarmTone }
    );
  };

  const handleTestPushNotification = async () => {
    if (permState !== 'granted') {
      setShowPermModal(true);
      return;
    }
    await sendDeviceNotification(
      '📚 Sessão de Estudo Agendada',
      'Está na hora da sua sessão de matemática com foco.',
      'studies',
      undefined,
      false,
      { category: 'Estudo', tone: 'chime' }
    );
  };

  const handleQuickPreset = (preset: {
    title: string;
    cat: ReminderItem['category'];
    minutesFromNow?: number;
    fixedTime?: string;
    isAlarm?: boolean;
    leadMinutes?: number;
  }) => {
    const target = new Date();
    if (preset.minutesFromNow) {
      target.setMinutes(target.getMinutes() + preset.minutesFromNow);
    }
    const dateStr = target.toISOString().split('T')[0];
    const timeStr = preset.fixedTime || `${String(target.getHours()).padStart(2, '0')}:${String(target.getMinutes()).padStart(2, '0')}`;

    setTitle(preset.title);
    setCategory(preset.cat);
    setDate(dateStr);
    setTime(timeStr);
    setIsAlarm(!!preset.isAlarm);
    setLeadMinutes(preset.leadMinutes || 0);
    setShowAddModal(true);
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await addReminder({
      title: title.trim(),
      description: description.trim(),
      date,
      time,
      leadMinutes: Number(leadMinutes),
      recurrence,
      category,
      priority,
      isAlarm,
      alarmTone,
      enabled: true,
      notificationEnabled: true,
      completed: false,
    });

    confetti({ particleCount: 25, spread: 50 });
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const filteredReminders = reminders.filter(r => {
    if (filter === 'pending') return !r.completed;
    if (filter === 'completed') return r.completed;
    if (filter === 'alarms') return r.isAlarm && !r.completed;
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold flex items-center gap-1.5">
            <AlarmClock className="w-3.5 h-3.5 text-blue-400" />
            Alertas & Sincronização Móvel
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Lembretes & Alarmes
          </h1>
          <p className="text-sm text-white/60">
            Avisos pontuais e toques sonoros integrados às notificações do celular
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestPushNotification}
            className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-medium flex items-center gap-1.5 ios-press cursor-pointer"
            title="Dispara uma notificação de teste no celular"
          >
            <Bell className="w-4 h-4 text-blue-400" /> Testar Notificação
          </button>

          <button
            onClick={handleTestChime}
            className="px-3.5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 text-xs font-medium flex items-center gap-1.5 ios-press cursor-pointer"
            title="Tocar som de alarme"
          >
            <Volume2 className="w-4 h-4 text-amber-400" /> Testar Alarme
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 ios-press cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Novo Lembrete
          </button>
        </div>
      </div>

      {/* Permission Card Banner */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          permState === 'granted'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
            : permState === 'denied'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
            : 'bg-blue-500/10 border-blue-500/30 text-blue-200'
        }`}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={`p-2.5 rounded-2xl ${
              permState === 'granted'
                ? 'bg-emerald-500/20 text-emerald-400'
                : permState === 'denied'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}
          >
            {permState === 'granted' ? <CheckCircle2 className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {permState === 'granted'
                ? 'Notificações no Celular Ativadas'
                : permState === 'denied'
                ? 'Permissão de Notificações Bloqueada'
                : 'Conectar Notificações ao Celular'}
              {permState === 'granted' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  SISTEMA CONECTADO
                </span>
              )}
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              {permState === 'granted'
                ? 'Seus lembretes, alarmes e rotinas soarão diretamente no seu dispositivo.'
                : permState === 'denied'
                ? 'O navegador bloqueou as notificações. Toque nas instruções para desbloquear.'
                : 'O LIFE OS precisa da sua autorização para enviar avisos mesmo com o app fechado.'}
            </p>
          </div>
        </div>

        <div>
          {permState !== 'granted' ? (
            <button
              onClick={() => setShowPermModal(true)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md whitespace-nowrap ios-press cursor-pointer self-start sm:self-auto"
            >
              {permState === 'denied' ? 'Como Desbloquear' : 'Ativar Notificações'}
            </button>
          ) : (
            <button
              onClick={handleTestPushNotification}
              className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 ios-press cursor-pointer"
            >
              Testar Envio
            </button>
          )}
        </div>
      </motion.div>

      {/* Quick Presets Carousel */}
      <div className="space-y-2">
        <span className="text-[11px] uppercase tracking-wider font-mono text-white/40 block">
          Atalhos Rápidos de Agendamento
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { title: 'Estudar Matemática', cat: 'Estudo' as const, minutesFromNow: 30, leadMinutes: 5, icon: '📚', label: 'Estudo em 30 min' },
            { title: 'Treino & Cardio', cat: 'Treino' as const, fixedTime: '18:00', isAlarm: true, icon: '🥋', label: 'Treino às 18:00' },
            { title: 'Registrar Movimentações', cat: 'Financeiro' as const, fixedTime: '20:00', icon: '💰', label: 'Finanças às 20:00' },
            { title: 'Revisão Espaçada', cat: 'Revisão' as const, minutesFromNow: 60, icon: '🧠', label: 'Revisão em 1h' },
          ].map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPreset(preset)}
              className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center gap-2.5 text-left transition-all ios-press cursor-pointer"
            >
              <span className="text-xl">{preset.icon}</span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{preset.label}</p>
                <p className="text-[10px] text-white/40 truncate">{preset.title}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#161619] p-1 rounded-2xl w-fit border border-white/5">
        {[
          { id: 'pending', label: `Ativos (${reminders.filter(r => !r.completed).length})` },
          { id: 'alarms', label: 'Alarmes' },
          { id: 'completed', label: 'Concluídos' },
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

      {/* Reminders List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredReminders.map(rem => {
            const isAlarm = rem.isAlarm;
            return (
              <motion.div
                key={rem.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`ios-glass p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  rem.completed ? 'border-white/5 opacity-50' :
                  isAlarm ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className={`p-3 rounded-2xl mt-0.5 flex-shrink-0 ${
                    isAlarm ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {isAlarm ? <AlarmClock className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-white/5 text-blue-400 font-semibold">
                        {rem.category}
                      </span>
                      {rem.leadMinutes > 0 && (
                        <span className="text-[10px] text-white/40 font-mono">
                          Avisa {rem.leadMinutes} min antes
                        </span>
                      )}
                      {rem.recurrence !== 'none' && (
                        <span className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                          <Repeat className="w-3 h-3" /> {rem.recurrence}
                        </span>
                      )}
                      {rem.alarmTone && (
                        <span className="text-[10px] text-white/40 font-mono flex items-center gap-0.5">
                          <Volume2 className="w-2.5 h-2.5" /> {rem.alarmTone}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-base font-semibold text-white truncate ${rem.completed ? 'line-through text-white/40' : ''}`}>
                      {rem.title}
                    </h3>
                    {rem.description && (
                      <p className="text-xs text-white/60 line-clamp-1">{rem.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-xs text-white/50 font-mono pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-white/40" /> {rem.date}
                      </span>
                      <span className="flex items-center gap-1 text-white/80 font-bold">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> {rem.time}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions: Snooze, Complete, Delete */}
                <div className="flex items-center gap-2 self-end sm:self-center border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                  {!rem.completed ? (
                    <>
                      <button
                        onClick={() => snoozeReminder(rem.id, 10)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-medium transition-all"
                        title="Adiar por 10 minutos"
                      >
                        Adiar 10m
                      </button>
                      <button
                        onClick={() => completeReminder(rem.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all ios-press cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Concluir
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-emerald-400 font-mono">Concluído</span>
                  )}

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-2 text-white/20 hover:text-red-400 transition-colors ml-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredReminders.length === 0 && (
          <div className="text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <AlarmClock className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhum lembrete nesta categoria.</p>
            <p className="text-xs text-white/40 mt-1">Toque em "Novo Lembrete" para programar um alarme ou aviso sonoro.</p>
          </div>
        )}
      </div>

      {/* Modal Add Reminder */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#1c1c1f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlarmClock className="w-5 h-5 text-blue-400" /> Criar Lembrete / Alarme
            </h3>

            <form onSubmit={handleCreateReminder} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Título do Lembrete
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Estudar matemática, Treino de pernas, Pagar fatura..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instruções ou detalhes importantes..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  >
                    <option value="Estudo">📚 Estudo</option>
                    <option value="Treino">🥋 Treino</option>
                    <option value="Projeto">💼 Projeto</option>
                    <option value="Financeiro">💰 Financeiro</option>
                    <option value="Rotina">⏰ Rotina</option>
                    <option value="Revisão">🧠 Revisão</option>
                    <option value="Geral">⚡ Geral</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  >
                    <option value="urgent">🔴 Urgente</option>
                    <option value="high">🟠 Alta</option>
                    <option value="medium">🟡 Média</option>
                    <option value="low">⚪ Baixa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Avisar com Antecedência
                  </label>
                  <select
                    value={leadMinutes}
                    onChange={(e) => setLeadMinutes(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  >
                    <option value={0}>No horário exato</option>
                    <option value={5}>5 minutos antes</option>
                    <option value={10}>10 minutos antes</option>
                    <option value={15}>15 minutos antes</option>
                    <option value={30}>30 minutos antes</option>
                    <option value={60}>1 hora antes</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Repetição
                  </label>
                  <select
                    value={recurrence}
                    onChange={(e) => setRecurrence(e.target.value as any)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs outline-none"
                  >
                    <option value="none">Uma vez (Não repete)</option>
                    <option value="daily">Todos os dias</option>
                    <option value="weekdays">Segunda a Sexta</option>
                    <option value="weekly">Semanalmente</option>
                    <option value="monthly">Mensalmente</option>
                  </select>
                </div>
              </div>

              {/* Sound Tone Selector */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1.5">
                  Toque Sonoro do Lembrete
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SOUND_TONES.map(t => (
                    <div
                      key={t.id}
                      onClick={() => {
                        setAlarmTone(t.id);
                        playNotificationTone(t.id, false);
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        alarmTone === t.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-black/30 border-white/5 text-white/60 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{t.icon}</span>
                        <span className="text-xs truncate">{t.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playNotificationTone(t.id, false);
                        }}
                        className="text-white/40 hover:text-blue-400 p-0.5"
                        title="Ouvir som"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/5">
                <div>
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <AlarmClock className="w-4 h-4 text-amber-400" /> Tocar como Alarme
                  </span>
                  <p className="text-[10px] text-white/50">
                    Emite toque sonoro destacado e vibração no horário
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={isAlarm}
                  onChange={(e) => setIsAlarm(e.target.checked)}
                  className="w-5 h-5 accent-blue-500 rounded"
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
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 ios-press"
                >
                  Programar Lembrete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Educational Permission Modal */}
      <NotificationPermissionModal
        isOpen={showPermModal}
        onClose={() => {
          setShowPermModal(false);
          setPermState(getNotificationPermission());
        }}
        onPermissionChanged={(st) => setPermState(st)}
      />
    </div>
  );
};
