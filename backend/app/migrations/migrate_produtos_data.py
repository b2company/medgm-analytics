"""
Script auxiliar para migração de dados da tabela produtos_config.
Converte registros com array de planos em múltiplos registros (um por plano).

IMPORTANTE: Execute este script ANTES de dropar a coluna 'planos' na migration 002.
"""

import json
import sys
from pathlib import Path

# Adicionar diretório raiz ao path
sys.path.append(str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal
from app.models.models import ProdutoConfig


def migrate_produtos():
    """
    Migra produtos com múltiplos planos para múltiplos registros.
    """
    db = SessionLocal()

    try:
        print("🔍 Buscando produtos para migração...")
        produtos = db.query(ProdutoConfig).all()

        total_produtos = len(produtos)
        produtos_migrados = 0
        novos_registros = 0

        for produto in produtos:
            # Se já tem o campo 'plano' preenchido, pular (já foi migrado)
            if produto.plano:
                print(f"⏭️  Produto '{produto.nome}' já migrado, pulando...")
                continue

            # Se não tem planos, definir como None
            if not produto.planos:
                print(f"⚠️  Produto '{produto.nome}' sem planos, definindo plano como None")
                produto.plano = None
                produto.status = 'ativo'
                db.commit()
                produtos_migrados += 1
                continue

            # Tentar fazer parse do JSON
            try:
                planos_list = json.loads(produto.planos)

                if not isinstance(planos_list, list):
                    print(f"⚠️  Produto '{produto.nome}' tem planos em formato inválido: {produto.planos}")
                    produto.plano = None
                    produto.status = 'ativo'
                    db.commit()
                    produtos_migrados += 1
                    continue

                if not planos_list:
                    print(f"⚠️  Produto '{produto.nome}' tem array de planos vazio")
                    produto.plano = None
                    produto.status = 'ativo'
                    db.commit()
                    produtos_migrados += 1
                    continue

                # Migrar o primeiro plano para o registro existente
                primeiro_plano = planos_list[0]
                print(f"✏️  Atualizando produto '{produto.nome}' com plano '{primeiro_plano}'")
                produto.plano = primeiro_plano
                produto.status = 'ativo'
                db.commit()
                produtos_migrados += 1

                # Criar novos registros para os demais planos
                for plano in planos_list[1:]:
                    print(f"➕  Criando novo registro para '{produto.nome}' - plano '{plano}'")
                    novo_produto = ProdutoConfig(
                        nome=produto.nome,
                        categoria=produto.categoria,
                        plano=plano,
                        status='ativo',
                        ativo=produto.ativo
                    )
                    db.add(novo_produto)
                    novos_registros += 1

                db.commit()

            except json.JSONDecodeError:
                print(f"❌ Erro ao fazer parse JSON para produto '{produto.nome}': {produto.planos}")
                print(f"   Definindo plano como string única...")
                produto.plano = produto.planos  # Usar o valor como string
                produto.status = 'ativo'
                db.commit()
                produtos_migrados += 1

        print("\n✅ Migração concluída!")
        print(f"📊 Total de produtos processados: {total_produtos}")
        print(f"📝 Produtos atualizados: {produtos_migrados}")
        print(f"➕ Novos registros criados: {novos_registros}")

        # Mostrar preview dos produtos migrados
        print("\n📋 Preview dos produtos após migração:")
        produtos_final = db.query(ProdutoConfig).all()
        for p in produtos_final:
            print(f"   - {p.nome} | Plano: {p.plano} | Status: {p.status}")

    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("MIGRAÇÃO DE DADOS - PRODUTOS CONFIG")
    print("=" * 60)
    print("\n⚠️  ATENÇÃO: Este script irá modificar dados na tabela produtos_config")
    print("   Certifique-se de ter um backup antes de prosseguir!\n")

    resposta = input("Deseja continuar? (sim/não): ").strip().lower()

    if resposta in ['sim', 's', 'yes', 'y']:
        migrate_produtos()
    else:
        print("❌ Migração cancelada pelo usuário")
