import React, { createContext, useContext, useState, useCallback } from 'react';
import { getConfigPessoas, getConfigProdutos, getConfigFunis, getConfigResumo } from '../services/api';

const ConfigContext = createContext();

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within ConfigProvider');
  }
  return context;
};

export const ConfigProvider = ({ children }) => {
  const [pessoas, setPessoas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [funis, setFunis] = useState([]);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Buscar todas as configurações
  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const [pessoasRes, produtosRes, funisRes, resumoRes] = await Promise.all([
        getConfigPessoas(),
        getConfigProdutos(),
        getConfigFunis(),
        getConfigResumo()
      ]);

      setPessoas(pessoasRes.pessoas || []);
      setProdutos(produtosRes.produtos || []);
      setFunis(funisRes.funis || []);
      setResumo(resumoRes);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar apenas pessoas (otimização)
  const fetchPessoas = useCallback(async () => {
    try {
      const pessoasRes = await getConfigPessoas();
      setPessoas(pessoasRes.pessoas || []);
    } catch (error) {
      console.error('Erro ao carregar pessoas:', error);
    }
  }, []);

  // Buscar apenas produtos
  const fetchProdutos = useCallback(async () => {
    try {
      const produtosRes = await getConfigProdutos();
      setProdutos(produtosRes.produtos || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  }, []);

  // Buscar apenas funis
  const fetchFunis = useCallback(async () => {
    try {
      const funisRes = await getConfigFunis();
      setFunis(funisRes.funis || []);
    } catch (error) {
      console.error('Erro ao carregar funis:', error);
    }
  }, []);

  // Invalidar e recarregar tudo
  const invalidateConfig = useCallback(async () => {
    await fetchConfig();
  }, [fetchConfig]);

  const value = {
    // Estado
    pessoas,
    produtos,
    funis,
    resumo,
    loading,

    // Setters diretos (para otimização)
    setPessoas,
    setProdutos,
    setFunis,
    setResumo,

    // Métodos de fetch
    fetchConfig,
    fetchPessoas,
    fetchProdutos,
    fetchFunis,
    invalidateConfig
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
};
