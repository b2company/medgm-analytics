import React, { useState, useEffect } from 'react';
import { DollarSign, Calendar } from 'lucide-react';
import { getConfigProdutos } from '../services/api';
import { Form, FormRow } from './FormField';
import Select from './Select';
import Input from './Input';
import Button from './Button';

/**
 * FinanceiroForm - Formulário premium para transações financeiras
 * Design System MedGM 2026
 */
const FinanceiroForm = ({ onSubmit, initialData = null, onCancel, loading = false }) => {
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
      console.error('Erro ao carregar configurações:', error);
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

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Opções dinâmicas para categoria
  const categoriaOptions = formData.tipo === 'entrada'
    ? [
        ...produtos.filter(p => p.ativo).map(p => ({ value: p.nome, label: p.nome })),
        ...categoriasEntrada.map(cat => ({ value: cat, label: cat }))
      ]
    : categoriasSaida.map(cat => ({ value: cat, label: cat }));

  return (
    <Form onSubmit={handleSubmit} className="card-premium p-6">
      {/* Tipo de Transação */}
      <Select
        label="Tipo de transação"
        value={formData.tipo}
        onChange={(e) => handleChange('tipo', e.target.value)}
        options={[
          { value: 'entrada', label: 'Entrada (Receita)' },
          { value: 'saida', label: 'Saída (Despesa)' }
        ]}
        required
      />

      {/* Categoria */}
      <Select
        label="Categoria"
        value={formData.categoria}
        onChange={(e) => handleChange('categoria', e.target.value)}
        options={categoriaOptions}
        placeholder="Selecione uma categoria"
        required
        helperText={formData.tipo === 'entrada' ? 'Produto ou tipo de receita' : 'Tipo de despesa'}
      />

      {/* Campos de Categorização de Custos (apenas para saídas) */}
      {formData.tipo === 'saida' && (
        <>
          <Select
            label="Tipo de Custo"
            value={formData.tipo_custo}
            onChange={(e) => handleChange('tipo_custo', e.target.value)}
            options={[
              { value: 'Fixo', label: 'Fixo - Não varia com volume de vendas' },
              { value: 'Variável', label: 'Variável - Varia com volume de vendas (CMV)' },
              { value: 'Investimento', label: 'Investimento - Despesa não recorrente que gera retorno' },
              { value: 'Pontual', label: 'Pontual - Despesa única, não recorrente' }
            ]}
            placeholder="Selecione o tipo de custo"
            required
            helperText="Fixo: Aluguel, Salários | Variável: Comissões | Investimento: Software | Pontual: Multa"
          />

          <Select
            label="Centro de Custo"
            value={formData.centro_custo}
            onChange={(e) => handleChange('centro_custo', e.target.value)}
            options={[
              { value: 'Comercial', label: 'Comercial - Vendas, SDR, Closers' },
              { value: 'Operacao', label: 'Operação - Entrega, CS, Implementação' },
              { value: 'Marketing', label: 'Marketing - Ads, Social Selling, Conteúdo' },
              { value: 'Administrativo', label: 'Administrativo - RH, Financeiro, Jurídico' },
              { value: 'Diretoria', label: 'Diretoria - CEO, Sócios' },
              { value: 'Financeiro', label: 'Financeiro - Juros, Taxas, IOF' }
            ]}
            placeholder="Selecione o centro de custo"
            required
            helperText="Para análise por área"
          />
        </>
      )}

      {/* Descrição */}
      <Input
        label="Descrição"
        value={formData.descricao}
        onChange={(e) => handleChange('descricao', e.target.value)}
        placeholder="Descrição adicional (opcional)"
      />

      {/* Valor e Data em linha */}
      <FormRow>
        <Input
          type="number"
          label="Valor (R$)"
          value={formData.valor}
          onChange={(e) => handleChange('valor', e.target.value)}
          leftIcon={DollarSign}
          placeholder="0,00"
          step="0.01"
          required
        />

        <Input
          type="date"
          label="Data"
          value={formData.data}
          onChange={(e) => handleChange('data', e.target.value)}
          leftIcon={Calendar}
          required
        />
      </FormRow>

      {/* Status */}
      <Select
        label="Status"
        value={formData.previsto_realizado}
        onChange={(e) => handleChange('previsto_realizado', e.target.value)}
        options={[
          { value: 'previsto', label: 'Previsto' },
          { value: 'realizado', label: 'Realizado' }
        ]}
      />

      {/* Botões de Ação */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          className="flex-1"
        >
          {initialData ? 'Atualizar' : 'Salvar'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancelar
        </Button>
      </div>
    </Form>
  );
};

export default FinanceiroForm;
