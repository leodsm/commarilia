import React, { useState } from 'react';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';

export const Billing: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = (planId: string) => {
    setLoading(planId);
    setTimeout(() => {
      setLoading(null);
      alert('Integração com Mercado Pago / Stripe vai abrir o checkout aqui.');
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Assinatura & Faturamento</h2>
        <p className="text-gray-500 text-sm">Gerencie seu plano atual e adicione recursos à sua conta.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Plano Atual: Gratuito</h3>
            <p className="text-sm text-gray-500">Você está utilizando os recursos básicos.</p>
          </div>
        </div>
        <button className="text-[#350285] hover:text-[#f4268e] bg-[#350285]/10 hover:bg-[#f4268e]/10 px-4 py-2 rounded-md transition-colors text-sm font-medium">
          Ver Histórico de Faturas
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* FREE PLAN */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative opacity-80">
          <div className="absolute top-0 inset-x-0 h-1 bg-gray-300 rounded-t-xl"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Básico</h3>
          <p className="text-sm text-gray-500 mb-4">Para criadores de conteúdo individuais.</p>
          <div className="text-3xl font-bold text-gray-900 mb-6">Grátis</div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-gray-400 shrink-0" />
              1 Portal Tenant
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-gray-400 shrink-0" />
              Até 5 Stories / mês
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-gray-400 shrink-0" />
              Templates básicos do Card Builder
            </li>
          </ul>

          <button disabled className="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-md font-medium text-sm">
            Plano Atual
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="bg-white p-6 rounded-xl border-2 border-[#350285] shadow-lg relative transform md:-translate-y-2">
          <div className="absolute top-0 right-0 bg-[#350285] text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
            RECOMENDADO
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Pro</h3>
          <p className="text-sm text-gray-500 mb-4">Para marcas e publicadores regionais.</p>
          <div className="text-3xl font-bold text-gray-900 mb-6">R$ 97<span className="text-lg text-gray-500 font-normal">/mês</span></div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-[#350285] shrink-0" />
              <strong>Dominio Personalizado</strong>
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-[#350285] shrink-0" />
              Stories Ilimitados
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-[#350285] shrink-0" />
              Acesso total ao Card Builder
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-[#350285] shrink-0" />
              Uploads de vídeo de alta resolução
            </li>
          </ul>

          <button 
            onClick={() => handleSubscribe('pro')}
            disabled={loading !== null}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#350285] to-[#f4268e] text-white px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity"
          >
            {loading === 'pro' ? 'Processando...' : 'Assinar Pro'}
          </button>
        </div>

        {/* ENTERPRISE PLAN */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-gray-700 to-black rounded-t-xl"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Enterprise</h3>
          <p className="text-sm text-gray-500 mb-4">Para redes jornalísticas e grandes corporações.</p>
          <div className="text-3xl font-bold text-gray-900 mb-6">R$ 497<span className="text-lg text-gray-500 font-normal">/mês</span></div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Zap className="w-5 h-5 text-amber-500 shrink-0" />
              <strong>Múltiplos Tenants (Até 10 portais)</strong>
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-gray-400 shrink-0" />
              Membros de Equipe ilimitados
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-gray-400 shrink-0" />
              API GraphQl Privada
            </li>
            <li className="flex gap-2 items-start text-sm text-gray-600">
              <Check className="w-5 h-5 text-gray-400 shrink-0" />
              Selo "Powered by ComMarília" Removido
            </li>
          </ul>

          <button 
            onClick={() => handleSubscribe('enterprise')}
            disabled={loading !== null}
            className="w-full border-2 border-slate-800 text-slate-800 hover:bg-slate-800 hover:text-white px-4 py-2 rounded-md font-medium text-sm transition-colors"
          >
            {loading === 'enterprise' ? 'Processando...' : 'Falar com Vendas'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Billing;
