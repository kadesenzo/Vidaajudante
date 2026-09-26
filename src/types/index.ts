export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferredName: string;
  language: string;
  timeZone: string;
  currency: string;
  wakeTime: string;
  sleepTime: string;
  studiesActive: boolean;
  worksActive: boolean;
  hasProjects: boolean;
  mainGoals: string[];
  forgetfulnessReason: string;
  onboardingCompleted: boolean;
  createdAt: number;
  updatedAt: number;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'postponed' | 'cancelled';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface TaskItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedMinutes?: number;
  projectId?: string;
  tags?: string[];
  isNextAction?: boolean;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface ReminderItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  leadMinutes: number; // 0 (no horário), 5, 10, 15, 30, 60 min antes
  recurrence: 'none' | 'daily' | 'weekdays' | 'weekly' | 'monthly' | 'custom';
  daysOfWeek?: number[]; // [1, 2, 3, 4, 5]
  category: 'Estudo' | 'Treino' | 'Projeto' | 'Financeiro' | 'Rotina' | 'Revisão' | 'Geral';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  isAlarm: boolean; // se é um alarme sonoro / persistente
  alarmTone?: 'radar' | 'chime' | 'waves' | 'crystal' | 'bell';
  enabled: boolean;
  notificationEnabled: boolean;
  completed: boolean;
  completedAt?: number;
  snoozedUntil?: number; // timestamp
  createdAt: number;
  updatedAt: number;
}

export interface NotificationSettings {
  enabled: boolean;
  reminders: boolean;
  routine: boolean;
  studies: boolean;
  tasks: boolean;
  projects: boolean;
  calendar: boolean;
  workouts: boolean;
  reviews: boolean;
  finances: boolean;
  dailyBriefingMorning: boolean; // 08:00
  dailyBriefingEvening: boolean; // 21:00
  quietHoursEnabled: boolean;
  quietStart: string; // "22:00"
  quietEnd: string; // "07:00"
  soundEnabled: boolean;
  soundTone: 'radar' | 'chime' | 'waves' | 'crystal' | 'bell';
  vibrateEnabled: boolean;
  educationalPromptShown?: boolean;
}

export interface StudySubject {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon?: string;
  totalMinutesStudied: number;
  confidenceLevel: number; // 1-5
  createdAt: number;
  updatedAt: number;
}

export interface StudySession {
  id: string;
  userId: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  durationMinutes: number;
  date: string;
  difficulty: 'fácil' | 'médio' | 'difícil';
  masteryLevel: number; // 1 - 5
  memoryRecallSummary?: string; // Free-recall test after session
  questionsSolved?: number;
  questionsCorrect?: number;
  notes?: string;
  nextReviewDate?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewItem {
  id: string;
  userId: string;
  subjectName: string;
  topic: string;
  scheduledDate: string; // YYYY-MM-DD
  intervalDays: number; // 1, 3, 7, 30
  status: 'pending' | 'completed';
  confidenceRating?: number;
  completedAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface HabitItem {
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekdays' | 'custom';
  targetPerDay: number;
  timeOfDay?: string;
  category: string;
  currentStreak: number;
  bestStreak: number;
  history: Record<string, boolean>; // 'YYYY-MM-DD': true
  color: string;
  createdAt: number;
  updatedAt: number;
}

export interface ProjectItem {
  id: string;
  userId: string;
  name: string;
  description: string;
  status: 'idea' | 'planning' | 'active' | 'paused' | 'completed';
  deadline?: string;
  budget?: number;
  spent?: number;
  revenue?: number;
  progressPercent: number;
  nextStep?: string;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface GoalItem {
  id: string;
  userId: string;
  title: string;
  category: 'pessoal' | 'estudos' | 'financeiro' | 'projetos' | 'hábitos' | 'saúde';
  targetValue: number;
  currentValue: number;
  unit: string; // 'R$', 'horas', '%', 'livros', etc.
  deadline?: string;
  status: 'in_progress' | 'completed';
  steps: { id: string; title: string; completed: boolean }[];
  createdAt: number;
  updatedAt: number;
}

export interface RoutineBlock {
  id: string;
  userId: string;
  time: string; // HH:mm
  endTime?: string;
  durationMinutes: number;
  title: string;
  category: string;
  color?: string;
  daysOfWeek: number[]; // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex, 6=Sab
  statusToday?: 'pending' | 'completed' | 'skipped' | 'postponed';
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface FinanceTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  origin?: string;
  projectId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SalesLead {
  id: string;
  userId: string;
  contactName: string;
  company?: string;
  contactChannel: string; // WhatsApp, Email, Instagram, etc.
  productOrService: string;
  value: number;
  status: 'LEAD' | 'ABORDADO' | 'RESPONDEU' | 'CONVERSANDO' | 'PROPOSTA' | 'FECHADO';
  nextAction?: string;
  nextActionDate?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface MemoryNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: 'IDEIA' | 'LEMBRETE' | 'ESTUDO' | 'PROJETO' | 'PESSOAL' | 'FINANCEIRO' | 'OUTRO';
  tags?: string[];
  isPinned?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  dayRating?: number; // 1 to 5
  howWasDay: string;
  whatIDid: string;
  whatILearned: string;
  achievements: string;
  challenges?: string;
  tomorrowFocus?: string;
  doNotForget?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkoutLog {
  id: string;
  userId: string;
  activity: string; // Jiu-jitsu, Corrida, Musculação, Bike, etc.
  durationMinutes: number;
  intensity: 'leve' | 'moderado' | 'intenso';
  notes?: string;
  exercises?: { name: string; sets?: number; reps?: number; weightKg?: number }[];
  date: string;
  createdAt: number;
  updatedAt: number;
}

export interface MealLog {
  id: string;
  userId: string;
  mealType: 'café' | 'almoço' | 'lanche' | 'jantar' | 'água';
  time: string;
  foods: string;
  waterMl?: number;
  notes?: string;
  date: string;
  createdAt: number;
  updatedAt: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'review' | 'goal' | 'finance' | 'routine' | 'system' | 'reminder' | 'alarm';
  read: boolean;
  targetTab?: string;
  createdAt: number;
}
