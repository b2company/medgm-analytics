import React, { useState } from 'react';
import { uploadComercial } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const UploadComercialModal = ({ isOpen, onClose, tipo }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${API_URL}/comercial/template/${tipo}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `template_${tipo}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: 'Erro ao baixar planilha modelo'
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage({ type: 'danger', text: 'Selecione um arquivo' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/comercial/upload/${tipo}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: 'success',
          text: `${data.message}! Importados: ${data.importados}, Erros: ${data.erros}`
        });
      } else {
        setMessage({ type: 'danger', text: data.detail || 'Erro ao fazer upload' });
      }

      setTimeout(() => {
        setFile(null);
        setMessage(null);
        onClose(true); // true = sucesso, recarregar dados
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'danger',
        text: error.response?.data?.detail || 'Erro ao fazer upload'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Upload em Massa</h2>
          <button onClick={() => onClose(false)} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Botão para baixar planilha modelo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">Primeiro passo</p>
                <p className="text-xs text-blue-700 mt-1">Baixe a planilha modelo, preencha e faça o upload</p>
                <button
                  onClick={handleDownloadTemplate}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
                >
                  📥 Baixar Planilha Modelo
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Selecione o arquivo Excel
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Arquivo Excel (.xlsx) com os dados preenchidos conforme modelo
            </p>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Fazer Upload'}
            </button>
            <button
              onClick={() => onClose(false)}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadComercialModal;
