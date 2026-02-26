"""
Parser para planilhas comerciais (Excel).
Estrutura esperada: Abas DASHBOARD, VENDAS, FUNIL, etc.
"""

import pandas as pd
import logging
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ComercialParser:
    """
    Parser para processar planilhas comerciais da MedGM.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.excel_file = None
        self.vendas_data = []
        self.errors = []

    def validate_file(self) -> bool:
        """
        Valida se o arquivo existe e é um Excel válido.
        """
        try:
            if not Path(self.file_path).exists():
                self.errors.append(f"Arquivo não encontrado: {self.file_path}")
                return False

            self.excel_file = pd.ExcelFile(self.file_path)
            logger.info(f"Arquivo Excel carregado: {self.file_path}")
            logger.info(f"Abas disponíveis: {self.excel_file.sheet_names}")

            return True

        except Exception as e:
            self.errors.append(f"Erro ao abrir arquivo: {str(e)}")
            logger.error(f"Erro na validação do arquivo: {e}")
            return False

    def parse_vendas(self) -> bool:
        """
        Parseia a aba VENDAS da planilha comercial.
        Estrutura esperada: Data, Cliente, Valor, Funil, Vendedor
        """
        try:
            if "VENDAS" not in self.excel_file.sheet_names:
                self.errors.append("Aba 'VENDAS' não encontrada na planilha")
                return False

            df = pd.read_excel(self.file_path, sheet_name="VENDAS")
            logger.info(f"Aba VENDAS carregada: {len(df)} linhas")

            # Normalizar nomes das colunas (remover espaços, lowercase)
            df.columns = df.columns.str.strip().str.lower()

            # Verificar colunas obrigatórias
            required_columns = ["data", "cliente", "valor", "funil", "vendedor"]
            missing_columns = [col for col in required_columns if col not in df.columns]

            if missing_columns:
                self.errors.append(f"Colunas obrigatórias faltando: {missing_columns}")
                logger.error(f"Colunas faltando: {missing_columns}")
                logger.info(f"Colunas disponíveis: {df.columns.tolist()}")
                return False

            # Processar cada linha
            for idx, row in df.iterrows():
                try:
                    # Pular linhas vazias
                    if pd.isna(row["data"]) or pd.isna(row["cliente"]):
                        continue

                    # Converter data
                    if isinstance(row["data"], str):
                        data = pd.to_datetime(row["data"], dayfirst=True).date()
                    else:
                        data = pd.to_datetime(row["data"]).date()

                    # Converter valor
                    valor = float(row["valor"])

                    # Extrair mês e ano
                    mes = data.month
                    ano = data.year

                    venda = {
                        "data": data,
                        "cliente": str(row["cliente"]).strip(),
                        "valor": valor,
                        "funil": str(row["funil"]).strip(),
                        "vendedor": str(row["vendedor"]).strip(),
                        "mes": mes,
                        "ano": ano
                    }

                    self.vendas_data.append(venda)

                except Exception as e:
                    error_msg = f"Erro ao processar linha {idx + 2}: {str(e)}"
                    self.errors.append(error_msg)
                    logger.warning(error_msg)
                    continue

            logger.info(f"Total de vendas parseadas: {len(self.vendas_data)}")
            return True

        except Exception as e:
            self.errors.append(f"Erro ao parsear aba VENDAS: {str(e)}")
            logger.error(f"Erro no parse_vendas: {e}")
            return False

    def parse(self) -> Dict[str, Any]:
        """
        Executa o parsing completo da planilha comercial.

        Returns:
            Dict com estrutura:
            {
                "success": bool,
                "vendas": List[Dict],
                "errors": List[str]
            }
        """
        if not self.validate_file():
            return {
                "success": False,
                "vendas": [],
                "errors": self.errors
            }

        if not self.parse_vendas():
            return {
                "success": False,
                "vendas": [],
                "errors": self.errors
            }

        return {
            "success": True,
            "vendas": self.vendas_data,
            "errors": self.errors
        }

    def get_summary(self) -> Dict[str, Any]:
        """
        Retorna um resumo dos dados parseados.
        """
        if not self.vendas_data:
            return {"total_vendas": 0, "faturamento_total": 0}

        return {
            "total_vendas": len(self.vendas_data),
            "faturamento_total": sum(v["valor"] for v in self.vendas_data),
            "vendedores": list(set(v["vendedor"] for v in self.vendas_data)),
            "funis": list(set(v["funil"] for v in self.vendas_data)),
        }
