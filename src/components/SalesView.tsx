import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Users,
  Plus,
  DollarSign,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Phone,
  Trash2,
  Calendar,
  Building
} from 'lucide-react';
import { useData } from '../context/DataContext';
import { SalesLead } from '../types';

export const SalesView: React.FC = () => {
  const { sales, addSalesLead, updateSalesLead, deleteSalesLead } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [contactName, setContactName] = useState('');
  const [company, setCompany] = useState('');
  const [contactChannel, setContactChannel] = useState('WhatsApp');
  const [productOrService, setProductOrService] = useState('');
  const [value, setValue] = useState(1000);
  const [nextAction, setNextAction] = useState('');

  const PIPELINE_COLUMNS: SalesLead['status'][] = [
    'LEAD',
    'ABORDADO',
    'RESPONDEU',
    'CONVERSANDO',
    'PROPOSTA',
    'FECHADO'
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim()) return;

    await addSalesLead({
      contactName: contactName.trim(),
      company: company.trim(),
      contactChannel,
      productOrService: productOrService.trim() || 'Serviço',
      value: Number(value) || 0,
      status: 'LEAD',
      nextAction: nextAction.trim() || 'Fazer primeiro contato',
    });

    setContactName('');
    setCompany('');
    setProductOrService('');
    setNextAction('');
    setShowAddModal(false);
  };

  const totalClosed = sales
    .filter(s => s.status === 'FECHADO')
    .reduce((acc, curr) => acc + curr.value, 0);

  const totalPipeline = sales
    .filter(s => s.status !== 'FECHADO')
    .reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
            Prospecção & Pipeline Comercial
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Vendas & Abordagens
          </h1>
          <p className="text-sm text-white/60">
            Acompanhe cada lead do primeiro contato até o fechamento
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 ios-press cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Novo Lead / Contato
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="ios-glass p-4 rounded-2xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-mono">Abordagens</span>
          <div className="text-2xl font-bold text-white font-mono">{sales.length}</div>
        </div>
        <div className="ios-glass p-4 rounded-2xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-mono">Em Negociação</span>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            R$ {totalPipeline.toFixed(0)}
          </div>
        </div>
        <div className="ios-glass p-4 rounded-2xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-mono">Fechados</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {sales.filter(s => s.status === 'FECHADO').length}
          </div>
        </div>
        <div className="ios-glass p-4 rounded-2xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-mono">Receita Fechada</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            R$ {totalClosed.toFixed(0)}
          </div>
        </div>
      </div>

      {/* Pipeline Kanban Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[950px]">
          {PIPELINE_COLUMNS.map(col => {
            const columnLeads = sales.filter(s => s.status === col);
            return (
              <div key={col} className="w-64 bg-[#141416]/70 rounded-3xl p-3 border border-white/5 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between px-2 py-1 mb-2">
                    <span className="text-xs font-bold text-white/70 font-mono">{col}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-white/40">
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        className="ios-glass p-3.5 rounded-2xl border border-white/5 space-y-2 group hover:border-white/15"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-white">{lead.contactName}</h4>
                            {lead.company && (
                              <p className="text-[10px] text-white/40 flex items-center gap-1">
                                <Building className="w-3 h-3" /> {lead.company}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => deleteSalesLead(lead.id)}
                            className="p-1 text-white/20 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                          <span className="text-emerald-400 font-mono font-bold">
                            R$ {lead.value}
                          </span>
                          <span className="text-[10px] text-white/40">{lead.contactChannel}</span>
                        </div>

                        {lead.nextAction && (
                          <p className="text-[10px] text-white/60 bg-black/40 p-1.5 rounded-lg border border-white/5">
                            <strong>Próxima ação:</strong> {lead.nextAction}
                          </p>
                        )}

                        {/* Move Pipeline Step Button */}
                        <div className="pt-1 flex justify-end">
                          <button
                            onClick={() => {
                              const currIdx = PIPELINE_COLUMNS.indexOf(lead.status);
                              if (currIdx < PIPELINE_COLUMNS.length - 1) {
                                updateSalesLead(lead.id, { status: PIPELINE_COLUMNS[currIdx + 1] });
                              }
                            }}
                            className="text-[10px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1"
                          >
                            Avançar Etapa →
                          </button>
                        </div>
                      </div>
                    ))}

                    {columnLeads.length === 0 && (
                      <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-[11px] text-white/20">
                        Vazio
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Lead */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#1c1c1f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Novo Lead / Proposta</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Nome do Contato
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Ex: Carlos Silveira"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Empresa / Projeto
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ex: Studio Alpha"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Canal
                  </label>
                  <select
                    value={contactChannel}
                    onChange={(e) => setContactChannel(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none"
                  >
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Instagram">Instagram</option>
                    <option value="E-mail">E-mail</option>
                    <option value="Indicação">Indicação</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                    Serviço / Produto
                  </label>
                  <input
                    type="text"
                    value={productOrService}
                    onChange={(e) => setProductOrService(e.target.value)}
                    placeholder="Ex: Consultoria, App"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Próxima Ação
                </label>
                <input
                  type="text"
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="Ex: Enviar proposta comercial até terça"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-lg shadow-amber-500/30 ios-press"
                >
                  Salvar Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
