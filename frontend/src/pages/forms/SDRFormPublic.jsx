import React, { useState, useEffect } from 'react';
import { getConfigPessoas, getConfigFunis } from '../../services/api';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const SDRFormPublic = () => {
  const today = new Date().toISOString().split('T')[0];
  const [formData, setFormData] = useState({
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    data: today,
    sdr: '',
    funil: 'SS',
    leads_recebidos: 0,
    reunioes_agendadas: 0,
    reunioes_realizadas: 0
  });

  const [sdrs, setSdrs] = useState([]);
  const [funis, setFunis] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const [sdrsRes, funisRes] = await Promise.all([
        getConfigPessoas('sdr'),
        getConfigFunis()
      ]);
      setSdrs(sdrsRes.pessoas || []);
      setFunis(funisRes.funis || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['leads_recebidos', 'reunioes_agendadas', 'reunioes_realizadas', 'mes', 'ano'].includes(name)
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await axios.post(`${API_URL}/comercial/sdr`, formData);
      setMessage({ type: 'success', text: 'Métrica registrada com sucesso!' });

      // Reset form
      setFormData({
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        data: today,
        sdr: '',
        funil: 'SS',
        leads_recebidos: 0,
        reunioes_agendadas: 0,
        reunioes_realizadas: 0
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Erro ao registrar métrica. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MedGM Analytics</h1>
            <p className="text-lg text-gray-600">Formulário de SDR</p>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Data *</label>
                <input
                  type="date"
                  name="data"
                  value={formData.data}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SDR *</label>
                <select
                  name="sdr"
                  value={formData.sdr}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Selecione</option>
                  {sdrs.filter(s => s.ativo).map(s => (
                    <option key={s.id} value={s.nome}>{s.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mês *</label>
                <select
                  name="mes"
                  value={formData.mes}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {new Date(2000, i).toLocaleString('pt-BR', { month: 'long' })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ano *</label>
                <select
                  name="ano"
                  value={formData.ano}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Funil *</label>
              <select
                name="funil"
                value={formData.funil}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              >
                {funis.filter(f => f.ativo).map(f => (
                  <option key={f.id} value={f.nome}>{f.nome}</option>
                ))}
                {funis.length === 0 && (
                  <>
                    <option value="SS">SS</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Indicacao">Indicação</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Leads Recebidos *</label>
              <input
                type="number"
                name="leads_recebidos"
                value={formData.leads_recebidos}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reuniões Agendadas *</label>
              <input
                type="number"
                name="reunioes_agendadas"
                value={formData.reunioes_agendadas}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reuniões Realizadas *</label>
              <input
                type="number"
                name="reunioes_realizadas"
                value={formData.reunioes_realizadas}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                min="0"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Registrar Métrica'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SDRFormPublic;
