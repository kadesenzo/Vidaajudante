import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  TrendingUp,
  CreditCard,
  PieChart
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

interface FinancesViewProps {
  onOpenQuickCapture: (tab?: any) => void;
}

export const FinancesView: React.FC<FinancesViewProps> = ({ onOpenQuickCapture }) => {
  const { finances, deleteTransaction } = useData();
  const { profile } = useAuth();
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

  const currencySymbol = profile?.currency === 'USD' ? '$' : profile?.currency === 'EUR' ? '€' : 'R$';

  const totalIncome = finances
    .filter(f => f.type === 'income')
    .reduce((sum, f) => sum + f.amount, 0);

  const totalExpense = finances
    .filter(f => f.type === 'expense')
    .reduce((sum, f) => sum + f.amount, 0);

  const balance = totalIncome - totalExpense;

  const filtered = finances.filter(f => {
    if (filter === 'income') return f.type === 'income';
    if (filter === 'expense') return f.type === 'expense';
    return true;
  });

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-teal-400 font-semibold">
            Fluxo & Dinheiro
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Finanças Pessoais
          </h1>
          <p className="text-sm text-white/60">
            Controle ágil de entradas, custos e saldo disponível
          </p>
        </div>

        <button
          onClick={() => onOpenQuickCapture('finance')}
          className="px-5 py-3 rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold shadow-lg shadow-teal-500/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* Balance Summary Card (iOS Glass Card Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="ios-glass p-5 rounded-3xl border border-white/5 space-y-1">
          <span className="text-xs text-white/40 uppercase tracking-wider font-medium">Saldo Líquido</span>
          <div className={`text-2xl sm:text-3xl font-bold font-mono ${balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {currencySymbol} {balance.toFixed(2)}
          </div>
          <p className="text-[11px] text-white/40">Acumulado no sistema</p>
        </div>

        <div className="ios-glass p-5 rounded-3xl border border-white/5 space-y-1">
          <span className="text-xs text-emerald-400/80 uppercase tracking-wider font-medium flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" /> Total Entradas
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            + {currencySymbol} {totalIncome.toFixed(2)}
          </div>
          <p className="text-[11px] text-white/40">{finances.filter(f => f.type === 'income').length} receitas</p>
        </div>

        <div className="ios-glass p-5 rounded-3xl border border-white/5 space-y-1">
          <span className="text-xs text-red-400/80 uppercase tracking-wider font-medium flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5 text-red-400" /> Total Saídas
          </span>
          <div className="text-2xl font-bold font-mono text-red-400">
            - {currencySymbol} {totalExpense.toFixed(2)}
          </div>
          <p className="text-[11px] text-white/40">{finances.filter(f => f.type === 'expense').length} despesas</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex bg-[#1c1c1e] p-1 rounded-xl w-fit border border-white/5">
        {[
          { id: 'all', label: 'Todos' },
          { id: 'income', label: 'Entradas' },
          { id: 'expense', label: 'Saídas' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.id ? 'bg-white/15 text-white shadow-sm' : 'text-white/50 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div className="space-y-2">
        {filtered.map(tx => {
          const isIncome = tx.type === 'income';
          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="ios-glass p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                  isIncome ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-white truncate">{tx.description}</h4>
                  <p className="text-xs text-white/40">
                    {tx.category} • {tx.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-base font-bold font-mono ${
                  isIncome ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {isIncome ? '+' : '-'} {currencySymbol} {tx.amount.toFixed(2)}
                </span>

                <button
                  onClick={() => deleteTransaction(tx.id)}
                  className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 px-4 rounded-3xl bg-white/5 border border-white/5">
            <Wallet className="w-8 h-8 text-white/20 mx-auto mb-2" />
            <p className="text-sm font-medium text-white/70">Nenhum lançamento financeiro registrado.</p>
            <p className="text-xs text-white/40 mt-1">Toque em "Novo Lançamento" para cadastrar uma receita ou gasto.</p>
          </div>
        )}
      </div>
    </div>
  );
};
