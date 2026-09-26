import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Send,
  Bot,
  Brain,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  HelpCircle,
  FolderKanban
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiAssistantView: React.FC = () => {
  const { profile } = useAuth();
  const { tasks, subjects, studySessions, habits, projects, finances } = useData();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Olá ${profile?.preferredName || 'você'}! Sou o LIFE AI, seu assistente pessoal de produtividade e estudos. Posso analisar suas tarefas, sugerir o que priorizar hoje, montar revisões ativas ou resumir seus projetos. Em que posso te ajudar agora?`,
      timestamp: 'Agora',
    },
  ]);
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'O que preciso fazer hoje?',
    'O que está atrasado ou pendente?',
    'Quais projetos estão ativos?',
    'Tenho 30 minutos livres. O que fazer?',
    'Como está meu financeiro?',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: String(Date.now()),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Context-grounded intelligent response based on REAL user data in Firestore
    setTimeout(() => {
      let response = '';
      const q = query.toLowerCase();

      const pendingTasks = tasks.filter(t => t.status !== 'completed');
      const completedTasks = tasks.filter(t => t.status === 'completed');

      if (q.includes('fazer hoje') || q.includes('hoje') || q.includes('priorizar')) {
        if (pendingTasks.length > 0) {
          const topTask = pendingTasks[0];
          response = `Com base nos seus dados atuais, você tem ${pendingTasks.length} tarefas pendentes. Sua ação prioritária imediata é: "${topTask.title}" (${topTask.estimatedMinutes || 30} min). Ao concluir, passe para "${pendingTasks[1]?.title || 'revisar estudos'}".`;
        } else {
          response = `Você já concluiu todas as suas tarefas pendentes de hoje! Excelente ritmo. Sugiro usar o tempo livre para avançar uma leitura ou registrar um treino.`;
        }
      } else if (q.includes('atrasado') || q.includes('pendente')) {
        response = `Você possui ${pendingTasks.length} pendências ativas: ${pendingTasks.map(t => t.title).slice(0, 3).join(', ')}.`;
      } else if (q.includes('projeto')) {
        const activeProjs = projects.filter(p => p.status === 'active');
        response = `Você tem ${activeProjs.length} projetos em andamento:\n` +
          activeProjs.map(p => `• ${p.name}: ${p.progressPercent || 0}% concluído (Próximo passo: ${p.nextStep || 'Avançar tarefas'})`).join('\n');
      } else if (q.includes('30 minutos') || q.includes('livre') || q.includes('hora')) {
        const quickTask = pendingTasks.find(t => (t.estimatedMinutes || 30) <= 30) || pendingTasks[0];
        if (quickTask) {
          response = `Em 30 minutos livres, a melhor ação é executar: "${quickTask.title}" (${quickTask.category}). É uma vitória rápida que destrava seu dia.`;
        } else {
          response = `Que tal fazer uma sessão de teste de memória rápida de 15 minutos em "${subjects[0]?.name || 'Estudos'}" ou beber um copo d'água?`;
        }
      } else if (q.includes('financeiro') || q.includes('dinheiro') || q.includes('saldo')) {
        const totalIncome = finances.filter(f => f.type === 'income').reduce((s, f) => s + f.amount, 0);
        const totalExpense = finances.filter(f => f.type === 'expense').reduce((s, f) => s + f.amount, 0);
        response = `Resumo financeiro: Total de entradas: R$ ${totalIncome.toFixed(2)}, total de despesas: R$ ${totalExpense.toFixed(2)}. Saldo atual no LIFE OS: R$ ${(totalIncome - totalExpense).toFixed(2)}.`;
      } else {
        response = `Entendido! Analisei seu sistema: você tem ${pendingTasks.length} tarefas pendentes, ${habits.length} hábitos monitorados e ${projects.length} projetos ativos. Mantenha o foco em uma única ação por vez para máxima clareza mental.`;
      }

      const aiMsg: Message = {
        id: String(Date.now() + 1),
        sender: 'ai',
        text: response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            LIFE AI • Assistente Pessoal
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Inteligência & Análise
          </h1>
          <p className="text-sm text-white/60">
            Respostas fundamentadas nos seus dados reais do Firestore
          </p>
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {quickPrompts.map(prompt => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/5 text-xs font-medium whitespace-nowrap transition-all ios-press"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="ios-glass rounded-3xl border border-white/5 p-4 sm:p-6 min-h-[420px] flex flex-col justify-between space-y-4">
        <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-[#222228] text-white/90 rounded-tl-none border border-white/5'
                }`}
              >
                {msg.text}
                <div className={`text-[10px] mt-1.5 ${msg.sender === 'user' ? 'text-white/60 text-right' : 'text-white/30'}`}>
                  {msg.timestamp}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-white/40 text-xs">
              <div className="w-8 h-8 rounded-2xl bg-blue-600/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
              <span>LIFE AI está consultando seus dados...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-2 border-t border-white/10 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Pergunte ao seu segundo cérebro..."
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500 transition-colors"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 transition-all ios-press flex-shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
