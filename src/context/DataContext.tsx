import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';
import {
  TaskItem,
  ReminderItem,
  NotificationSettings,
  StudySubject,
  StudySession,
  ReviewItem,
  HabitItem,
  ProjectItem,
  GoalItem,
  RoutineBlock,
  FinanceTransaction,
  SalesLead,
  MemoryNote,
  JournalEntry,
  WorkoutLog,
  MealLog,
  AppNotification
} from '../types';
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  sendDeviceNotification,
  getNotificationPermission,
  registerServiceWorker
} from '../services/notificationService';

interface DataContextType {
  tasks: TaskItem[];
  reminders: ReminderItem[];
  notificationSettings: NotificationSettings;
  subjects: StudySubject[];
  studySessions: StudySession[];
  reviews: ReviewItem[];
  habits: HabitItem[];
  projects: ProjectItem[];
  goals: GoalItem[];
  routines: RoutineBlock[];
  finances: FinanceTransaction[];
  sales: SalesLead[];
  memoryNotes: MemoryNote[];
  journalEntries: JournalEntry[];
  workouts: WorkoutLog[];
  meals: MealLog[];
  notifications: AppNotification[];
  isDataLoading: boolean;

  // Task Actions
  addTask: (task: Omit<TaskItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<TaskItem>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (task: TaskItem) => Promise<void>;
  setAsNextAction: (id: string) => Promise<void>;

  // Reminder Actions
  addReminder: (rem: Omit<ReminderItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReminder: (id: string, updates: Partial<ReminderItem>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  snoozeReminder: (id: string, minutes: number) => Promise<void>;
  completeReminder: (id: string) => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;

  // Routine Actions
  addRoutineBlock: (routine: Omit<RoutineBlock, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRoutineBlock: (id: string, updates: Partial<RoutineBlock>) => Promise<void>;
  deleteRoutineBlock: (id: string) => Promise<void>;

  // Study Actions
  addSubject: (name: string, color: string) => Promise<void>;
  addStudySession: (session: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Review Actions
  addReview: (review: Omit<ReviewItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  completeReview: (id: string, confidenceRating?: number) => Promise<void>;

  // Habit Actions
  addHabit: (habit: Omit<HabitItem, 'id' | 'userId' | 'currentStreak' | 'bestStreak' | 'history' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  toggleHabitDay: (habitId: string, dateStr: string) => Promise<void>;

  // Project Actions
  addProject: (project: Omit<ProjectItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectItem>) => Promise<void>;

  // Goal Actions
  addGoal: (goal: Omit<GoalItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGoal: (id: string, updates: Partial<GoalItem>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;

  // Finance Actions
  addTransaction: (tx: Omit<FinanceTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Sales Actions
  addSalesLead: (lead: Omit<SalesLead, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateSalesLead: (id: string, updates: Partial<SalesLead>) => Promise<void>;
  deleteSalesLead: (id: string) => Promise<void>;

  // Memory Actions
  addMemoryNote: (note: Omit<MemoryNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteMemoryNote: (id: string) => Promise<void>;

  // Journal Actions
  addJournalEntry: (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Workout Actions
  addWorkout: (w: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Meal Actions
  addMeal: (meal: Omit<MealLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;

  // Notifications Actions
  addNotification: (notif: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;

  // Starter Seed
  seedSampleDataIfEmpty: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [subjects, setSubjects] = useState<StudySubject[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [habits, setHabits] = useState<HabitItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [routines, setRoutines] = useState<RoutineBlock[]>([]);
  const [finances, setFinances] = useState<FinanceTransaction[]>([]);
  const [sales, setSales] = useState<SalesLead[]>([]);
  const [memoryNotes, setMemoryNotes] = useState<MemoryNote[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>([]);
  const [meals, setMeals] = useState<MealLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Initialize service worker on mount
  useEffect(() => {
    registerServiceWorker();
  }, []);

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setReminders([]);
      setSubjects([]);
      setStudySessions([]);
      setReviews([]);
      setHabits([]);
      setProjects([]);
      setGoals([]);
      setRoutines([]);
      setFinances([]);
      setSales([]);
      setMemoryNotes([]);
      setJournalEntries([]);
      setWorkouts([]);
      setMeals([]);
      setNotifications([]);
      setIsDataLoading(false);
      return;
    }

    const uid = user.uid;
    setIsDataLoading(true);

    // Listen to notification settings
    const unsubSettings = onSnapshot(doc(db, 'users', uid, 'notificationSettings', 'main'), (snap) => {
      if (snap.exists()) {
        setNotificationSettings({ ...DEFAULT_NOTIFICATION_SETTINGS, ...snap.data() });
      }
    });

    const unsubReminders = onSnapshot(collection(db, 'users', uid, 'reminders'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ReminderItem));
      list.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
      setReminders(list);
    }, (e) => console.warn(e.message));

    const unsubTasks = onSnapshot(collection(db, 'users', uid, 'tasks'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as TaskItem));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTasks(list);
    }, () => setIsDataLoading(false));

    const unsubSubjects = onSnapshot(collection(db, 'users', uid, 'studies'), (snap) => {
      setSubjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as StudySubject)));
    }, (e) => console.warn(e.message));

    const unsubSessions = onSnapshot(collection(db, 'users', uid, 'studySessions'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as StudySession));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setStudySessions(list);
    }, (e) => console.warn(e.message));

    const unsubReviews = onSnapshot(collection(db, 'users', uid, 'reviews'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as ReviewItem));
      list.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
      setReviews(list);
    }, (e) => console.warn(e.message));

    const unsubHabits = onSnapshot(collection(db, 'users', uid, 'habits'), (snap) => {
      setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() } as HabitItem)));
    }, (e) => console.warn(e.message));

    const unsubProjects = onSnapshot(collection(db, 'users', uid, 'projects'), (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as ProjectItem)));
    }, (e) => console.warn(e.message));

    const unsubGoals = onSnapshot(collection(db, 'users', uid, 'goals'), (snap) => {
      setGoals(snap.docs.map(d => ({ id: d.id, ...d.data() } as GoalItem)));
    }, (e) => console.warn(e.message));

    const unsubRoutines = onSnapshot(collection(db, 'users', uid, 'routines'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as RoutineBlock));
      list.sort((a, b) => a.time.localeCompare(b.time));
      setRoutines(list);
    }, (e) => console.warn(e.message));

    const unsubFinances = onSnapshot(collection(db, 'users', uid, 'finances'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as FinanceTransaction));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setFinances(list);
    }, (e) => console.warn(e.message));

    const unsubSales = onSnapshot(collection(db, 'users', uid, 'sales'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as SalesLead));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setSales(list);
    }, (e) => console.warn(e.message));

    const unsubNotes = onSnapshot(collection(db, 'users', uid, 'memory'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MemoryNote));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMemoryNotes(list);
    }, (e) => console.warn(e.message));

    const unsubJournal = onSnapshot(collection(db, 'users', uid, 'journal'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as JournalEntry));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setJournalEntries(list);
    }, (e) => console.warn(e.message));

    const unsubWorkouts = onSnapshot(collection(db, 'users', uid, 'workouts'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as WorkoutLog));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setWorkouts(list);
    }, (e) => console.warn(e.message));

    const unsubMeals = onSnapshot(collection(db, 'users', uid, 'meals'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as MealLog));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setMeals(list);
    }, (e) => console.warn(e.message));

    const unsubNotifs = onSnapshot(collection(db, 'users', uid, 'notifications'), (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as AppNotification));
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setNotifications(list);
      setIsDataLoading(false);
    }, () => setIsDataLoading(false));

    return () => {
      unsubSettings();
      unsubReminders();
      unsubTasks();
      unsubSubjects();
      unsubSessions();
      unsubReviews();
      unsubHabits();
      unsubProjects();
      unsubGoals();
      unsubRoutines();
      unsubFinances();
      unsubSales();
      unsubNotes();
      unsubJournal();
      unsubWorkouts();
      unsubMeals();
      unsubNotifs();
    };
  }, [user]);

  // Client-side scheduler check for reminders, routines, reviews, and smart alerts every 15 seconds
  useEffect(() => {
    if (!user || !notificationSettings.enabled) return;

    const interval = setInterval(() => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentDayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...
      const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;

      // Check quiet hours (Do Not Disturb)
      if (notificationSettings.quietHoursEnabled) {
        const [qStartH] = notificationSettings.quietStart.split(':').map(Number);
        const [qEndH] = notificationSettings.quietEnd.split(':').map(Number);
        if (qStartH > qEndH) {
          if (currentHours >= qStartH || currentHours < qEndH) return;
        } else {
          if (currentHours >= qStartH && currentHours < qEndH) return;
        }
      }

      // 1. Check Specific Scheduled Reminders & Alarms
      if (notificationSettings.reminders) {
        reminders.forEach((rem) => {
          if (!rem.enabled || rem.completed) return;
          if (rem.snoozedUntil && Date.now() < rem.snoozedUntil) return;

          // Calculate lead time in minutes
          const targetTimeDate = new Date(`${rem.date}T${rem.time}:00`);
          if (isNaN(targetTimeDate.getTime())) return;
          targetTimeDate.setMinutes(targetTimeDate.getMinutes() - (rem.leadMinutes || 0));

          const triggerHours = targetTimeDate.getHours();
          const triggerMinutes = targetTimeDate.getMinutes();
          const triggerTimeStr = `${String(triggerHours).padStart(2, '0')}:${String(triggerMinutes).padStart(2, '0')}`;

          if (rem.date === todayStr && currentTimeStr === triggerTimeStr) {
            const cacheKey = `notif_fired_rem_${rem.id}_${rem.date}_${triggerTimeStr}`;
            if (sessionStorage.getItem(cacheKey)) return;
            sessionStorage.setItem(cacheKey, 'true');

            const bodyText = rem.description || `Compromisso marcado para ${rem.time}.`;
            const toneToPlay = rem.alarmTone || notificationSettings.soundTone || (rem.isAlarm ? 'radar' : 'chime');

            sendDeviceNotification(
              rem.title,
              bodyText,
              'reminders',
              rem.id,
              rem.isAlarm,
              {
                category: rem.category,
                tone: toneToPlay,
                soundEnabled: notificationSettings.soundEnabled,
                vibrateEnabled: notificationSettings.vibrateEnabled,
              }
            );

            addNotification({
              title: rem.title,
              message: bodyText,
              type: rem.isAlarm ? 'alarm' : 'reminder',
              read: false,
              targetTab: 'reminders',
            });
          }
        });
      }

      // 2. Check Routine Blocks with Scheduled Times
      if (notificationSettings.routine) {
        routines.forEach((block) => {
          if (!block.time) return;
          const matchesDay = !block.daysOfWeek || block.daysOfWeek.length === 0 || block.daysOfWeek.includes(currentDayOfWeek);
          if (matchesDay && block.time === currentTimeStr) {
            const cacheKey = `notif_fired_routine_${block.id}_${todayStr}_${block.time}`;
            if (sessionStorage.getItem(cacheKey)) return;
            sessionStorage.setItem(cacheKey, 'true');

            const title = `⏰ Rotina: ${block.title}`;
            const body = block.notes || `Início do seu bloco de ${block.category.toLowerCase()} (${block.time}).`;

            sendDeviceNotification(
              title,
              body,
              'routine',
              undefined,
              false,
              {
                category: 'Rotina',
                tone: notificationSettings.soundTone || 'chime',
                soundEnabled: notificationSettings.soundEnabled,
                vibrateEnabled: notificationSettings.vibrateEnabled,
              }
            );

            addNotification({
              title,
              message: body,
              type: 'routine',
              read: false,
              targetTab: 'routine',
            });
          }
        });
      }

      // 3. Spaced Repetition Daily Reviews Check (at 09:00 or 14:00)
      if (notificationSettings.reviews && currentTimeStr === '09:00') {
        const pendingToday = reviews.filter(r => r.status === 'pending' && r.scheduledDate <= todayStr);
        if (pendingToday.length > 0) {
          const cacheKey = `notif_fired_reviews_${todayStr}`;
          if (!sessionStorage.getItem(cacheKey)) {
            sessionStorage.setItem(cacheKey, 'true');
            const title = '🧠 Revisões Espaçadas de Hoje';
            const body = `Você tem ${pendingToday.length} conteúdo(s) pendente(s) para revisar hoje.`;

            sendDeviceNotification(
              title,
              body,
              'reviews',
              undefined,
              false,
              {
                category: 'Revisão',
                tone: 'crystal',
                soundEnabled: notificationSettings.soundEnabled,
                vibrateEnabled: notificationSettings.vibrateEnabled,
              }
            );

            addNotification({
              title,
              message: body,
              type: 'review',
              read: false,
              targetTab: 'reviews',
            });
          }
        }
      }

      // 4. Daily Financial Closing Check (at 20:00)
      if (notificationSettings.finances && currentTimeStr === '20:00') {
        const cacheKey = `notif_fired_finances_${todayStr}`;
        if (!sessionStorage.getItem(cacheKey)) {
          sessionStorage.setItem(cacheKey, 'true');
          const title = '💰 Fechamento Financeiro';
          const body = 'Hora de registrar suas receitas e despesas de hoje no LIFE OS.';

          sendDeviceNotification(
            title,
            body,
            'finances',
            undefined,
            false,
            {
              category: 'Financeiro',
              tone: 'chime',
              soundEnabled: notificationSettings.soundEnabled,
              vibrateEnabled: notificationSettings.vibrateEnabled,
            }
          );

          addNotification({
            title,
            message: body,
            type: 'finance',
            read: false,
            targetTab: 'finances',
          });
        }
      }

      // 5. Morning Briefing Notification (at 08:00)
      if (notificationSettings.dailyBriefingMorning && currentTimeStr === '08:00') {
        const cacheKey = `notif_fired_briefing_morning_${todayStr}`;
        if (!sessionStorage.getItem(cacheKey)) {
          sessionStorage.setItem(cacheKey, 'true');
          const title = '☀️ Bom dia no LIFE OS';
          const body = 'Veja o que você planejou para o seu dia e sua primeira meta de hoje.';

          sendDeviceNotification(
            title,
            body,
            'dashboard',
            undefined,
            false,
            {
              category: 'Geral',
              tone: 'waves',
              soundEnabled: notificationSettings.soundEnabled,
              vibrateEnabled: notificationSettings.vibrateEnabled,
            }
          );
        }
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [user, reminders, routines, reviews, notificationSettings]);

  // Reminder Actions
  const addReminder = async (rem: Omit<ReminderItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...rem, userId: user.uid, createdAt: now, updatedAt: now };
    setReminders(prev => [...prev, { ...docData, id: 'tmp_' + now }]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'reminders'), docData);
      setReminders(prev => prev.map(r => r.id === 'tmp_' + now ? { ...r, id: ref.id } : r));
    } catch (e) {
      console.warn('Add reminder fallback:', e);
    }
  };

  const updateReminder = async (id: string, updates: Partial<ReminderItem>) => {
    if (!user) return;
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'reminders', id), { ...updates, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Update reminder fallback:', e);
    }
  };

  const deleteReminder = async (id: string) => {
    if (!user) return;
    setReminders(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reminders', id));
    } catch (e) {
      console.warn('Delete reminder fallback:', e);
    }
  };

  const snoozeReminder = async (id: string, minutes: number) => {
    const snoozedUntil = Date.now() + minutes * 60 * 1000;
    await updateReminder(id, { snoozedUntil });
  };

  const completeReminder = async (id: string) => {
    await updateReminder(id, { completed: true, completedAt: Date.now() });
  };

  const updateNotificationSettings = async (settings: Partial<NotificationSettings>) => {
    if (!user) return;
    const updated = { ...notificationSettings, ...settings };
    setNotificationSettings(updated);
    try {
      await setDoc(doc(db, 'users', user.uid, 'notificationSettings', 'main'), updated, { merge: true });
    } catch (e) {
      console.warn('Notification settings fallback:', e);
    }
  };

  // Tasks
  const addTask = async (task: Omit<TaskItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...task, userId: user.uid, createdAt: now, updatedAt: now };
    setTasks(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'tasks'), docData);
      setTasks(prev => prev.map(t => t.id === 'tmp_' + now ? { ...t, id: ref.id } : t));
    } catch (e) {
      console.warn('Task add fallback:', e);
    }
  };

  const updateTask = async (id: string, updates: Partial<TaskItem>) => {
    if (!user) return;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { ...updates, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Task update fallback:', e);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'tasks', id));
    } catch (e) {
      console.warn('Task delete fallback:', e);
    }
  };

  const toggleTaskCompleted = async (task: TaskItem) => {
    if (!user) return;
    const isNowDone = task.status !== 'completed';
    const updates = {
      status: (isNowDone ? 'completed' : 'todo') as any,
      completedAt: isNowDone ? Date.now() : undefined,
      updatedAt: Date.now(),
    };
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, ...updates } : t));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'tasks', task.id), updates);
    } catch (e) {
      console.warn('Toggle task fallback:', e);
    }
  };

  const setAsNextAction = async (id: string) => {
    if (!user) return;
    setTasks(prev => prev.map(t => ({ ...t, isNextAction: t.id === id })));
    try {
      for (const t of tasks) {
        if (t.isNextAction && t.id !== id) {
          await updateDoc(doc(db, 'users', user.uid, 'tasks', t.id), { isNextAction: false });
        }
      }
      await updateDoc(doc(db, 'users', user.uid, 'tasks', id), { isNextAction: true, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Set next action fallback:', e);
    }
  };

  // Routine
  const addRoutineBlock = async (routine: Omit<RoutineBlock, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...routine, userId: user.uid, createdAt: now, updatedAt: now };
    setRoutines(prev => [...prev, { ...docData, id: 'tmp_' + now }].sort((a, b) => a.time.localeCompare(b.time)));
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'routines'), docData);
      setRoutines(prev => prev.map(r => r.id === 'tmp_' + now ? { ...r, id: ref.id } : r));
    } catch (e) {
      console.warn('Routine add fallback:', e);
    }
  };

  const updateRoutineBlock = async (id: string, updates: Partial<RoutineBlock>) => {
    if (!user) return;
    setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...updates, updatedAt: Date.now() } : r));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'routines', id), { ...updates, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Routine update fallback:', e);
    }
  };

  const deleteRoutineBlock = async (id: string) => {
    if (!user) return;
    setRoutines(prev => prev.filter(r => r.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'routines', id));
    } catch (e) {
      console.warn('Routine delete fallback:', e);
    }
  };

  // Studies
  const addSubject = async (name: string, color: string) => {
    if (!user) return;
    const now = Date.now();
    const docData = { userId: user.uid, name, color, totalMinutesStudied: 0, confidenceLevel: 3, createdAt: now, updatedAt: now };
    setSubjects(prev => [...prev, { ...docData, id: 'tmp_' + now }]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'studies'), docData);
      setSubjects(prev => prev.map(s => s.id === 'tmp_' + now ? { ...s, id: ref.id } : s));
    } catch (e) {
      console.warn('Subject add fallback:', e);
    }
  };

  const addStudySession = async (session: Omit<StudySession, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...session, userId: user.uid, createdAt: now, updatedAt: now };
    setStudySessions(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'studySessions'), docData);
      setStudySessions(prev => prev.map(s => s.id === 'tmp_' + now ? { ...s, id: ref.id } : s));

      // Schedule spaced reviews
      const dateObj = new Date();
      const intervals = [1, 3, 7, 30];
      for (const d of intervals) {
        const revDate = new Date();
        revDate.setDate(dateObj.getDate() + d);
        const dateStr = revDate.toISOString().split('T')[0];
        await addReview({
          subjectName: session.subjectName,
          topic: session.topic,
          scheduledDate: dateStr,
          intervalDays: d,
          status: 'pending',
        });
      }
    } catch (e) {
      console.warn('Study session fallback:', e);
    }
  };

  // Reviews
  const addReview = async (review: Omit<ReviewItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...review, userId: user.uid, createdAt: now, updatedAt: now };
    setReviews(prev => [...prev, { ...docData, id: 'tmp_' + now }]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'reviews'), docData);
      setReviews(prev => prev.map(r => r.id === 'tmp_' + now ? { ...r, id: ref.id } : r));
    } catch (e) {
      console.warn('Add review fallback:', e);
    }
  };

  const completeReview = async (id: string, confidenceRating: number = 4) => {
    if (!user) return;
    const updates = { status: 'completed' as const, confidenceRating, completedAt: Date.now(), updatedAt: Date.now() };
    setReviews(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'reviews', id), updates);
    } catch (e) {
      console.warn('Complete review fallback:', e);
    }
  };

  // Habits
  const addHabit = async (habit: Omit<HabitItem, 'id' | 'userId' | 'currentStreak' | 'bestStreak' | 'history' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...habit, userId: user.uid, currentStreak: 0, bestStreak: 0, history: {}, createdAt: now, updatedAt: now };
    setHabits(prev => [...prev, { ...docData, id: 'tmp_' + now }]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'habits'), docData);
      setHabits(prev => prev.map(h => h.id === 'tmp_' + now ? { ...h, id: ref.id } : h));
    } catch (e) {
      console.warn('Add habit fallback:', e);
    }
  };

  const toggleHabitDay = async (habitId: string, dateStr: string) => {
    if (!user) return;
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    const newHistory = { ...habit.history };
    if (newHistory[dateStr]) delete newHistory[dateStr];
    else newHistory[dateStr] = true;
    const streak = Object.keys(newHistory).length;
    const best = Math.max(habit.bestStreak || 0, streak);
    setHabits(prev => prev.map(h => h.id === habitId ? { ...h, history: newHistory, currentStreak: streak, bestStreak: best } : h));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'habits', habitId), {
        history: newHistory,
        currentStreak: streak,
        bestStreak: best,
        updatedAt: Date.now(),
      });
    } catch (e) {
      console.warn('Toggle habit fallback:', e);
    }
  };

  // Projects
  const addProject = async (proj: Omit<ProjectItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...proj, userId: user.uid, createdAt: now, updatedAt: now };
    setProjects(prev => [...prev, { ...docData, id: 'tmp_' + now }]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'projects'), docData);
      setProjects(prev => prev.map(p => p.id === 'tmp_' + now ? { ...p, id: ref.id } : p));
    } catch (e) {
      console.warn('Add project fallback:', e);
    }
  };

  const updateProject = async (id: string, updates: Partial<ProjectItem>) => {
    if (!user) return;
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'projects', id), { ...updates, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Update project fallback:', e);
    }
  };

  // Goals
  const addGoal = async (goal: Omit<GoalItem, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...goal, userId: user.uid, createdAt: now, updatedAt: now };
    setGoals(prev => [...prev, { ...docData, id: 'tmp_' + now }]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'goals'), docData);
      setGoals(prev => prev.map(g => g.id === 'tmp_' + now ? { ...g, id: ref.id } : g));
    } catch (e) {
      console.warn('Add goal fallback:', e);
    }
  };

  const updateGoal = async (id: string, updates: Partial<GoalItem>) => {
    if (!user) return;
    setGoals(prev => prev.map(g => g.id === id ? { ...g, ...updates, updatedAt: Date.now() } : g));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'goals', id), { ...updates, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Update goal fallback:', e);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!user) return;
    setGoals(prev => prev.filter(g => g.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'goals', id));
    } catch (e) {
      console.warn('Delete goal fallback:', e);
    }
  };

  // Finances
  const addTransaction = async (tx: Omit<FinanceTransaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...tx, userId: user.uid, createdAt: now, updatedAt: now };
    setFinances(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'finances'), docData);
      setFinances(prev => prev.map(f => f.id === 'tmp_' + now ? { ...f, id: ref.id } : f));
    } catch (e) {
      console.warn('Add finance fallback:', e);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    setFinances(prev => prev.filter(f => f.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'finances', id));
    } catch (e) {
      console.warn('Delete finance fallback:', e);
    }
  };

  // Sales
  const addSalesLead = async (lead: Omit<SalesLead, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...lead, userId: user.uid, createdAt: now, updatedAt: now };
    setSales(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'sales'), docData);
      setSales(prev => prev.map(s => s.id === 'tmp_' + now ? { ...s, id: ref.id } : s));
    } catch (e) {
      console.warn('Add sales fallback:', e);
    }
  };

  const updateSalesLead = async (id: string, updates: Partial<SalesLead>) => {
    if (!user) return;
    setSales(prev => prev.map(s => s.id === id ? { ...s, ...updates, updatedAt: Date.now() } : s));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'sales', id), { ...updates, updatedAt: Date.now() });
    } catch (e) {
      console.warn('Update sales fallback:', e);
    }
  };

  const deleteSalesLead = async (id: string) => {
    if (!user) return;
    setSales(prev => prev.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'sales', id));
    } catch (e) {
      console.warn('Delete sales fallback:', e);
    }
  };

  // Memory
  const addMemoryNote = async (note: Omit<MemoryNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...note, userId: user.uid, createdAt: now, updatedAt: now };
    setMemoryNotes(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'memory'), docData);
      setMemoryNotes(prev => prev.map(m => m.id === 'tmp_' + now ? { ...m, id: ref.id } : m));
    } catch (e) {
      console.warn('Add memory fallback:', e);
    }
  };

  const deleteMemoryNote = async (id: string) => {
    if (!user) return;
    setMemoryNotes(prev => prev.filter(m => m.id !== id));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'memory', id));
    } catch (e) {
      console.warn('Delete memory fallback:', e);
    }
  };

  // Journal
  const addJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...entry, userId: user.uid, createdAt: now, updatedAt: now };
    setJournalEntries(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'journal'), docData);
      setJournalEntries(prev => prev.map(j => j.id === 'tmp_' + now ? { ...j, id: ref.id } : j));
    } catch (e) {
      console.warn('Add journal fallback:', e);
    }
  };

  // Workouts
  const addWorkout = async (w: Omit<WorkoutLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...w, userId: user.uid, createdAt: now, updatedAt: now };
    setWorkouts(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'workouts'), docData);
      setWorkouts(prev => prev.map(wk => wk.id === 'tmp_' + now ? { ...wk, id: ref.id } : wk));
    } catch (e) {
      console.warn('Add workout fallback:', e);
    }
  };

  // Meals
  const addMeal = async (meal: Omit<MealLog, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...meal, userId: user.uid, createdAt: now, updatedAt: now };
    setMeals(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'meals'), docData);
      setMeals(prev => prev.map(m => m.id === 'tmp_' + now ? { ...m, id: ref.id } : m));
    } catch (e) {
      console.warn('Add meal fallback:', e);
    }
  };

  // Notifications
  const addNotification = async (notif: Omit<AppNotification, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const now = Date.now();
    const docData = { ...notif, userId: user.uid, createdAt: now };
    setNotifications(prev => [{ ...docData, id: 'tmp_' + now }, ...prev]);
    try {
      const ref = await addDoc(collection(db, 'users', user.uid, 'notifications'), docData);
      setNotifications(prev => prev.map(n => n.id === 'tmp_' + now ? { ...n, id: ref.id } : n));
    } catch (e) {
      console.warn('Add notification fallback:', e);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!user) return;
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await updateDoc(doc(db, 'users', user.uid, 'notifications', id), { read: true });
    } catch (e) {
      console.warn('Notification read fallback:', e);
    }
  };

  const clearAllNotifications = async () => {
    if (!user) return;
    const list = [...notifications];
    setNotifications([]);
    try {
      for (const n of list) {
        await deleteDoc(doc(db, 'users', user.uid, 'notifications', n.id));
      }
    } catch (e) {
      console.warn('Clear notifications fallback:', e);
    }
  };

  // Initial starter pack
  const seedSampleDataIfEmpty = async () => {
    if (!user) return;
    if (tasks.length > 0 || habits.length > 0 || reminders.length > 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    // Starter Reminders / Alarm
    await addReminder({
      title: 'Estudar programação (React & TypeScript)',
      description: 'Construir a camada de lembretes e alarmes do LIFE OS',
      date: todayStr,
      time: '16:00',
      leadMinutes: 10,
      recurrence: 'weekdays',
      category: 'Estudo',
      priority: 'high',
      isAlarm: true,
      enabled: true,
      notificationEnabled: true,
      completed: false,
    });

    await addReminder({
      title: 'Treino de Jiu-jitsu / Musculação',
      description: 'Preparar kimono e garrafa de água',
      date: todayStr,
      time: '18:30',
      leadMinutes: 15,
      recurrence: 'custom',
      daysOfWeek: [1, 3, 5],
      category: 'Treino',
      priority: 'urgent',
      isAlarm: false,
      enabled: true,
      notificationEnabled: true,
      completed: false,
    });

    await addTask({
      title: 'Estudar matemática por 30 minutos',
      description: 'Revisar funções e potenciação com exercícios práticos',
      priority: 'urgent',
      status: 'todo',
      category: 'Estudos',
      dueDate: todayStr,
      dueTime: '17:00',
      estimatedMinutes: 30,
      isNextAction: true,
    });

    await addRoutineBlock({
      time: '08:00',
      endTime: '08:30',
      durationMinutes: 30,
      title: 'Acordar & Água / Café',
      category: 'Saúde',
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      statusToday: 'completed',
    });

    await addGoal({
      title: 'Comprar Computador de Trabalho',
      category: 'financeiro',
      targetValue: 5000,
      currentValue: 2000,
      unit: 'R$',
      status: 'in_progress',
      steps: [
        { id: '1', title: 'Pesquisar modelos custo-benefício', completed: true },
        { id: '2', title: 'Poupar R$ 2.000 iniciais', completed: true },
        { id: '3', title: 'Atingir meta de R$ 5.000', completed: false },
      ],
    });

    await addHabit({
      name: 'Beber 2.5L de água',
      frequency: 'daily',
      targetPerDay: 1,
      category: 'Saúde',
      color: '#64D2FF',
    });
  };

  return (
    <DataContext.Provider
      value={{
        tasks,
        reminders,
        notificationSettings,
        subjects,
        studySessions,
        reviews,
        habits,
        projects,
        goals,
        routines,
        finances,
        sales,
        memoryNotes,
        journalEntries,
        workouts,
        meals,
        notifications,
        isDataLoading,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        setAsNextAction,
        addReminder,
        updateReminder,
        deleteReminder,
        snoozeReminder,
        completeReminder,
        updateNotificationSettings,
        addRoutineBlock,
        updateRoutineBlock,
        deleteRoutineBlock,
        addSubject,
        addStudySession,
        addReview,
        completeReview,
        addHabit,
        toggleHabitDay,
        addProject,
        updateProject,
        addGoal,
        updateGoal,
        deleteGoal,
        addTransaction,
        deleteTransaction,
        addSalesLead,
        updateSalesLead,
        deleteSalesLead,
        addMemoryNote,
        deleteMemoryNote,
        addJournalEntry,
        addWorkout,
        addMeal,
        addNotification,
        markNotificationRead,
        clearAllNotifications,
        seedSampleDataIfEmpty,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
