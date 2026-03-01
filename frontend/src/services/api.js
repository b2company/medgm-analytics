import axios from 'axios';

// Usar variável de ambiente ou fallback HTTPS
let API_URL = import.meta.env.VITE_API_URL || 'https://medgm-analytics-production.up.railway.app';

// GARANTIR que sempre use HTTPS (proteção extra)
if (API_URL.startsWith('http://')) {
  console.warn('⚠️ API_URL estava com HTTP, convertendo para HTTPS');
  API_URL = API_URL.replace('http://', 'https://');
}

console.log('🚀 API_URL configurada:', API_URL);
console.log('🔒 Protocolo:', API_URL.split('://')[0]);

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para garantir HTTPS (redirect_slashes=False no backend)
api.interceptors.request.use((config) => {
  // Forçar HTTPS no baseURL
  if (config.baseURL && config.baseURL.startsWith('http://')) {
    config.baseURL = config.baseURL.replace('http://', 'https://');
  }

  // Forçar HTTPS na URL
  if (config.url && config.url.startsWith('http://')) {
    config.url = config.url.replace('http://', 'https://');
  }

  // Log detalhado
  const fullUrl = axios.getUri(config);
  console.log('📡 Requisição para:', fullUrl);

  // Garantir que a URL final seja HTTPS
  if (fullUrl && fullUrl.startsWith('http://')) {
    console.warn('⚠️ URL com HTTP detectada, forçando HTTPS');
    config.baseURL = config.baseURL.replace('http://', 'https://');
  }

  return config;
});

// Interceptor de resposta para debug
api.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta recebida de:', response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ Erro na requisição:', error.config?.url);
    console.error('❌ Erro detalhes:', error.message);
    return Promise.reject(error);
  }
);

// ==================== METRICS ====================

export const getMetricsFinanceiro = async (mes, ano) => {
  const response = await api.get(`/metrics/financeiro`, { params: { mes, ano } });
  return response.data;
};

export const getMetricsComercial = async (mes, ano) => {
  const response = await api.get(`/metrics/comercial`, { params: { mes, ano } });
  return response.data;
};

export const getMetricsInteligencia = async (mes, ano) => {
  const response = await api.get(`/metrics/inteligencia`, { params: { mes, ano } });
  return response.data;
};

export const getAllMetrics = async () => {
  const response = await api.get(`/metrics/all`);
  return response.data;
};

// Novos endpoints detalhados
export const getFinanceiroDetalhado = async (mes, ano) => {
  const response = await api.get(`/metrics/financeiro/detalhado`, { params: { mes, ano } });
  return response.data;
};

export const getComercialDetalhado = async (mes, ano) => {
  const response = await api.get(`/metrics/comercial/detalhado`, { params: { mes, ano } });
  return response.data;
};

export const getInteligenciaDetalhado = async (mes, ano) => {
  const response = await api.get(`/metrics/inteligencia/detalhado`, { params: { mes, ano } });
  return response.data;
};

export const getFluxoCaixa = async (meses, mes_ref, ano_ref) => {
  const response = await api.get(`/metrics/financeiro/fluxo-caixa`, {
    params: { meses, mes_ref, ano_ref }
  });
  return response.data;
};

// ==================== UPLOAD ====================

export const uploadComercial = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/comercial', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadFinanceiro = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload/financeiro', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// ==================== CRUD FINANCEIRO ====================

export const createFinanceiro = async (data) => {
  const response = await api.post('/crud/financeiro', data);
  return response.data;
};

export const updateFinanceiro = async (id, data) => {
  const response = await api.put(`/crud/financeiro/${id}`, data);
  return response.data;
};

export const deleteFinanceiro = async (id) => {
  const response = await api.delete(`/crud/financeiro/${id}`);
  return response.data;
};

// ==================== CONFIG ====================

export const getConfigPessoas = async (funcao = null) => {
  const params = funcao ? { funcao } : {};
  const response = await api.get('/config/pessoas', { params });
  return response.data;
};

export const createPessoa = async (data) => {
  const response = await api.post('/config/pessoas', data);
  return response.data;
};

export const updatePessoa = async (id, data) => {
  const response = await api.put(`/config/pessoas/${id}`, data);
  return response.data;
};

export const deletePessoa = async (id) => {
  const response = await api.delete(`/config/pessoas/${id}`);
  return response.data;
};

export const getConfigProdutos = async () => {
  const response = await api.get('/config/produtos');
  return response.data;
};

export const createProduto = async (data) => {
  const response = await api.post('/config/produtos', data);
  return response.data;
};

export const updateProduto = async (id, data) => {
  const response = await api.put(`/config/produtos/${id}`, data);
  return response.data;
};

export const deleteProduto = async (id) => {
  const response = await api.delete(`/config/produtos/${id}`);
  return response.data;
};

export const getConfigFunis = async () => {
  const response = await api.get('/config/funis');
  return response.data;
};

export const createFunil = async (data) => {
  const response = await api.post('/config/funis', data);
  return response.data;
};

export const updateFunil = async (id, data) => {
  const response = await api.put(`/config/funis/${id}`, data);
  return response.data;
};

export const deleteFunil = async (id) => {
  const response = await api.delete(`/config/funis/${id}`);
  return response.data;
};

export const getConfigResumo = async () => {
  const response = await api.get('/config/resumo');
  return response.data;
};

export const getPessoasResumo = async (mes, ano, funcao = null) => {
  const params = { mes, ano };
  if (funcao) params.funcao = funcao;
  const response = await api.get('/config/pessoas/resumo', { params });
  return response.data;
};

export const consolidarMetricasMes = async (mes, ano) => {
  const response = await api.put('/comercial/consolidar-mes', null, { params: { mes, ano } });
  return response.data;
};

export const seedConfig = async () => {
  const response = await api.post('/config/seed');
  return response.data;
};

// ==================== EXPORT ====================

export const exportFinanceiro = async (mes, ano) => {
  window.open(`${API_URL}/export/financeiro?mes=${mes}&ano=${ano}`, '_blank');
};

export const exportVendas = async (mes, ano) => {
  window.open(`${API_URL}/export/vendas?mes=${mes}&ano=${ano}`, '_blank');
};

export const exportCompleto = async (mes, ano) => {
  window.open(`${API_URL}/export/completo?mes=${mes}&ano=${ano}`, '_blank');
};

export const exportPeriodo = async (mesInicio, anoInicio, mesFim, anoFim, tipo = 'completo') => {
  window.open(
    `${API_URL}/export/periodo?mes_inicio=${mesInicio}&ano_inicio=${anoInicio}&mes_fim=${mesFim}&ano_fim=${anoFim}&tipo=${tipo}`,
    '_blank'
  );
};

// ==================== IMPORT ====================

export const importCSV = async (file, tipo) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/import/${tipo}/csv`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const previewCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/import/preview', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getCSVTemplate = async (tipo) => {
  const response = await api.get(`/import/templates/${tipo}`);
  return response.data;
};

// ==================== FUNIL ====================

export const getFunilCompleto = async (mes, ano, agrupamento = 'geral') => {
  const response = await api.get('/funil/completo', { params: { mes, ano, agrupamento } });
  return response.data;
};

export const getFunilHistorico = async (ano) => {
  const response = await api.get('/funil/historico', { params: { ano } });
  return response.data;
};

// ==================== METAS ====================

export const getMetaPessoaMes = async (pessoaNome, mes, ano) => {
  const response = await api.get('/metas/pessoa-mes', {
    params: { pessoa_nome: pessoaNome, mes, ano }
  });
  return response.data;
};

export const getMetas = async (mes = null, ano = null, pessoaId = null) => {
  const params = {};
  if (mes) params.mes = mes;
  if (ano) params.ano = ano;
  if (pessoaId) params.pessoa_id = pessoaId;
  const response = await api.get('/metas', { params });
  return response.data;
};

export const createMeta = async (data) => {
  const response = await api.post('/metas', data);
  return response.data;
};

export const updateMeta = async (id, data) => {
  const response = await api.put(`/metas/${id}`, data);
  return response.data;
};

export const deleteMeta = async (id) => {
  const response = await api.delete(`/metas/${id}`);
  return response.data;
};

export const replicarMetas = async (mesDestino, anoDestino, mesOrigem = null, anoOrigem = null) => {
  const params = { mes_destino: mesDestino, ano_destino: anoDestino };
  if (mesOrigem) params.mes_origem = mesOrigem;
  if (anoOrigem) params.ano_origem = anoOrigem;
  const response = await api.post('/metas/replicar-mes', null, { params });
  return response.data;
};

export const calcularRealizado = async (mes, ano) => {
  const response = await api.put('/metas/calcular-realizado', null, { params: { mes, ano } });
  return response.data;
};

export const getHistoricoPessoa = async (pessoaId) => {
  const response = await api.get(`/metas/historico/${pessoaId}`);
  return response.data;
};

export const getMetaEmpresa = async (ano) => {
  const response = await api.get(`/metas/empresa/${ano}`);
  return response.data;
};

export const updateMetaEmpresa = async (ano, data) => {
  const response = await api.put(`/metas/empresa/${ano}`, data);
  return response.data;
};

export const calcularAcumuladoEmpresa = async (ano) => {
  const response = await api.put(`/metas/empresa/${ano}/calcular-acumulado`);
  return response.data;
};

// ==================== DEMONSTRATIVOS ====================

export const getDFC = async (mes, ano) => {
  const response = await api.get('/demonstrativos/dfc', { params: { mes, ano } });
  return response.data;
};

export const getDRE = async (mes, ano) => {
  const response = await api.get('/demonstrativos/dre', { params: { mes, ano } });
  return response.data;
};

export const getDFCAnual = async (ano) => {
  const response = await api.get('/demonstrativos/dfc/anual', { params: { ano } });
  return response.data;
};

export const getDREAnual = async (ano) => {
  const response = await api.get('/demonstrativos/dre/anual', { params: { ano } });
  return response.data;
};

// ==================== PROJEÇÃO ====================

export const getProjecaoCaixa = async (mesesFuturo = 3, mesRef = null, anoRef = null) => {
  const params = { meses_futuro: mesesFuturo };
  if (mesRef) params.mes_ref = mesRef;
  if (anoRef) params.ano_ref = anoRef;
  const response = await api.get('/projecao/caixa', { params });
  return response.data;
};

export const getScorecardsIndividuais = async (mes, ano) => {
  const response = await api.get('/comercial/scorecard-individual', { params: { mes, ano } });
  return response.data;
};

export const getPontoEquilibrio = async (mes, ano) => {
  const response = await api.get('/projecao/ponto-equilibrio', { params: { mes, ano } });
  return response.data;
};

export const getRunway = async (mes, ano) => {
  const response = await api.get('/projecao/runway', { params: { mes, ano } });
  return response.data;
};

export const getTrackingDiarioSS = async (mes, ano, vendedor = null) => {
  const params = { mes, ano };
  if (vendedor) params.vendedor = vendedor;
  const response = await api.get('/comercial/social-selling/tracking-diario', { params });
  return response.data;
};

export const getDashboardGeral = async (mes, ano, funil = 'todos') => {
  const response = await api.get('/comercial/dashboard/geral', { params: { mes, ano, funil } });
  return response.data;
};

// ==================== VENDAS ====================

export const getVendas = async (mes = null, ano = null, closer = null, funil = null) => {
  const params = {};
  if (mes) params.mes = mes;
  if (ano) params.ano = ano;
  if (closer) params.closer = closer;
  if (funil) params.funil = funil;
  const response = await api.get('/vendas', { params });
  return response.data || []; // API retorna array direto
};

export const getVenda = async (id) => {
  const response = await api.get(`/vendas/${id}`);
  return response.data;
};

export const createVenda = async (data) => {
  const response = await api.post('/vendas', data);
  return response.data;
};

export const updateVenda = async (id, data) => {
  const response = await api.put(`/vendas/${id}`, data);
  return response.data;
};

export const deleteVenda = async (id) => {
  const response = await api.delete(`/vendas/${id}`);
  return response.data;
};

export default api;
