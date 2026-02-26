"""
Parser para planilhas financeiras (Excel).
Estrutura esperada: Abas mensais (JAN 2026, FEV 2026, etc) + aba CENTRAL
"""

import pandas as pd
import logging
from datetime import datetime
from typing import List, Dict, Any
from pathlib import Path

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class FinanceiroParser:
    """
    Parser para processar planilhas financeiras da MedGM.
    """

    def __init__(self, file_path: str):
        self.file_path = file_path
        self.excel_file = None
        self.financeiro_data = []
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

    def parse_aba_mensal(self, sheet_name: str, mes: int, ano: int) -> bool:
        """
        Parseia uma aba mensal (ex: JAN 2026, FEV 2026).
        Estrutura esperada: Tipo, Categoria, Valor, Data, Previsto/Realizado
        """
        try:
            df = pd.read_excel(self.file_path, sheet_name=sheet_name)
            logger.info(f"Aba {sheet_name} carregada: {len(df)} linhas")

            # Normalizar nomes das colunas
            df.columns = df.columns.str.strip().str.lower()

            # Verificar colunas obrigatórias
            required_columns = ["tipo", "categoria", "valor", "data"]
            missing_columns = [col for col in required_columns if col not in df.columns]

            if missing_columns:
                self.errors.append(f"Aba {sheet_name}: Colunas faltando: {missing_columns}")
                logger.warning(f"Aba {sheet_name}: Colunas disponíveis: {df.columns.tolist()}")
                return False

            # Processar cada linha
            for idx, row in df.iterrows():
                try:
                    # Pular linhas vazias
                    if pd.isna(row["tipo"]) or pd.isna(row["categoria"]):
                        continue

                    # Converter data
                    if isinstance(row["data"], str):
                        data = pd.to_datetime(row["data"], dayfirst=True).date()
                    else:
                        data = pd.to_datetime(row["data"]).date()

                    # Converter valor
                    valor = float(row["valor"])

                    # Determinar se é previsto ou realizado
                    previsto_realizado = "realizado"
                    if "previsto/realizado" in df.columns:
                        pr = str(row["previsto/realizado"]).lower().strip()
                        if "previsto" in pr:
                            previsto_realizado = "previsto"

                    movimentacao = {
                        "tipo": str(row["tipo"]).strip().lower(),
                        "categoria": str(row["categoria"]).strip(),
                        "valor": valor,
                        "data": data,
                        "mes": mes,
                        "ano": ano,
                        "previsto_realizado": previsto_realizado,
                        "descricao": str(row.get("descricao", "")) if "descricao" in df.columns else ""
                    }

                    self.financeiro_data.append(movimentacao)

                except Exception as e:
                    error_msg = f"Aba {sheet_name}, linha {idx + 2}: {str(e)}"
                    self.errors.append(error_msg)
                    logger.warning(error_msg)
                    continue

            logger.info(f"Aba {sheet_name}: {len([m for m in self.financeiro_data if m['mes'] == mes and m['ano'] == ano])} movimentações parseadas")
            return True

        except Exception as e:
            self.errors.append(f"Erro ao parsear aba {sheet_name}: {str(e)}")
            logger.error(f"Erro no parse_aba_mensal {sheet_name}: {e}")
            return False

    def parse_todas_abas(self) -> bool:
        """
        Parseia todas as abas mensais disponíveis.
        Detecta automaticamente abas no formato "MÊS ANO".
        """
        meses_map = {
            "jan": 1, "fev": 2, "mar": 3, "abr": 4, "mai": 5, "jun": 6,
            "jul": 7, "ago": 8, "set": 9, "out": 10, "nov": 11, "dez": 12
        }

        for sheet_name in self.excel_file.sheet_names:
            # Pular abas não mensais
            if sheet_name.upper() in ["CENTRAL", "DASHBOARD", "CONFIG"]:
                continue

            try:
                # Tentar extrair mês e ano do nome da aba
                parts = sheet_name.lower().strip().split()
                if len(parts) >= 2:
                    mes_str = parts[0][:3]  # Primeiros 3 caracteres
                    ano_str = parts[1]

                    if mes_str in meses_map:
                        mes = meses_map[mes_str]
                        ano = int(ano_str)

                        logger.info(f"Parseando aba mensal: {sheet_name} (mes={mes}, ano={ano})")
                        self.parse_aba_mensal(sheet_name, mes, ano)

            except Exception as e:
                logger.warning(f"Erro ao processar aba {sheet_name}: {e}")
                continue

        return len(self.financeiro_data) > 0

    def parse(self) -> Dict[str, Any]:
        """
        Executa o parsing completo da planilha financeira.

        Returns:
            Dict com estrutura:
            {
                "success": bool,
                "financeiro": List[Dict],
                "errors": List[str]
            }
        """
        if not self.validate_file():
            return {
                "success": False,
                "financeiro": [],
                "errors": self.errors
            }

        if not self.parse_todas_abas():
            return {
                "success": False,
                "financeiro": [],
                "errors": self.errors if self.errors else ["Nenhuma movimentação encontrada"]
            }

        return {
            "success": True,
            "financeiro": self.financeiro_data,
            "errors": self.errors
        }

    def get_summary(self) -> Dict[str, Any]:
        """
        Retorna um resumo dos dados parseados.
        """
        if not self.financeiro_data:
            return {"total_movimentacoes": 0, "entradas": 0, "saidas": 0}

        entradas = sum(m["valor"] for m in self.financeiro_data if m["tipo"] == "entrada")
        saidas = sum(m["valor"] for m in self.financeiro_data if m["tipo"] == "saida")

        return {
            "total_movimentacoes": len(self.financeiro_data),
            "entradas": entradas,
            "saidas": saidas,
            "saldo": entradas - saidas,
            "categorias": list(set(m["categoria"] for m in self.financeiro_data))
        }
