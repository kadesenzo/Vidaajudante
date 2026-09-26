import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  AlarmClock,
  Clock,
  Check,
  X,
  Volume2,
  ArrowRight
} from 'lucide-react';
import { useData } from '../context/DataContext';

interface ToastData {
  title: string;
  body: string;
  category: string;
  categoryIcon: string;
  targetTab?: string;
  reminderId?: string;
  isAlarm?: boolean;
  timestamp: string;
}

export const NotificationToast: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const { snoozeReminder, completeReminder } = useData();
  const [currentToast, setCurrentToast] = useState<ToastData | null>(null);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ToastData>;
      if (customEvent.detail) {
        setCurrentToast(customEvent.detail);
      }
    };

    window.addEventListener('life-os-notification-toast', handleToastEvent);
    return () => window.removeEventListener('life-os-notification-toast', handleToastEvent);
  }, []);

  // Auto-dismiss after 8 seconds for regular notifications (alarms stay longer or user clicks)
  useEffect(() => {
    if (!currentToast) return;
    if (currentToast.isAlarm) return;

    const timer = setTimeout(() => {
      setCurrentToast(null);
    }, 7000);

    return () => clearTimeout(timer);
  }, [currentToast]);

  if (!currentToast) return null;

  const handleSnooze = () => {
    if (currentToast.reminderId) {
      snoozeReminder(currentToast.reminderId, 10);
    }
    setCurrentToast(null);
  };

  const handleComplete = () => {
    if (currentToast.reminderId) {
      completeReminder(currentToast.reminderId);
    }
    setCurrentToast(null);
  };

  const handleClick = () => {
    if (currentToast.targetTab && onNavigate) {
      onNavigate(currentToast.targetTab);
    }
    setCurrentToast(null);
  };

  return (
    <div className="fixed top-4 inset-x-0 z-50 flex justify-center pointer-events-none px-4">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 450, damping: 30 }}
          className={`pointer-events-auto max-w-md w-full bg-[#18181c]/95 backdrop-blur-2xl border p-4 rounded-[28px] shadow-2xl flex flex-col gap-3 ${
            currentToast.isAlarm
              ? 'border-amber-500/40 shadow-amber-500/10 ring-1 ring-amber-500/30'
              : 'border-white/15 shadow-black/60'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0" onClick={handleClick}>
              {/* Category Icon */}
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-md ${
                  currentToast.isAlarm
                    ? 'bg-amber-500/20 border border-amber-500/30'
                    : 'bg-blue-500/20 border border-blue-500/30'
                }`}
              >
                {currentToast.categoryIcon || '🔔'}
              </div>

              {/* Texts */}
              <div className="min-w-0 cursor-pointer">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-white/80">
                    {currentToast.category}
                  </span>
                  <span className="text-[10px] text-white/40 font-mono">
                    {currentToast.timestamp}
                  </span>
                  {currentToast.isAlarm && (
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                      <AlarmClock className="w-3 h-3" /> ALARME
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white truncate mt-0.5">
                  {currentToast.title}
                </h4>
                <p className="text-xs text-white/70 line-clamp-1 mt-0.5">
                  {currentToast.body}
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setCurrentToast(null)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/5">
            {currentToast.reminderId ? (
              <>
                <button
                  onClick={handleSnooze}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-all"
                >
                  Adiar 10m
                </button>
                <button
                  onClick={handleComplete}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md flex items-center gap-1 transition-all"
                >
                  <Check className="w-3 h-3" /> Concluir
                </button>
              </>
            ) : (
              <button
                onClick={handleClick}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md flex items-center gap-1 transition-all"
              >
                Abrir <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
