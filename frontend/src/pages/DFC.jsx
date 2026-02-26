import React, { useState, useEffect } from 'react';
import { getDFC, getDFCAnual } from '../services/api';
import LineChart from '../components/LineChart';
import BarChart from '../components/BarChart';

const DFC = () => {
  const [mes, setMes] = useState(new Date().getMonth() + 1);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [dados, setDados] = useState(null);
  const [dadosAnuais, setDadosAnuais] = useState(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('mensal'); // mensal | anual

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Marco' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  useEffect(() => {
    loadData();
  }, [mes, ano, viewMode]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (viewMode === 'mensal') {
        const res = await getDFC(mes, ano);
        setDados(res);
      } else {
        const res = await getDFCAnual(ano);
        setDadosAnuais(res);
      }
    } catch (error) {
      console.error('Erro ao carregar DFC:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const formatNegative = (value) => {
    if (value === 0 || value === null || value === undefined) return '-';
    return `(${formatCurrency(Math.abs(value))})`;
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">
          Demonstracao de Fluxo de Caixa (DFC)
        </h1>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Toggle Mensal/Anual */}
          <div className="flex rounded-lg overflow-hidden border border-gray-300">
            <button
              onClick={() => setViewMode('mensal')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'mensal'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setViewMode('anual')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === 'anual'
                  ? 'bg-primary text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Anual
            </button>
          </div>

          {viewMode === 'mensal' && (
            <select
              value={mes}
              onChange={(e) => setMes(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {meses.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          )}
          <select
            value={ano}
            onChange={(e) => setAno(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* DFC Mensal */}
      {!loading && viewMode === 'mensal' && dados && (
        <div className="space-y-6">
          {/* Cards Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Saldo Inicial</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(dados.saldo_inicial)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Variacao</div>
              <div className={`text-2xl font-bold ${dados.variacao_caixa >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {dados.variacao_caixa >= 0 ? '+' : ''}{formatCurrency(dados.variacao_caixa)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Saldo Final</div>
              <div className={`text-2xl font-bold ${dados.saldo_final >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(dados.saldo_final)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Periodo</div>
              <div className="text-xl font-bold text-gray-900">
                {dados.mes_nome} {dados.ano}
              </div>
            </div>
          </div>

          {/* Tabela DFC */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <tbody className="divide-y divide-gray-200">
                {/* Atividades Operacionais */}
                <tr className="bg-blue-50">
                  <td colSpan="2" className="px-6 py-4 font-bold text-blue-900">
                    ATIVIDADES OPERACIONAIS
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-700">Recebimento de Clientes</td>
                  <td className="px-6 py-3 text-right font-medium text-green-600">
                    {formatCurrency(dados.atividades_operacionais?.recebimento_clientes)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">(-) Pagamento a Fornecedores</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {formatNegative(dados.atividades_operacionais?.pagamento_fornecedores)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-700">(-) Pagamento de Salarios</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {formatNegative(dados.atividades_operacionais?.pagamento_salarios)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">(-) Impostos Pagos</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {formatNegative(dados.atividades_operacionais?.impostos_pagos)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-700">(-) Outras Despesas Operacionais</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {formatNegative(dados.atividades_operacionais?.outras_despesas)}
                  </td>
                </tr>
                <tr className="bg-blue-100 font-bold">
                  <td className="px-6 py-4 text-blue-900">Caixa Gerado pelas Operacoes</td>
                  <td className={`px-6 py-4 text-right ${dados.atividades_operacionais?.subtotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(dados.atividades_operacionais?.subtotal)}
                  </td>
                </tr>

                {/* Atividades de Investimento */}
                <tr className="bg-purple-50">
                  <td colSpan="2" className="px-6 py-4 font-bold text-purple-900">
                    ATIVIDADES DE INVESTIMENTO
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-700">(-) Compra de Ativos / Investimentos</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {formatNegative(dados.atividades_investimento?.compra_ativos)}
                  </td>
                </tr>
                <tr className="bg-purple-100 font-bold">
                  <td className="px-6 py-4 text-purple-900">Caixa Usado em Investimentos</td>
                  <td className={`px-6 py-4 text-right ${dados.atividades_investimento?.subtotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(dados.atividades_investimento?.subtotal)}
                  </td>
                </tr>

                {/* Atividades de Financiamento */}
                <tr className="bg-orange-50">
                  <td colSpan="2" className="px-6 py-4 font-bold text-orange-900">
                    ATIVIDADES DE FINANCIAMENTO
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-700">(-) Distribuicao de Lucros / Pro-labore</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {formatNegative(dados.atividades_financiamento?.distribuicao_lucros)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">(-) Emprestimos / Financiamentos</td>
                  <td className="px-6 py-3 text-right font-medium text-red-600">
                    {formatNegative(dados.atividades_financiamento?.emprestimos)}
                  </td>
                </tr>
                <tr className="bg-orange-100 font-bold">
                  <td className="px-6 py-4 text-orange-900">Caixa de Financiamentos</td>
                  <td className={`px-6 py-4 text-right ${dados.atividades_financiamento?.subtotal >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(dados.atividades_financiamento?.subtotal)}
                  </td>
                </tr>

                {/* Totais */}
                <tr className="bg-gray-100">
                  <td className="px-6 py-4 font-bold text-gray-900">VARIACAO DE CAIXA</td>
                  <td className={`px-6 py-4 text-right font-bold text-lg ${dados.variacao_caixa >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {dados.variacao_caixa >= 0 ? '+' : ''}{formatCurrency(dados.variacao_caixa)}
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-700">Saldo Inicial</td>
                  <td className="px-6 py-3 text-right font-medium">
                    {formatCurrency(dados.saldo_inicial)}
                  </td>
                </tr>
                <tr className="bg-green-100 font-bold text-lg">
                  <td className="px-6 py-4 text-green-900">SALDO FINAL</td>
                  <td className={`px-6 py-4 text-right ${dados.saldo_final >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatCurrency(dados.saldo_final)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DFC Anual */}
      {!loading && viewMode === 'anual' && dadosAnuais && (
        <div className="space-y-6">
          {/* Cards Resumo Anual */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Entradas</div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dadosAnuais.total_entradas)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Saidas</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(dadosAnuais.total_saidas)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Saldo Final</div>
              <div className={`text-2xl font-bold ${dadosAnuais.saldo_final >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(dadosAnuais.saldo_final)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Meses com Dados</div>
              <div className="text-2xl font-bold text-gray-900">
                {dadosAnuais.historico?.length || 0}
              </div>
            </div>
          </div>

          {/* Grafico de Evolucao */}
          {dadosAnuais.historico && dadosAnuais.historico.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-bold mb-4">Evolucao do Caixa - {ano}</h3>
              <LineChart
                data={dadosAnuais.historico.map(h => ({
                  name: h.mes_nome,
                  Entradas: h.entradas,
                  Saidas: h.saidas,
                  'Saldo Acumulado': h.saldo_acumulado
                }))}
                dataKeys={['Entradas', 'Saidas', 'Saldo Acumulado']}
                colors={['#10B981', '#EF4444', '#3B82F6']}
              />
            </div>
          )}

          {/* Tabela Mensal */}
          {dadosAnuais.historico && dadosAnuais.historico.length > 0 && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Entradas</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saidas</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Variacao</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {dadosAnuais.historico.map((h, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium">{h.mes_nome}</td>
                      <td className="px-6 py-4 text-right text-green-600">{formatCurrency(h.entradas)}</td>
                      <td className="px-6 py-4 text-right text-red-600">{formatCurrency(h.saidas)}</td>
                      <td className={`px-6 py-4 text-right font-medium ${h.variacao >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {h.variacao >= 0 ? '+' : ''}{formatCurrency(h.variacao)}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${h.saldo_acumulado >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {formatCurrency(h.saldo_acumulado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100 font-bold">
                  <tr>
                    <td className="px-6 py-4">TOTAL</td>
                    <td className="px-6 py-4 text-right text-green-700">{formatCurrency(dadosAnuais.total_entradas)}</td>
                    <td className="px-6 py-4 text-right text-red-700">{formatCurrency(dadosAnuais.total_saidas)}</td>
                    <td className={`px-6 py-4 text-right ${dadosAnuais.saldo_final >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                      {dadosAnuais.saldo_final >= 0 ? '+' : ''}{formatCurrency(dadosAnuais.saldo_final)}
                    </td>
                    <td className={`px-6 py-4 text-right ${dadosAnuais.saldo_final >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                      {formatCurrency(dadosAnuais.saldo_final)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Estado Vazio */}
      {!loading && viewMode === 'mensal' && !dados && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">Nenhum dado encontrado</h3>
          <p className="text-gray-500 mt-1">Nao ha movimentacoes financeiras para este periodo.</p>
        </div>
      )}
    </div>
  );
};

export default DFC;
