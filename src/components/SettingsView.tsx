import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  User,
  LogOut,
  RotateCcw,
  Shield,
  Download,
  Moon,
  Sparkles,
  Sliders,
  DollarSign,
  Globe,
  Bell,
  Check,
  Volume2,
  Clock,
  AlarmClock,
  Play,
  Smartphone,
  AlertTriangle,
  Vibrate,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { DEFAULT_APP_CONFIG } from '../config/appConfig';
import { LifeOsLogo } from './LifeOsLogo';
import {
  getNotificationPermission,
  requestNotificationPermission,
  playNotificationTone,
  sendDeviceNotification,
  AVAILABLE_SOUND_TONES,
  NotificationPermissionState
} from '../services/notificationService';
import { NotificationPermissionModal } from './NotificationPermissionModal';

interface SettingsViewProps {
  onRedoOnboarding: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onRedoOnboarding }) => {
  const {
    user,
    profile,
    logout,
    updateUserProfile,
    autoLoginEnabled,
    setAutoLoginEnabled,
    clearDeviceMemory
  } = useAuth();
  const {
    tasks,
    reminders,
    notificationSettings,
    updateNotificationSettings,
    subjects,
    studySessions,
    habits,
    projects,
    finances,
    memoryNotes
  } = useData();

  const [preferredName, setPreferredName] = useState(profile?.preferredName || '');
  const [currency, setCurrency] = useState(profile?.currency || 'BRL');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deviceResetMsg, setDeviceResetMsg] = useState(false);
  const [permState, setPermState] = useState<NotificationPermissionState>(getNotificationPermission());
  const [showPermModal, setShowPermModal] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      preferredName: preferredName.trim() || 'Você',
      currency,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleTestRealNotification = async () => {
    if (permState !== 'granted') {
      setShowPermModal(true);
      return;
    }
    await sendDeviceNotification(
      '🔔 Teste de Notificação no Celular',
      'Seu LIFE OS está conectado ao sistema operacional com sucesso!',
      'reminders',
      undefined,
      false,
      { category: 'Geral', tone: notificationSettings.soundTone || 'chime' }
    );
    setTestNotificationSent(true);
    setTimeout(() => setTestNotificationSent(false), 3000);
  };

  const handleTestAlarmAudio = () => {
    playNotificationTone(notificationSettings.soundTone || 'chime', true);
  };

  const handleExportData = () => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      user: {
        uid: user?.uid,
        email: user?.email,
        profile,
      },
      data: {
        tasks,
        reminders,
        notificationSettings,
        subjects,
        studySessions,
        habits,
        projects,
        finances,
        memoryNotes,
      },
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `life_os_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-28 max-w-3xl">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-white/50 font-semibold">
          Preferências Globais
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
          Ajustes & Notificações
        </h1>
        <p className="text-sm text-white/60">
          Personalização, perfil, permissões de alertas móveis e controle total do sistema
        </p>
      </div>

      {/* Profile Card */}
      <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
            {profile?.preferredName?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{profile?.preferredName || 'Usuário'}</h3>
            <p className="text-xs text-white/50 font-mono">{user?.email || 'Sessão anônima ativa'}</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                Nome de Exibição
              </label>
              <input
                type="text"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                Moeda do Sistema
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
              >
                <option value="BRL">Real (R$ - BRL)</option>
                <option value="USD">Dólar ($ - USD)</option>
                <option value="EUR">Euro (€ - EUR)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Salvo com sucesso!
              </span>
            ) : <span />}

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all ios-press cursor-pointer"
            >
              Salvar Perfil
            </button>
          </div>
        </form>
      </div>

      {/* Persistent Auto-Login Card */}
      <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl ${
              autoLoginEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-white/40'
            }`}>
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Conexão Permanente no Dispositivo
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  autoLoginEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/50'
                }`}>
                  {autoLoginEnabled ? 'Login Automático Ativado' : 'Desativado'}
                </span>
              </h3>
              <p className="text-xs text-white/60 mt-0.5 max-w-xl">
                {autoLoginEnabled
                  ? `Este dispositivo está configurado para entrar automaticamente nesta conta (${user?.email || profile?.displayName || 'Sessão atual'}). Você nunca precisará digitar sua senha novamente ao abrir o app.`
                  : 'O login automático está desativado. Você precisará digitar suas credenciais ao fechar ou reabrir o app.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAutoLoginEnabled(!autoLoginEnabled)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ios-press cursor-pointer ${
                autoLoginEnabled
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white/70'
              }`}
            >
              {autoLoginEnabled ? '✓ Conectar Sempre' : 'Ativar Auto-Login'}
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Credenciais e token sincronizados com segurança local permanente (IndexedDB + LocalStorage).</span>
          </div>

          <button
            type="button"
            onClick={() => {
              clearDeviceMemory();
              setDeviceResetMsg(true);
              setTimeout(() => setDeviceResetMsg(false), 2500);
            }}
            className="text-xs text-white/40 hover:text-white underline self-start sm:self-auto cursor-pointer"
          >
            {deviceResetMsg ? '✓ Memória do aparelho limpa!' : 'Esquecer dados deste dispositivo'}
          </button>
        </div>
      </div>

      {/* Mobile Notification System Config */}
      <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className={`p-3 rounded-2xl ${
              permState === 'granted'
                ? 'bg-emerald-500/20 text-emerald-400'
                : permState === 'denied'
                ? 'bg-amber-500/20 text-amber-400'
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Notificações no Celular
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                  permState === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : permState === 'denied'
                    ? 'bg-red-500/20 text-red-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}>
                  {permState === 'granted' ? 'Ativadas' : permState === 'denied' ? 'Permissão Bloqueada pelo Sistema' : 'Desativadas'}
                </span>
              </h3>
              <p className="text-xs text-white/60 mt-0.5">
                {permState === 'granted'
                  ? 'O LIFE OS está autorizado a enviar notificações com sons e vibração para o seu aparelho.'
                  : permState === 'denied'
                  ? 'O navegador bloqueou os alertas. Toque em "Como Desbloquear" para permitir no cadeado do navegador.'
                  : 'Autorize as notificações para receber alertas pontuais de rotinas, estudos e tarefas.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {permState === 'granted' ? (
              <button
                onClick={handleTestRealNotification}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold ios-press cursor-pointer whitespace-nowrap"
              >
                {testNotificationSent ? '✓ Enviada!' : 'Testar Notificação'}
              </button>
            ) : (
              <button
                onClick={() => setShowPermModal(true)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md ios-press cursor-pointer whitespace-nowrap"
              >
                {permState === 'denied' ? 'Como Desbloquear' : 'Ativar Notificações'}
              </button>
            )}
          </div>
        </div>

        {/* Master Enabled Switch */}
        <div className="p-3.5 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-white">Ativar Sistema Geral de Notificações</span>
            <p className="text-[11px] text-white/50">Habilita ou suspende todos os disparos de avisos e alarmes</p>
          </div>
          <input
            type="checkbox"
            checked={notificationSettings.enabled}
            onChange={(e) => updateNotificationSettings({ enabled: e.target.checked })}
            className="w-5 h-5 accent-blue-500 rounded"
          />
        </div>

        {/* Sound Tone Selector & Previews */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-white/40 font-bold block">
              Toque de Alarme Padrão (Web Audio API Apple Style)
            </span>
            <button
              onClick={handleTestAlarmAudio}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <Volume2 className="w-3.5 h-3.5" /> Testar Som
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {AVAILABLE_SOUND_TONES.map(t => (
              <div
                key={t.id}
                onClick={() => {
                  updateNotificationSettings({ soundTone: t.id });
                  playNotificationTone(t.id, false);
                }}
                className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                  notificationSettings.soundTone === t.id
                    ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm'
                    : 'bg-black/30 border-white/5 text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-base">{t.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{t.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{t.description}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    playNotificationTone(t.id, false);
                  }}
                  className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-blue-400"
                  title="Ouvir som"
                >
                  <Play className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Granular Notification Channels */}
        <div className="space-y-3 pt-3 border-t border-white/5">
          <span className="text-[11px] uppercase tracking-wider text-white/40 font-bold block">
            Canais de Alertas por Módulo
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              { key: 'reminders', label: '🔔 Lembretes e Alarmes Marcados' },
              { key: 'routine', label: '⏰ Blocos de Rotina com Horário' },
              { key: 'studies', label: '📚 Sessões de Estudo & Foco' },
              { key: 'reviews', label: '🧠 Revisões Espaçadas do Dia (09:00)' },
              { key: 'tasks', label: '💼 Tarefas e Prazos com Horário' },
              { key: 'workouts', label: '🥋 Treinos e Hábitos Programados' },
              { key: 'finances', label: '💰 Balanço Financeiro Noturno (20:00)' },
              { key: 'dailyBriefingMorning', label: '☀️ Resumo Matinal do Dia (08:00)' },
            ].map(ch => {
              const isChecked = (notificationSettings as any)[ch.key];
              return (
                <div
                  key={ch.key}
                  onClick={() => updateNotificationSettings({ [ch.key]: !isChecked })}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isChecked ? 'bg-blue-500/10 border-blue-500/30 text-white' : 'bg-black/30 border-white/5 text-white/50'
                  }`}
                >
                  <span className="text-xs font-medium">{ch.label}</span>
                  <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                    isChecked ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/20'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quiet Hours & Haptic Vibration */}
        <div className="pt-3 border-t border-white/5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" /> Horário Silencioso (Não Perturbe)
            </span>
            <input
              type="checkbox"
              checked={notificationSettings.quietHoursEnabled}
              onChange={(e) => updateNotificationSettings({ quietHoursEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-500"
            />
          </div>

          {notificationSettings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-3 bg-black/30 p-3 rounded-2xl border border-white/5">
              <div>
                <label className="text-[10px] uppercase font-mono text-white/40 block mb-1">
                  Início Silêncio
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietStart}
                  onChange={(e) => updateNotificationSettings({ quietStart: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase font-mono text-white/40 block mb-1">
                  Fim Silêncio
                </label>
                <input
                  type="time"
                  value={notificationSettings.quietEnd}
                  onChange={(e) => updateNotificationSettings({ quietEnd: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>
            </div>
          )}

          {/* Vibration Feedback */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Vibrate className="w-4 h-4 text-purple-400" /> Vibração em Aparelhos Móveis (Haptic)
            </span>
            <input
              type="checkbox"
              checked={notificationSettings.vibrateEnabled}
              onChange={(e) => updateNotificationSettings({ vibrateEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Onboarding re-run */}
      <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-4 h-4 text-blue-400" /> Personalização & Quiz
        </h3>
        <p className="text-xs text-white/60">
          Refaça o questionário inicial de onboarding para calibrar seus objetivos, horários de sono, rotinas e temas do LIFE OS.
        </p>
        <button
          onClick={onRedoOnboarding}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all ios-press cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Refazer Questionário
        </button>
      </div>

      {/* Data Backup */}
      <div className="ios-glass p-6 rounded-3xl border border-white/5 space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" /> Backup & Exportação de Dados
        </h3>
        <p className="text-xs text-white/60">
          Faça o download de todos os seus dados pessoais, tarefas, rotinas, estudos, finanças e memórias em formato JSON criptografado.
        </p>
        <button
          onClick={handleExportData}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition-all ios-press cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" /> Baixar Arquivo JSON
        </button>
      </div>

      {/* Official App Logo & Architecture Card */}
      <div className="ios-glass p-6 rounded-3xl border border-white/5 flex flex-col sm:flex-row items-center gap-5">
        <LifeOsLogo variant="icon" size="xl" className="flex-shrink-0" />
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <span className="text-xl font-bold text-white">Life</span>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              OS
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
              Oficial
            </span>
          </div>
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-white/50">
            Sua Vida, Organizada
          </p>
          <p className="text-xs text-white/60 leading-relaxed">
            Sistema operacional pessoal integrando rotina, hábitos, estudos, projetos, tarefas, finanças e memória em uma arquitetura unificada.
          </p>
        </div>
      </div>

      {/* Logout */}
      <div className="pt-4 flex justify-between items-center text-xs text-white/40">
        <span>LIFE OS • Todos os dados sincronizados na nuvem</span>
        <button
          onClick={logout}
          className="text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Encerrar Sessão
        </button>
      </div>

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
