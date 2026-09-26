import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  CheckCircle2,
  X,
  Volume2,
  Lock,
  Smartphone,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Clock,
  ArrowRight
} from 'lucide-react';
import {
  requestNotificationPermission,
  sendDeviceNotification,
  playNotificationTone,
  NotificationPermissionState
} from '../services/notificationService';
import confetti from 'canvas-confetti';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionChanged?: (state: NotificationPermissionState) => void;
}

export const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({
  isOpen,
  onClose,
  onPermissionChanged,
}) => {
  const [step, setStep] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [isRequesting, setIsRequesting] = useState(false);

  if (!isOpen) return null;

  const handleRequest = async () => {
    setIsRequesting(true);
    try {
      const result = await requestNotificationPermission();
      onPermissionChanged?.(result);

      if (result === 'granted') {
        setStep('granted');
        playNotificationTone('chime', false);
        confetti({ particleCount: 35, spread: 70, origin: { y: 0.6 } });

        // Trigger real verification notification
        await sendDeviceNotification(
          '🔔 Notificações Ativadas no Celular!',
          'O LIFE OS avisará seus horários de estudos, treinos e rotinas pontualmente.',
          'reminders',
          undefined,
          false,
          { category: 'Geral', tone: 'chime' }
        );
      } else if (result === 'denied') {
        setStep('denied');
      } else {
        onClose();
      }
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-md bg-[#161619] border border-white/10 rounded-[32px] p-6 sm:p-7 shadow-2xl relative overflow-hidden text-center space-y-5"
      >
        {/* Glow ambient background */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {step === 'prompt' && (
          <div className="space-y-5">
            {/* iOS System Notification Badge */}
            <div className="mx-auto w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/25 border border-white/20">
              <Bell className="w-8 h-8 text-white animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-widest text-blue-400 font-semibold">
                Integração com o Celular
              </span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Ativar Notificações & Alarmes
              </h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1.5 leading-relaxed">
                O LIFE OS avisa seus compromissos no horário exato para você não precisar ficar conferindo o app o tempo todo.
              </p>
            </div>

            {/* Feature List */}
            <div className="text-left space-y-2.5 bg-black/30 p-4 rounded-2xl border border-white/5">
              <div className="flex items-start gap-3">
                <span className="text-base">📚</span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Estudos & Revisões</h4>
                  <p className="text-[11px] text-white/50">Lembretes para suas sessões e revisões espaçadas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base">🥋</span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Treinos & Hábitos</h4>
                  <p className="text-[11px] text-white/50">Alarmes para hidratação, exercícios e rotinas diárias.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-base">💰</span>
                <div>
                  <h4 className="text-xs font-semibold text-white">Fechamento do Dia & Finanças</h4>
                  <p className="text-[11px] text-white/50">Aviso noturno para registrar despesas e fechar o dia.</p>
                </div>
              </div>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-white/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% privado. Silencie horários ou desative quando quiser.</span>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleRequest}
                disabled={isRequesting}
                className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 flex items-center justify-center gap-2 transition-all ios-press cursor-pointer"
              >
                {isRequesting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Permitir Notificações no Sistema</span>
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full py-2.5 text-xs text-white/50 hover:text-white transition-colors"
              >
                Mais tarde
              </button>
            </div>
          </div>
        )}

        {step === 'granted' && (
          <div className="space-y-5 py-4">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">Notificações Ativadas!</h2>
              <p className="text-xs sm:text-sm text-white/70 mt-1 leading-relaxed">
                Uma notificação de teste acabou de ser enviada ao seu dispositivo. Seus lembretes e alarmes soarão pontualmente.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all ios-press cursor-pointer"
            >
              Concluir & Voltar ao LIFE OS
            </button>
          </div>
        )}

        {step === 'denied' && (
          <div className="space-y-4 py-2 text-left">
            <div className="mx-auto w-14 h-14 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mb-2">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-white">Permissão Bloqueada pelo Sistema</h3>
              <p className="text-xs text-white/60 mt-1">
                Seu navegador ou celular está configurado para não autorizar notificações nesta página.
              </p>
            </div>

            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2 text-xs text-white/80">
              <p className="font-semibold text-white text-[11px] uppercase tracking-wider">Como desbloquear:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-white/70">
                <li>Toque no ícone de <strong>Cadeado 🔒</strong> ou <strong>Ajustes do Site</strong> na barra de endereços do navegador.</li>
                <li>Procure pela opção <strong>Notificações</strong>.</li>
                <li>Altere de <em>Bloqueado</em> para <strong>Permitir</strong>.</li>
                <li>Recarregue a página para concluir.</li>
              </ol>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all ios-press cursor-pointer"
            >
              Entendido
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
