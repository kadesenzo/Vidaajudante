import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Plus,
  Play,
  Brain,
  Sparkles,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  Lightbulb
} from 'lucide-react';
import { useData } from '../context/DataContext';
import confetti from 'canvas-confetti';

interface StudiesViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const StudiesView: React.FC<StudiesViewProps> = ({ onOpenQuickCapture }) => {
  const { subjects, studySessions, addSubject, addStudySession } = useData();

  // Create subject modal
  const [showNewSubject, setShowNewSubject] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubColor, setNewSubColor] = useState('#0A84FF');

  // Study Session Active / Recall Test
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showRecallTest, setShowRecallTest] = useState(false);
  const [recentTopic, setRecentTopic] = useState('');
  const [recallSummary, setRecallSummary] = useState('');
  const [recallConfidence, setRecallConfidence] = useState(3);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiQuizQuestion, setAiQuizQuestion] = useState<string | null>(null);

  const colors = ['#0A84FF', '#5E5CE6', '#BF5AF2', '#30D158', '#FF9F0A', '#FF375F', '#64D2FF'];

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;
    await addSubject(newSubName.trim(), newSubColor);
    setNewSubName('');
    setShowNewSubject(false);
  };

  const handleSaveRecall = async () => {
    if (!recentTopic.trim()) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const sub = subjects[0];
    await addStudySession({
      subjectId: sub?.id || 'gen',
      subjectName: sub?.name || 'Geral',
      topic: recentTopic,
      durationMinutes: 30,
      date: todayStr,
      difficulty: recallConfidence > 3 ? 'fácil' : 'médio',
      masteryLevel: recallConfidence,
      memoryRecallSummary: recallSummary,
      notes: `Revisão de memória pós-estudo: ${recallConfidence}/5 estrelas.`,
    });

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#0A84FF', '#BF5AF2'],
    });

    setRecentTopic('');
    setRecallSummary('');
    setShowRecallTest(false);
  };

  const generateAIQuiz = () => {
    if (!recentTopic.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      setAiQuizQuestion(`Pergunta de fixação ativa para "${recentTopic}": Explique com suas palavras qual é a relação de causa e efeito central deste conceito e dê 1 exemplo prático da sua aplicação.`);
      setIsAiLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-blue-400 font-semibold">
            Aprendizado Ativo & Memória
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Estudos & Matérias
          </h1>
          <p className="text-sm text-white/60">
            {subjects.length} disciplinas cadastradas • Curva de retenção espaçada
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRecallTest(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 text-xs font-semibold flex items-center gap-2 ios-press"
          >
            <Brain className="w-4 h-4 text-indigo-400" />
            Teste de Memória
          </button>
          <button
            onClick={() => onOpenQuickCapture('study')}
            className="px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 flex items-center gap-1.5 ios-press"
          >
            <Plus className="w-4 h-4" /> Registrar Sessão
          </button>
        </div>
      </div>

      {/* Disciplinas Grid Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">
            Minhas Matérias
          </h3>
          <button
            onClick={() => setShowNewSubject(true)}
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Matéria
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map(subject => {
            const sessionsForSubject = studySessions.filter(s => s.subjectId === subject.id);
            const totalMinutes = sessionsForSubject.reduce((acc, s) => acc + s.durationMinutes, 0);

            return (
              <div
                key={subject.id}
                className="ios-glass p-4 rounded-2xl border border-white/5 hover:border-white/15 transition-all space-y-3 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: subject.color || '#0A84FF' }}
                    />
                    <h4 className="text-base font-semibold text-white group-hover:text-blue-300 transition-colors">
                      {subject.name}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-white/40">
                    {sessionsForSubject.length} sessões
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-white/60">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-white/40" />
                    {totalMinutes} min totais
                  </span>
                  <button
                    onClick={() => {
                      setRecentTopic(`Estudo de ${subject.name}`);
                      setShowRecallTest(true);
                    }}
                    className="text-blue-400 hover:text-blue-300 text-[11px] font-medium"
                  >
                    Testar Retenção →
                  </button>
                </div>
              </div>
            );
          })}

          {/* New Subject Quick Card */}
          <button
            onClick={() => setShowNewSubject(true)}
            className="p-5 rounded-2xl border border-dashed border-white/15 hover:border-blue-400/50 hover:bg-white/5 text-white/50 hover:text-white transition-all flex flex-col items-center justify-center gap-2 text-xs font-medium ios-press"
          >
            <Plus className="w-5 h-5 text-white/40" />
            Criar Nova Matéria
          </button>
        </div>
      </div>

      {/* Recente: Sessões e Testes de Memória */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 px-1">
          Histórico de Sessões & Retenção
        </h3>

        <div className="space-y-2.5">
          {studySessions.map(session => (
            <div
              key={session.id}
              className="ios-glass p-4 rounded-2xl border border-white/5 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-medium font-mono">
                    {session.subjectName}
                  </span>
                  <h4 className="text-sm font-semibold text-white">{session.topic}</h4>
                </div>
                <span className="text-xs text-white/40 font-mono">
                  {session.durationMinutes} min • {session.date}
                </span>
              </div>

              {session.memoryRecallSummary && (
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-white/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-400 font-medium text-[11px]">
                    <Brain className="w-3.5 h-3.5" />
                    O que aprendi sem olhar o material:
                  </div>
                  <p className="italic text-white/70">"{session.memoryRecallSummary}"</p>
                </div>
              )}

              {session.notes && !session.memoryRecallSummary && (
                <p className="text-xs text-white/60">{session.notes}</p>
              )}
            </div>
          ))}

          {studySessions.length === 0 && (
            <div className="text-center py-10 px-4 rounded-2xl bg-white/5 border border-white/5">
              <BookOpen className="w-8 h-8 text-white/20 mx-auto mb-2" />
              <p className="text-sm font-medium text-white/70">Nenhuma sessão gravada ainda.</p>
              <p className="text-xs text-white/40 mt-1">
                Ao terminar de estudar, registre aqui para ativar as revisões periódicas (1, 3, 7 e 30 dias).
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal: New Subject */}
      {showNewSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="w-full max-w-sm bg-[#1c1c1e] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-semibold text-white">Nova Matéria / Disciplina</h3>
            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="text-[11px] text-white/50 block mb-1">Nome da Matéria</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  placeholder="Ex: Física Quântica, Direito, Marketing..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] text-white/50 block mb-1.5">Cor de Identificação</label>
                <div className="flex gap-2">
                  {colors.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform ${
                        newSubColor === c ? 'scale-125 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewSubject(false)}
                  className="px-3 py-1.5 text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium hover:bg-blue-500"
                >
                  Criar Matéria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Recall Test (Teste de Memória após estudar) */}
      {showRecallTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#18181b] border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Teste de Evocação Ativa</h3>
                <p className="text-xs text-white/50">Escreva sem consultar o material para consolidar a memória.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Assunto Estudado
                </label>
                <input
                  type="text"
                  value={recentTopic}
                  onChange={(e) => setRecentTopic(e.target.value)}
                  placeholder="Ex: Células e Mitose, Async/Await em JS..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  O que você aprendeu? (Resuma mentalmente em suas próprias palavras)
                </label>
                <textarea
                  rows={4}
                  value={recallSummary}
                  onChange={(e) => setRecallSummary(e.target.value)}
                  placeholder="Escreva tudo o que lembra sem olhar notas. Este ato fortalece as conexões sinápticas..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Nível de Confiança / Domínio (1 a 5)
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setRecallConfidence(lvl)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        recallConfidence === lvl
                          ? 'bg-indigo-600 border-indigo-400 text-white'
                          : 'bg-black/30 border-white/5 text-white/50'
                      }`}
                    >
                      {lvl}★
                    </button>
                  ))}
                </div>
              </div>

              {/* Botão de Pergunta AI */}
              <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 space-y-2">
                <button
                  type="button"
                  onClick={generateAIQuiz}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAiLoading ? 'Gerando pergunta inteligente...' : 'Pedir pergunta de teste de fixação'}
                </button>
                {aiQuizQuestion && (
                  <p className="text-xs text-white/80 bg-black/40 p-2.5 rounded-xl border border-white/5">
                    {aiQuizQuestion}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowRecallTest(false)}
                className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSaveRecall}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 ios-press"
              >
                Salvar & Programar Revisão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
