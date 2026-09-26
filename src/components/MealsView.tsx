import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Utensils,
  Plus,
  Droplet,
  Coffee,
  Sun,
  Moon,
  Clock,
  Trash2
} from 'lucide-react';
import { useData } from '../context/DataContext';

export const MealsView: React.FC = () => {
  const { meals, addMeal } = useData();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [mealType, setMealType] = useState<'café' | 'almoço' | 'lanche' | 'jantar' | 'água'>('almoço');
  const [foods, setFoods] = useState('');
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [waterMl, setWaterMl] = useState(300);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foods.trim() && mealType !== 'água') return;

    await addMeal({
      mealType,
      time,
      foods: foods.trim() || 'Água / Hidratação',
      waterMl: mealType === 'água' ? Number(waterMl) : undefined,
      date: todayStr,
    });

    setFoods('');
    setShowAddModal(false);
  };

  const todayMeals = meals.filter(m => m.date === todayStr);
  const totalWaterToday = todayMeals.reduce((sum, m) => sum + (m.waterMl || 0), 0);

  return (
    <div className="space-y-6 pb-28">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-teal-400 font-semibold">
            Nutrição & Hidratação Consciente
          </span>
          <h1 className="text-3xl font-bold tracking-tight text-white mt-0.5">
            Alimentação & Água
          </h1>
          <p className="text-sm text-white/60">
            Acompanhamento equilibrado e saudável da rotina de refeições sem restrições extremas
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={async () => {
              await addMeal({
                mealType: 'água',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                foods: 'Copo d\'água (300ml)',
                waterMl: 300,
                date: todayStr,
              });
            }}
            className="px-4 py-2.5 rounded-2xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/30 text-xs font-semibold flex items-center gap-1.5 ios-press cursor-pointer"
          >
            <Droplet className="w-4 h-4 text-teal-400" />
            +300ml Água
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/30 flex items-center gap-1.5 ios-press cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Refeição
          </button>
        </div>
      </div>

      {/* Water Hydration Pill */}
      <div className="ios-glass p-5 rounded-3xl border border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Hidratação Hoje</h4>
            <p className="text-xs text-white/40">{totalWaterToday}ml registrados • Meta recomendada: 2500ml</p>
          </div>
        </div>
        <div className="text-xl font-bold font-mono text-teal-400">
          {totalWaterToday} ml
        </div>
      </div>

      {/* Meals Today List */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 px-1">
          Refeições de Hoje
        </h3>

        <div className="space-y-2.5">
          {todayMeals.map(meal => (
            <div
              key={meal.id}
              className="ios-glass p-4 rounded-2xl border border-white/5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-teal-400">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white capitalize">{meal.mealType}</h4>
                  <p className="text-xs text-white/60">{meal.foods}</p>
                </div>
              </div>

              <span className="text-xs text-white/40 font-mono">{meal.time}</span>
            </div>
          ))}

          {todayMeals.length === 0 && (
            <div className="text-center py-10 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/40">
              Nenhuma refeição registrada hoje.
            </div>
          )}
        </div>
      </div>

      {/* Modal Add Meal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#1c1c1f] border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-white">Registrar Refeição</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Tipo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['café', 'almoço', 'lanche', 'jantar'] as const).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMealType(t)}
                      className={`p-2 rounded-xl text-xs font-semibold capitalize border ${
                        mealType === t ? 'bg-teal-600/30 border-teal-500 text-teal-300' : 'bg-black/30 border-white/5 text-white/60'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Alimentos Consumidos
                </label>
                <textarea
                  rows={3}
                  required
                  value={foods}
                  onChange={(e) => setFoods(e.target.value)}
                  placeholder="Ex: Arroz, feijão, frango grelhado e salada verde..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-teal-500 resize-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/50 block mb-1">
                  Horário
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm"
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
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-lg shadow-teal-600/30 ios-press"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
