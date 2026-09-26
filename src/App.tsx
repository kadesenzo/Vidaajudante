import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  CheckSquare,
  GraduationCap,
  Flame,
  FolderKanban,
  Wallet,
  Sparkles,
  Bot,
  Settings,
  Plus,
  Command,
  Search,
  Bell,
  Menu,
  X,
  Clock,
  RotateCcw,
  Target,
  Users,
  Calendar as CalendarIcon,
  Book,
  TrendingUp,
  Utensils,
  AlarmClock
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useData } from './context/DataContext';
import { DEFAULT_APP_CONFIG } from './config/appConfig';
import { AuthScreen } from './components/AuthScreen';
import { OnboardingQuiz } from './components/OnboardingQuiz';
import { DashboardView } from './components/DashboardView';
import { TasksView } from './components/TasksView';
import { RemindersView } from './components/RemindersView';
import { StudiesView } from './components/StudiesView';
import { HabitsView } from './components/HabitsView';
import { RoutineView } from './components/RoutineView';
import { CalendarView } from './components/CalendarView';
import { GoalsView } from './components/GoalsView';
import { ReviewsView } from './components/ReviewsView';
import { ProjectsView } from './components/ProjectsView';
import { FinancesView } from './components/FinancesView';
import { SalesView } from './components/SalesView';
import { MemoryView } from './components/MemoryView';
import { JournalView } from './components/JournalView';
import { MealsView } from './components/MealsView';
import { ProgressReportsView } from './components/ProgressReportsView';
import { NotificationsCenterView } from './components/NotificationsCenterView';
import { AiAssistantView } from './components/AiAssistantView';
import { SettingsView } from './components/SettingsView';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { NotificationToast } from './components/NotificationToast';
import { LifeOsLogo } from './components/LifeOsLogo';

export default function App() {
  const { user, profile, loading, isRestoringSession } = useAuth();
  const { notifications, reminders } = useData();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState<boolean>(false);
  const [quickCaptureTab, setQuickCaptureTab] = useState<any>('task');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isRedoingOnboarding, setIsRedoingOnboarding] = useState<boolean>(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState<boolean>(false);

  // Global Quick Capture trigger helper
  const handleOpenQuickCapture = (tab: any = 'task') => {
    setQuickCaptureTab(tab);
    setIsQuickCaptureOpen(true);
  };

  // Keyboard shortcut Cmd+K or Ctrl+K for search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Listen to navigation events from web notifications
  React.useEffect(() => {
    const handleCustomNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.tab) {
        setActiveTab(customEvent.detail.tab);
      }
    };
    window.addEventListener('life-os-navigate', handleCustomNav);
    return () => window.removeEventListener('life-os-navigate', handleCustomNav);
  }, []);

  if (loading || isRestoringSession) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-5 select-none">
        <div className="relative">
          <LifeOsLogo variant="icon" size="lg" className="animate-pulse drop-shadow-[0_0_24px_rgba(0,180,255,0.4)]" />
        </div>
        <div className="flex flex-col items-center space-y-1.5">
          <div className="w-5 h-5 border-2 border-white/20 border-t-sky-400 rounded-full animate-spin" />
          <p className="text-white/60 font-mono text-[11px] tracking-widest mt-2 uppercase">
            {isRestoringSession ? 'Restaurando sua sessão no aparelho...' : 'Carregando Life OS...'}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (!profile?.onboardingCompleted || isRedoingOnboarding) {
    return <OnboardingQuiz onComplete={() => setIsRedoingOnboarding(false)} />;
  }

  const unreadNotifs = notifications.filter(n => !n.read).length;
  const activeRemindersCount = reminders.filter(r => !r.completed).length;

  // Primary Sidebar Items
  const primaryNavItems = [
    { id: 'dashboard', label: 'Hoje & Agora', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'reminders', label: 'Lembretes', icon: AlarmClock, badge: activeRemindersCount },
    { id: 'routine', label: 'Rotina', icon: Clock },
    { id: 'studies', label: 'Estudos', icon: GraduationCap },
    { id: 'reviews', label: 'Revisões', icon: RotateCcw },
    { id: 'habits', label: 'Hábitos', icon: Flame },
    { id: 'calendar', label: 'Calendário', icon: CalendarIcon },
  ];

  // Secondary Menu Items
  const secondaryNavItems = [
    { id: 'projects', label: 'Projetos', icon: FolderKanban },
    { id: 'goals', label: 'Metas', icon: Target },
    { id: 'finances', label: 'Finanças', icon: Wallet },
    { id: 'sales', label: 'Vendas', icon: Users },
    { id: 'memory', label: 'Memória', icon: Sparkles },
    { id: 'journal', label: 'Diário', icon: Book },
    { id: 'meals', label: 'Alimentação', icon: Utensils },
    { id: 'reports', label: 'Progresso', icon: TrendingUp },
    { id: 'ai', label: 'LIFE AI', icon: Bot },
    { id: 'notifications', label: 'Notificações', icon: Bell, badge: unreadNotifs },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-[#f5f5f7] flex flex-col md:flex-row relative selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background ambient lighting */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Desktop macOS/iOS Hybrid Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0d0d11]/85 backdrop-blur-2xl border-r border-white/5 p-4 z-20 sticky top-0 h-screen justify-between overflow-y-auto">
        <div className="space-y-5">
          {/* Logo & Search Trigger */}
          <div className="flex items-center justify-between px-2 py-1">
            <LifeOsLogo variant="header" size="sm" showSubtitle={true} />

            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
              title="Pesquisa Global (⌘K)"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Capture Button */}
          <button
            onClick={() => handleOpenQuickCapture('task')}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all ios-press cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Captura Rápida</span>
          </button>

          {/* Primary Nav Section */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 px-3">
              Principal
            </span>
            {primaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-white/40'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px] font-mono text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Secondary Nav Section */}
          <div className="space-y-1 pt-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 px-3">
              Módulos do Sistema
            </span>
            {secondaryNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white shadow-sm font-semibold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-white/40'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span className="w-4 h-4 rounded-full bg-blue-500 text-[10px] font-mono flex items-center justify-center text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* User Mini Profile Dock */}
        <div
          onClick={() => setActiveTab('settings')}
          className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 cursor-pointer transition-all ios-press mt-4"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {profile?.preferredName?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{profile?.preferredName}</p>
            <p className="text-[10px] text-white/40 truncate">{profile?.currency} Ativo</p>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-5 py-3.5 ios-glass-header sticky top-0 z-30">
          <LifeOsLogo variant="header" size="xs" showSubtitle={false} />

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 rounded-full bg-white/5 text-white/70"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleOpenQuickCapture('task')}
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 ios-press"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <div className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              onOpenQuickCapture={handleOpenQuickCapture}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}
          {activeTab === 'tasks' && <TasksView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'reminders' && <RemindersView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'routine' && <RoutineView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'studies' && <StudiesView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'reviews' && <ReviewsView />}
          {activeTab === 'calendar' && <CalendarView />}
          {activeTab === 'habits' && <HabitsView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'goals' && <GoalsView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'projects' && <ProjectsView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'finances' && <FinancesView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'sales' && <SalesView />}
          {activeTab === 'memory' && <MemoryView onOpenQuickCapture={handleOpenQuickCapture} />}
          {activeTab === 'journal' && <JournalView />}
          {activeTab === 'meals' && <MealsView />}
          {activeTab === 'reports' && <ProgressReportsView />}
          {activeTab === 'notifications' && <NotificationsCenterView />}
          {activeTab === 'ai' && <AiAssistantView />}
          {activeTab === 'settings' && (
            <SettingsView onRedoOnboarding={() => setIsRedoingOnboarding(true)} />
          )}
        </div>

        {/* Mobile iOS 26 Floating Glass Dock Bar */}
        <nav className="md:hidden fixed bottom-4 left-4 right-4 z-40">
          <div className="ios-glass-dock rounded-[26px] p-2 flex items-center justify-around">
            {[
              { id: 'dashboard', label: 'Hoje', icon: LayoutDashboard },
              { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
              { id: 'reminders', label: 'Alarmes', icon: AlarmClock },
              { id: 'routine', label: 'Rotina', icon: Clock },
              { id: 'more', label: 'Mais', icon: Menu },
            ].map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'more') {
                      setIsMoreMenuOpen(prev => !prev);
                    } else {
                      setActiveTab(item.id);
                      setIsMoreMenuOpen(false);
                    }
                  }}
                  className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ios-press ${
                    isActive ? 'text-blue-400 font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-0.5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Mobile "Mais" Modal Drawer */}
        {isMoreMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end">
            <div
              onClick={() => setIsMoreMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <div className="relative w-full bg-[#18181b] border-t border-white/10 rounded-t-[32px] p-6 space-y-4 z-10 max-h-[80vh] overflow-y-auto pb-24">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white">Todos os Módulos do LIFE OS</h3>
                <button onClick={() => setIsMoreMenuOpen(false)} className="p-1 text-white/50">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  ...primaryNavItems,
                  ...secondaryNavItems
                ].map(mod => {
                  const Icon = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      onClick={() => {
                        setActiveTab(mod.id);
                        setIsMoreMenuOpen(false);
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex flex-col items-center justify-center gap-1.5 text-center"
                    >
                      <Icon className="w-5 h-5 text-blue-400" />
                      <span className="text-[11px] font-medium text-white">{mod.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Global Quick Capture Drawer Modal */}
      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        defaultTab={quickCaptureTab}
      />

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(tab) => setActiveTab(tab)}
      />

      {/* Floating In-App Dynamic Island Notification Toast */}
      <NotificationToast onNavigate={(tab) => setActiveTab(tab)} />
    </div>
  );
}
