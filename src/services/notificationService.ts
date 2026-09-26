// Browser Web Notification Service & Audio Tone Generator
import { ReminderItem, NotificationSettings } from '../types';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: true,
  reminders: true,
  routine: true,
  studies: true,
  tasks: true,
  projects: true,
  calendar: true,
  workouts: true,
  reviews: true,
  finances: true,
  dailyBriefingMorning: true,
  dailyBriefingEvening: true,
  quietHoursEnabled: true,
  quietStart: '22:00',
  quietEnd: '07:00',
  soundEnabled: true,
  soundTone: 'chime',
  vibrateEnabled: true,
  educationalPromptShown: false,
};

// Check current notification permission state
export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export function getNotificationPermission(): NotificationPermissionState {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission as NotificationPermissionState;
}

// Request permission with system API
export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'unsupported';
  }
  try {
    const result = await Notification.requestPermission();
    return result as NotificationPermissionState;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Register service worker if available
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    const reg = await navigator.serviceWorker.register('/sw.js');
    return reg;
  } catch (err) {
    console.warn('Service worker registration failed:', err);
    return null;
  }
}

// Available alarm tones list for UI selectors
export const AVAILABLE_SOUND_TONES: Array<{
  id: 'radar' | 'chime' | 'waves' | 'crystal' | 'bell';
  name: string;
  description: string;
  icon: string;
}> = [
  { id: 'chime', name: 'Chime Suave', description: 'Harmonia límpida em 3 notas acústicas', icon: '✨' },
  { id: 'radar', name: 'Radar Apple', description: 'Toque ritmado clássico de alerta duplo', icon: '📡' },
  { id: 'crystal', name: 'Cristal Puro', description: 'Toque agudo reluzente de alta clareza', icon: '💎' },
  { id: 'waves', name: 'Ondas Serenas', description: 'Transição suave relaxante e orgânica', icon: '🌊' },
  { id: 'bell', name: 'Sino Zen', description: 'Sino de meditação com eco suave', icon: '🔔' },
];

// Play pleasant Apple-like notification chime using Web Audio API
export function playNotificationTone(
  tone: 'radar' | 'chime' | 'waves' | 'crystal' | 'bell' = 'chime',
  isAlarm: boolean = false
) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    switch (tone) {
      case 'radar': {
        // Classic rhythm alert: 2 high pulses with resonance
        const pulses = [0, 0.22];
        pulses.forEach(startOffset => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(isAlarm ? 1046.5 : 880, t + startOffset); // C6 or A5
          gain.gain.setValueAtTime(0.3, t + startOffset);
          gain.gain.exponentialRampToValueAtTime(0.001, t + startOffset + 0.18);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + startOffset);
          osc.stop(t + startOffset + 0.2);
        });
        if (isAlarm) {
          // Extra repeat for alarm
          setTimeout(() => playNotificationTone('radar', false), 450);
        }
        break;
      }

      case 'crystal': {
        // Crystalline harmonics
        const notes = [1046.5, 1318.51, 1567.98]; // C6, E6, G6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.08);
          gain.gain.setValueAtTime(0.25, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.45);
        });
        break;
      }

      case 'waves': {
        // Smooth swell
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, t); // A4
        osc.frequency.exponentialRampToValueAtTime(659.25, t + 0.25); // E5
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.5); // A5

        gain.gain.setValueAtTime(0.01, t);
        gain.gain.linearRampToValueAtTime(0.28, t + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.75);
        break;
      }

      case 'bell': {
        // Meditation bell with natural overtone
        [587.33, 1174.66].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(i === 0 ? 0.3 : 0.1, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.95);
        });
        break;
      }

      case 'chime':
      default: {
        // Elegant ascending chord (C5 -> E5 -> G5)
        const triad = [523.25, 659.25, 783.99];
        triad.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t + idx * 0.1);
          gain.gain.setValueAtTime(0.25, t + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.55);
        });
        break;
      }
    }
  } catch (e) {
    // Ignore audio restriction errors
  }
}

// Category icon map for notifications
export const CATEGORY_ICONS: Record<string, string> = {
  Estudo: '📚',
  Treino: '🥋',
  Projeto: '💼',
  Financeiro: '💰',
  Rotina: '⏰',
  Revisão: '🧠',
  Geral: '⚡',
};

export interface DeviceNotificationOptions {
  title: string;
  body: string;
  targetTab?: string;
  reminderId?: string;
  isAlarm?: boolean;
  category?: string;
  tone?: 'radar' | 'chime' | 'waves' | 'crystal' | 'bell';
  soundEnabled?: boolean;
  vibrateEnabled?: boolean;
}

// Send local push notification to device & trigger in-app toast event
export async function sendDeviceNotification(
  title: string,
  body: string,
  targetTab: string = 'reminders',
  reminderId?: string,
  isAlarm: boolean = false,
  options?: Partial<DeviceNotificationOptions>
) {
  const perm = getNotificationPermission();
  const category = options?.category || 'Geral';
  const categoryIcon = CATEGORY_ICONS[category] || '🔔';
  const fullTitle = `${categoryIcon} ${title}`;
  const tone = options?.tone || (isAlarm ? 'radar' : 'chime');

  // Trigger sound if enabled
  if (options?.soundEnabled !== false) {
    playNotificationTone(tone, isAlarm);
  }

  // Trigger vibration if enabled and available
  if (options?.vibrateEnabled !== false && 'vibrate' in navigator) {
    try {
      navigator.vibrate(isAlarm ? [350, 150, 350, 150, 500] : [200, 100, 200]);
    } catch (e) {}
  }

  // Broadcast in-app custom event for the Dynamic Island floating toast
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('life-os-notification-toast', {
        detail: {
          title,
          body,
          category,
          categoryIcon,
          targetTab,
          reminderId,
          isAlarm,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      })
    );
  }

  // If system notifications permission is not granted, stop here (app still displays in-app toast)
  if (perm !== 'granted') return false;

  // Try service worker first
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg && typeof reg.showNotification === 'function') {
        await (reg as any).showNotification(fullTitle, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          data: { tab: targetTab, reminderId },
          actions: isAlarm
            ? [
                { action: 'snooze', title: 'Adiar 10m' },
                { action: 'done', title: 'Concluído' },
              ]
            : [{ action: 'open', title: 'Ver no LIFE OS' }],
        });
        return true;
      }
    } catch (swErr) {
      console.warn('Service worker showNotification fallback:', swErr);
    }
  }

  // Fallback to standard Notification object
  try {
    const n = new Notification(fullTitle, {
      body,
      icon: '/favicon.ico',
      data: { tab: targetTab, reminderId },
    });
    n.onclick = () => {
      window.focus();
      window.dispatchEvent(
        new CustomEvent('life-os-navigate', { detail: { tab: targetTab, reminderId } })
      );
      n.close();
    };
    return true;
  } catch (err) {
    console.warn('Failed to dispatch desktop notification:', err);
    return false;
  }
}
