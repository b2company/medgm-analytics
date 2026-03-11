import React, { useState } from 'react';
import { uploadComercial, uploadFinanceiro } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [type, setType] = useState('comercial');
  const [uploadType, setUploadType] = useState('excel'); // excel ou csv
  const [csvType, setCsvType] = useState('financeiro'); // para CSV
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
    setPreviewData(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'danger', text: 'Selecione um arquivo' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      if (uploadType === 'excel') {
        const response = type === 'comercial'
          ? await uploadComercial(file)
          : await uploadFinanceiro(file);

        setMessage({ type: 'success', text: response.message || 'Upload realizado com sucesso!' });
      } else {
        // CSV upload
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/import/${csvType}/csv`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          setMessage({
            type: 'success',
            text: `${data.message}. Importados: ${data.importados}, Erros: ${data.erros}`
          });
        } else {
          setMessage({ type: 'danger', text: data.detail || 'Erro ao importar CSV' });
        }
      }
      setFile(null);
      setPreviewData(null);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.detail || 'Erro ao fazer upload'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewCSV = async () => {
    if (!file) {
      setMessage({ type: 'danger', text: 'Selecione um arquivo' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/import/preview?linhas=5`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setPreviewData(data);
      } else {
        setMessage({ type: 'danger', text: data.detail || 'Erro ao visualizar CSV' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Erro ao visualizar CSV' });
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = async (tipo) => {
    try {
      const response = await fetch(`${API_URL}/import/templates/${tipo}`);
      const data = await response.json();

      if (response.ok) {
        // Criar CSV para download
        const csvContent = `${data.csv_header}\n${data.csv_exemplo}`;
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `template_${tipo}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        setMessage({ type: 'danger', text: 'Erro ao baixar template' });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'Erro ao baixar template' });
    }
  };

  const csvTypes = [
    { value: 'financeiro', label: 'Financeiro' },
    { value: 'vendas', label: 'Vendas' },
    { value: 'social-selling', label: 'Social Selling' },
    { value: 'sdr', label: 'SDR' },
    { value: 'closer', label: 'Closer' }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload de Dados</h1>

      {/* Tipo de Upload */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Tipo de Upload</h2>
        <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => { setUploadType('excel'); setFile(null); setPreviewData(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadType === 'excel'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Excel (.xlsx)
          </button>
          <button
            onClick={() => { setUploadType('csv'); setFile(null); setPreviewData(null); }}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadType === 'csv'
                ? 'bg-white shadow text-gray-900'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            CSV
          </button>
        </div>
      </div>

      {/* Upload Excel */}
      {uploadType === 'excel' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Planilha
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="comercial">Comercial</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arquivo Excel (.xlsx)
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition"
            />
            {file && (
              <p className="mt-2 text-sm text-gray-600">
                Arquivo selecionado: {file.name}
              </p>
            )}
          </div>

          {message && (
            <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={loading || !file}
            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Enviando...' : 'Fazer Upload'}
          </button>
        </div>
      )}

      {/* Upload CSV */}
      {uploadType === 'csv' && (
        <div className="space-y-6">
          {/* Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Templates CSV</h3>
            <p className="text-sm text-gray-600 mb-4">
              Baixe um template CSV para ver o formato esperado para cada tipo de dados.
            </p>
            <div className="flex flex-wrap gap-3">
              {csvTypes.map(t => (
                <button
                  key={t.value}
                  onClick={() => downloadTemplate(t.value.replace('-', '_'))}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition"
                >
                  Template {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Upload */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Dados
              </label>
              <select
                value={csvType}
                onChange={(e) => setCsvType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {csvTypes.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arquivo CSV
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary transition"
              />
              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Arquivo selecionado: {file.name}
                </p>
              )}
            </div>

            {message && (
              <div className={`rounded-lg p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.text}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handlePreviewCSV}
                disabled={loading || !file}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Carregando...' : 'Visualizar Preview'}
              </button>
              <button
                onClick={handleUpload}
                disabled={loading || !file}
                className="flex-1 bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {loading ? 'Importando...' : 'Importar CSV'}
              </button>
            </div>
          </div>

          {/* Preview */}
          {previewData && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview do CSV</h3>
              <div className="mb-4 text-sm text-gray-600">
                <p>Arquivo: {previewData.arquivo}</p>
                <p>Total de linhas: {previewData.total_linhas}</p>
                <p>Colunas: {previewData.colunas.join(', ')}</p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {previewData.colunas.map(col => (
                        <th key={col} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {previewData.preview.map((row, idx) => (
                      <tr key={idx}>
                        {previewData.colunas.map(col => (
                          <td key={col} className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {row[col] !== null && row[col] !== undefined ? String(row[col]) : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instrucoes */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Instrucoes</h3>
        <div className="space-y-4 text-sm text-blue-800">
          {uploadType === 'excel' ? (
            <>
              <p><strong>Planilha Comercial:</strong> Deve conter dados de vendas com colunas como data, cliente, valor, funil, vendedor, etc.</p>
              <p><strong>Planilha Financeiro:</strong> Deve conter dados de entradas e saidas com colunas como tipo, categoria, valor, data, etc.</p>
              <p>O sistema tentara identificar automaticamente as colunas e importar os dados.</p>
            </>
          ) : (
            <>
              <p><strong>Formato:</strong> O arquivo deve estar no formato CSV (separado por virgulas ou ponto e virgula).</p>
              <p><strong>Encoding:</strong> Suportamos UTF-8, Latin-1 e CP1252.</p>
              <p><strong>Datas:</strong> Formatos aceitos: YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY</p>
              <p><strong>Valores:</strong> Use ponto ou virgula como separador decimal.</p>
              <p>Baixe um template para ver o formato esperado de cada tipo de dados.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Upload;
