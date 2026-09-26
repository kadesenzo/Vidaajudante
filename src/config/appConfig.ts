export interface AppThemeConfig {
  appName: string;
  appShortName: string;
  tagline: string;
  logoIcon: string;
  version: string;
  primaryColor: string; // hex
  secondaryColor: string;
  accentColor: string;
  defaultCurrency: string; // 'BRL' | 'USD' | 'EUR'
  currencySymbol: string;
  dateFormat: string;
  enabledModules: {
    dashboard: boolean;
    tasks: boolean;
    studies: boolean;
    habits: boolean;
    routine: boolean;
    projects: boolean;
    finances: boolean;
    workouts: boolean;
    memory: boolean;
    ai: boolean;
    settings: boolean;
  };
  moduleLabels: Record<string, string>;
  quickCaptureActions: { id: string; label: string; icon: string; category: string }[];
}

export const DEFAULT_APP_CONFIG: AppThemeConfig = {
  appName: 'LIFE OS',
  appShortName: 'LIFE',
  tagline: 'Seu sistema operacional pessoal',
  logoIcon: 'Layers',
  version: '2.6.0',
  primaryColor: '#0A84FF', // iOS Blue
  secondaryColor: '#5E5CE6', // iOS Indigo
  accentColor: '#30D158', // iOS Green
  defaultCurrency: 'BRL',
  currencySymbol: 'R$',
  dateFormat: 'DD/MM/YYYY',
  enabledModules: {
    dashboard: true,
    tasks: true,
    studies: true,
    habits: true,
    routine: true,
    projects: true,
    finances: true,
    workouts: true,
    memory: true,
    ai: true,
    settings: true,
  },
  moduleLabels: {
    dashboard: 'Hoje & Agora',
    tasks: 'Tarefas',
    studies: 'Estudos',
    habits: 'Hábitos',
    routine: 'Rotina',
    projects: 'Projetos',
    finances: 'Finanças',
    workouts: 'Treinos',
    memory: 'Memória',
    ai: 'LIFE AI',
    settings: 'Ajustes',
  },
  quickCaptureActions: [
    { id: 'task', label: 'Nova Tarefa', icon: 'CheckCircle2', category: 'tasks' },
    { id: 'study', label: 'Sessão de Estudo', icon: 'GraduationCap', category: 'studies' },
    { id: 'habit', label: 'Novo Hábito', icon: 'Flame', category: 'habits' },
    { id: 'memory', label: 'Nota / Memória', icon: 'Sparkles', category: 'memory' },
    { id: 'finance', label: 'Registro Financeiro', icon: 'Wallet', category: 'finances' },
    { id: 'workout', label: 'Registro de Treino', icon: 'Dumbbell', category: 'workouts' },
    { id: 'project', label: 'Novo Projeto', icon: 'FolderKanban', category: 'projects' },
  ],
};
