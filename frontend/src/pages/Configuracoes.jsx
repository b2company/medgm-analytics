import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Configuracoes = ({ activeTab = 'equipe' }) => {
  // activeTab agora vem como prop do Config.jsx
  const [activeSubTab, setActiveSubTab] = useState('social_selling');
  const [loading, setLoading] = useState(false);

  // Estado dos dados
  const [pessoas, setPessoas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [funis, setFunis] = useState([]);
  const [resumo, setResumo] = useState(null);

  // Estado dos modais
  const [showPessoaModal, setShowPessoaModal] = useState(false);
  const [showProdutoModal, setShowProdutoModal] = useState(false);
  const [showFunilModal, setShowFunilModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pessoasRes, produtosRes, funisRes, resumoRes] = await Promise.all([
        fetch(`${API_URL}/config/pessoas`),
        fetch(`${API_URL}/config/produtos`),
        fetch(`${API_URL}/config/funis`),
        fetch(`${API_URL}/config/resumo`)
      ]);

      const pessoasData = await pessoasRes.json();
      const produtosData = await produtosRes.json();
      const funisData = await funisRes.json();
      const resumoData = await resumoRes.json();

      setPessoas(pessoasData.pessoas || []);
      setProdutos(produtosData.produtos || []);
      setFunis(funisData.funis || []);
      setResumo(resumoData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const seedData = async () => {
    if (!confirm('Isso criará dados iniciais padrão. Continuar?')) return;

    try {
      const response = await fetch(`${API_URL}/config/seed`, { method: 'POST' });
      const data = await response.json();
      alert(data.message);
      fetchData();
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao criar dados iniciais');
    }
  };

  // Filtrar pessoas por função
  const getPessoasPorFuncao = (funcao) => {
    return pessoas.filter(p => p.funcao === funcao);
  };

  // CRUD Pessoa
  const handleSavePessoa = async (formData) => {
    try {
      const url = editingItem
        ? `${API_URL}/config/pessoas/${editingItem.id}`
        : `${API_URL}/config/pessoas`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingItem ? 'Pessoa atualizada!' : 'Pessoa criada!');
        setShowPessoaModal(false);
        setEditingItem(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar pessoa');
    }
  };

  const handleDeletePessoa = async (id) => {
    if (!confirm('Tem certeza que deseja deletar esta pessoa?')) return;

    try {
      const response = await fetch(`${API_URL}/config/pessoas/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Pessoa deletada!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // CRUD Produto
  const handleSaveProduto = async (formData) => {
    try {
      const url = editingItem
        ? `${API_URL}/config/produtos/${editingItem.id}`
        : `${API_URL}/config/produtos`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingItem ? 'Produto atualizado!' : 'Produto criado!');
        setShowProdutoModal(false);
        setEditingItem(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleDeleteProduto = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este produto?')) return;

    try {
      const response = await fetch(`${API_URL}/config/produtos/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Produto deletado!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  // CRUD Funil
  const handleSaveFunil = async (formData) => {
    try {
      const url = editingItem
        ? `${API_URL}/config/funis/${editingItem.id}`
        : `${API_URL}/config/funis`;
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(editingItem ? 'Funil atualizado!' : 'Funil criado!');
        setShowFunilModal(false);
        setEditingItem(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erro: ${error.detail}`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao salvar funil');
    }
  };

  const handleDeleteFunil = async (id) => {
    if (!confirm('Tem certeza que deseja deletar este funil?')) return;

    try {
      const response = await fetch(`${API_URL}/config/funis/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('Funil deletado!');
        fetchData();
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const funcaoLabels = {
    social_selling: 'Social Selling',
    sdr: 'SDR',
    closer: 'Closer'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuracoes</h1>
          <p className="text-gray-600 mt-2">Gerencie equipe, produtos e funis de venda</p>
        </div>
        <button
          onClick={seedData}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm"
        >
          Criar dados iniciais
        </button>
      </div>

      {/* Cards de Resumo */}
      {resumo && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipe</h3>
            <div className="text-3xl font-bold text-blue-600">{resumo.pessoas?.ativos || 0}</div>
            <p className="text-sm text-gray-600">pessoas ativas</p>
            <div className="mt-4 space-y-1 text-sm">
              {resumo.pessoas?.por_funcao && Object.entries(resumo.pessoas.por_funcao).map(([funcao, qtd]) => (
                <div key={funcao} className="flex justify-between">
                  <span className="text-gray-600">{funcaoLabels[funcao] || funcao}</span>
                  <span className="font-semibold">{qtd}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Produtos</h3>
            <div className="text-3xl font-bold text-green-600">{resumo.produtos?.ativos || 0}</div>
            <p className="text-sm text-gray-600">produtos ativos</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Funis</h3>
            <div className="text-3xl font-bold text-purple-600">{resumo.funis?.ativos || 0}</div>
            <p className="text-sm text-gray-600">funis ativos</p>
          </div>
        </div>
      )}

      {/* Tabs removidas - agora são gerenciadas pelo Config.jsx */}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      ) : (
        <>
          {/* Tab Equipe */}
          {activeTab === 'equipe' && (
            <div>
              {/* Sub-tabs */}
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6 w-fit">
                {['social_selling', 'sdr', 'closer'].map(funcao => (
                  <button
                    key={funcao}
                    onClick={() => setActiveSubTab(funcao)}
                    className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeSubTab === funcao
                        ? 'bg-white shadow text-gray-900'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {funcaoLabels[funcao]}
                  </button>
                ))}
              </div>

              {/* Botão adicionar */}
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowPessoaModal(true);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium"
                >
                  + Nova Pessoa
                </button>
              </div>

              {/* Tabela de Pessoas */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Senioridade</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {getPessoasPorFuncao(activeSubTab).map(pessoa => (
                      <tr key={pessoa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {pessoa.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            pessoa.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {pessoa.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Nível {pessoa.nivel_senioridade || 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setEditingItem(pessoa);
                              setShowPessoaModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeletePessoa(pessoa.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {getPessoasPorFuncao(activeSubTab).length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                          Nenhuma pessoa cadastrada nesta função.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Produtos */}
          {activeTab === 'produtos' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowProdutoModal(true);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium"
                >
                  + Novo Produto
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Visível</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {produtos.map(produto => (
                      <tr key={produto.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {produto.nome}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          {produto.categoria || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {produto.plano ? (
                            <span className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded font-medium">
                              {produto.plano}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            produto.status === 'ativo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {produto.status || 'ativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            produto.ativo
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {produto.ativo ? 'Sim' : 'Não'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setEditingItem(produto);
                              setShowProdutoModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteProduto(produto.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {produtos.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          Nenhum produto cadastrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Funis */}
          {activeTab === 'funis' && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowFunilModal(true);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-medium"
                >
                  + Novo Funil
                </button>
              </div>

              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descricao</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ordem</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {funis.map(funil => (
                      <tr key={funil.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                          {funil.nome}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {funil.descricao || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">
                          {funil.ordem}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            funil.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {funil.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setEditingItem(funil);
                              setShowFunilModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteFunil(funil.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Deletar
                          </button>
                        </td>
                      </tr>
                    ))}
                    {funis.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                          Nenhum funil cadastrado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Pessoa */}
      <Modal
        isOpen={showPessoaModal}
        title={editingItem ? 'Editar Pessoa' : 'Nova Pessoa'}
        onClose={() => {
          setShowPessoaModal(false);
          setEditingItem(null);
        }}
      >
        <PessoaForm
          initialData={editingItem}
          defaultFuncao={activeSubTab}
          onSubmit={handleSavePessoa}
          onClose={() => {
            setShowPessoaModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* Modal Produto */}
      <Modal
        isOpen={showProdutoModal}
        title={editingItem ? 'Editar Produto' : 'Novo Produto'}
        onClose={() => {
          setShowProdutoModal(false);
          setEditingItem(null);
        }}
      >
        <ProdutoForm
          initialData={editingItem}
          onSubmit={handleSaveProduto}
          onClose={() => {
            setShowProdutoModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>

      {/* Modal Funil */}
      <Modal
        isOpen={showFunilModal}
        title={editingItem ? 'Editar Funil' : 'Novo Funil'}
        onClose={() => {
          setShowFunilModal(false);
          setEditingItem(null);
        }}
      >
        <FunilForm
          initialData={editingItem}
          onSubmit={handleSaveFunil}
          onClose={() => {
            setShowFunilModal(false);
            setEditingItem(null);
          }}
        />
      </Modal>
    </div>
  );
};

// ==================== FORMULÁRIOS ====================

const PessoaForm = ({ initialData, defaultFuncao, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    funcao: initialData?.funcao || defaultFuncao || 'social_selling',
    ativo: initialData?.ativo !== undefined ? initialData.ativo : true,
    nivel_senioridade: initialData?.nivel_senioridade || 1
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const data = {
      ...formData,
      nivel_senioridade: parseInt(formData.nivel_senioridade) || 1
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Funcao *</label>
        <select
          name="funcao"
          value={formData.funcao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="social_selling">Social Selling</option>
          <option value="sdr">SDR</option>
          <option value="closer">Closer</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nível de Senioridade *</label>
        <select
          name="nivel_senioridade"
          value={formData.nivel_senioridade}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="1">Nível 1 - Júnior I</option>
          <option value="2">Nível 2 - Júnior II</option>
          <option value="3">Nível 3 - Pleno I</option>
          <option value="4">Nível 4 - Pleno II</option>
          <option value="5">Nível 5 - Sênior</option>
          <option value="6">Nível 6 - Especialista</option>
          <option value="7">Nível 7 - C-Level</option>
        </select>
        <p className="mt-1 text-xs text-gray-500">Define o nível hierárquico da pessoa na equipe</p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="ativo"
          checked={formData.ativo}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">Ativo</label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> As metas individuais agora são gerenciadas na aba "Metas" do sistema. Configure metas mensais específicas para cada pessoa.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

const ProdutoForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    categoria: initialData?.categoria || '',
    plano: initialData?.plano || '',
    status: initialData?.status || 'ativo',
    ativo: initialData?.ativo !== undefined ? initialData.ativo : true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    // Enviar dados com plano único
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          name="categoria"
          value={formData.categoria}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="">Selecione...</option>
          <option value="Assessoria">Assessoria</option>
          <option value="Consultoria">Consultoria</option>
          <option value="Programa">Programa</option>
          <option value="Servico">Serviço</option>
          <option value="Outros">Outros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Plano</label>
        <input
          type="text"
          name="plano"
          value={formData.plano}
          onChange={handleChange}
          placeholder="Ex: Start, Select, Premium"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">Deixe em branco se o produto não tem planos específicos</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="ativo"
          checked={formData.ativo}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">Ativo (visível no sistema)</label>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Cada combinação de Produto + Plano é um registro separado. Para produtos com múltiplos planos, crie um registro para cada plano.
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

const FunilForm = ({ initialData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    nome: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    ordem: initialData?.ordem || 0,
    ativo: initialData?.ativo !== undefined ? initialData.ativo : true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      alert('Nome é obrigatório');
      return;
    }

    const data = {
      ...formData,
      ordem: parseInt(formData.ordem) || 0
    };

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
        <input
          type="text"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
        <input
          type="text"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ordem</label>
        <input
          type="number"
          name="ordem"
          value={formData.ordem}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="ativo"
          checked={formData.ativo}
          onChange={handleChange}
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="ml-2 text-sm text-gray-700">Ativo</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600"
        >
          Salvar
        </button>
      </div>
    </form>
  );
};

export default Configuracoes;
