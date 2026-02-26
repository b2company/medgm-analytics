import React, { useState, useEffect } from 'react';
import { getConfigProdutos } from '../services/api';

const FinanceiroForm = ({ onSubmit, initialData = null, onCancel }) => {
  const [produtos, setProdutos] = useState([]);

  const categoriasEntrada = [
    'Venda', 'Recorrencia', 'Mensalidade', 'Consultoria',
    'Assessoria', 'Programa', 'Outros'
  ];

  const categoriasSaida = [
    'Equipe', 'Salario', 'Ferramenta', 'Marketing',
    'Aluguel', 'Imposto', 'Pro-labore', 'Fornecedor', 'Outros'
  ];

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const produtosRes = await getConfigProdutos();
      setProdutos(produtosRes.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar configuracoes:', error);
    }
  };

  const [formData, setFormData] = useState(initialData || {
    tipo: 'entrada',
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    previsto_realizado: 'realizado',
    tipo_custo: '',
    centro_custo: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const mes = parseInt(formData.data.split('-')[1]);
    const ano = parseInt(formData.data.split('-')[0]);
    onSubmit({ ...formData, mes, ano, valor: parseFloat(formData.valor) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select
          value={formData.tipo}
          onChange={(e) => setFormData({...formData, tipo: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="entrada">Entrada</option>
          <option value="saida">Saída</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
        <select
          value={formData.categoria}
          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        >
          <option value="">Selecione</option>
          {formData.tipo === 'entrada' ? (
            <>
              {produtos.filter(p => p.ativo).map(p => (
                <option key={p.id} value={p.nome}>{p.nome}</option>
              ))}
              {categoriasEntrada.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </>
          ) : (
            categoriasSaida.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))
          )}
        </select>
      </div>

      {/* Campos de Categorização de Custos (apenas para saídas) */}
      {formData.tipo === 'saida' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Custo *
              <span className="text-xs text-gray-500 ml-2">(Categorização para DRE)</span>
            </label>
            <select
              value={formData.tipo_custo}
              onChange={(e) => setFormData({...formData, tipo_custo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Selecione</option>
              <option value="Fixo">Fixo - Não varia com volume de vendas</option>
              <option value="Variável">Variável - Varia com volume de vendas (CMV)</option>
              <option value="Investimento">Investimento - Despesa não recorrente que gera retorno</option>
              <option value="Pontual">Pontual - Despesa única, não recorrente</option>
            </select>
            <div className="text-xs text-gray-500 mt-1">
              <strong>Fixo:</strong> Aluguel, Salários | <strong>Variável:</strong> Comissões, Custos de entrega |
              <strong>Investimento:</strong> Software, Equipamentos | <strong>Pontual:</strong> Multa, Bônus único
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Centro de Custo *
              <span className="text-xs text-gray-500 ml-2">(Para análise por área)</span>
            </label>
            <select
              value={formData.centro_custo}
              onChange={(e) => setFormData({...formData, centro_custo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              required
            >
              <option value="">Selecione</option>
              <option value="Comercial">Comercial - Vendas, SDR, Closers</option>
              <option value="Operacao">Operação - Entrega, CS, Implementação</option>
              <option value="Marketing">Marketing - Ads, Social Selling, Conteúdo</option>
              <option value="Administrativo">Administrativo - RH, Financeiro, Jurídico</option>
              <option value="Diretoria">Diretoria - CEO, Sócios</option>
              <option value="Financeiro">Financeiro - Juros, Taxas, IOF</option>
            </select>
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <input
          type="text"
          value={formData.descricao}
          onChange={(e) => setFormData({...formData, descricao: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Descrição adicional (opcional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
        <input
          type="number"
          step="0.01"
          value={formData.valor}
          onChange={(e) => setFormData({...formData, valor: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
          placeholder="0.00"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
        <input
          type="date"
          value={formData.data}
          onChange={(e) => setFormData({...formData, data: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formData.previsto_realizado}
          onChange={(e) => setFormData({...formData, previsto_realizado: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="previsto">Previsto</option>
          <option value="realizado">Realizado</option>
        </select>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-primary text-white py-2 rounded-lg hover:bg-blue-600 font-medium transition-colors"
        >
          Salvar
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};

export default FinanceiroForm;
