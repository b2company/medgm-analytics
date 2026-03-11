"""
FastAPI router for configuration management.
Handles Pessoas, Produtos, and Funis configuration.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.models import Pessoa, ProdutoConfig, FunilConfig, Meta
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/config", tags=["Configurações"])


# ==================== PYDANTIC SCHEMAS ====================

class PessoaCreate(BaseModel):
    nome: str
    funcao: str  # social_selling, sdr, closer
    ativo: bool = True
    nivel_senioridade: int = 1  # 1 (Júnior) a 7 (C-Level)


class PessoaUpdate(BaseModel):
    nome: Optional[str] = None
    funcao: Optional[str] = None
    ativo: Optional[bool] = None
    nivel_senioridade: Optional[int] = None


class ProdutoCreate(BaseModel):
    nome: str
    categoria: Optional[str] = None
    plano: Optional[str] = None  # String única: Start, Select, Anual, etc
    status: str = 'ativo'  # ativo ou inativo
    ativo: bool = True


class ProdutoUpdate(BaseModel):
    nome: Optional[str] = None
    categoria: Optional[str] = None
    plano: Optional[str] = None
    status: Optional[str] = None
    ativo: Optional[bool] = None


class FunilCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    ativo: bool = True
    ordem: int = 0


class FunilUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    ativo: Optional[bool] = None
    ordem: Optional[int] = None


# ==================== PESSOA CRUD ====================

@router.get("/pessoas")
@router.get("/pessoas/")  # Aceita ambas versões
async def list_pessoas(
    funcao: Optional[str] = None,
    ativo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Lista todas as pessoas cadastradas.
    Pode filtrar por função e status ativo.
    """
    try:
        query = db.query(Pessoa)

        if funcao:
            query = query.filter(Pessoa.funcao == funcao)
        if ativo is not None:
            query = query.filter(Pessoa.ativo == ativo)

        pessoas = query.order_by(Pessoa.funcao, Pessoa.nome).all()

        return {
            "total": len(pessoas),
            "pessoas": [
                {
                    "id": p.id,
                    "nome": p.nome,
                    "funcao": p.funcao,
                    "ativo": p.ativo,
                    "nivel_senioridade": p.nivel_senioridade
                }
                for p in pessoas
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar pessoas: {str(e)}")


@router.get("/pessoas/{id}")
async def get_pessoa(id: int, db: Session = Depends(get_db)):
    """
    Busca uma pessoa por ID.
    """
    try:
        pessoa = db.query(Pessoa).filter(Pessoa.id == id).first()
        if not pessoa:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")

        return {
            "id": pessoa.id,
            "nome": pessoa.nome,
            "funcao": pessoa.funcao,
            "ativo": pessoa.ativo,
            "nivel_senioridade": pessoa.nivel_senioridade
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar pessoa: {str(e)}")


@router.post("/pessoas")
@router.post("/pessoas/")  # Aceita ambas versões
async def create_pessoa(item: PessoaCreate, db: Session = Depends(get_db)):
    """
    Cria uma nova pessoa no sistema.
    """
    try:
        # Verificar se já existe pessoa com mesmo nome
        existente = db.query(Pessoa).filter(Pessoa.nome == item.nome).first()
        if existente:
            raise HTTPException(status_code=400, detail="Já existe uma pessoa com este nome")

        nova = Pessoa(**item.dict())
        db.add(nova)
        db.commit()
        db.refresh(nova)

        return {
            "id": nova.id,
            "message": "Pessoa criada com sucesso",
            "data": {
                "id": nova.id,
                "nome": nova.nome,
                "funcao": nova.funcao,
                "ativo": nova.ativo
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar pessoa: {str(e)}")


@router.put("/pessoas/{id}")
async def update_pessoa(id: int, item: PessoaUpdate, db: Session = Depends(get_db)):
    """
    Atualiza uma pessoa existente.
    """
    try:
        pessoa = db.query(Pessoa).filter(Pessoa.id == id).first()
        if not pessoa:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")

        # Verificar unicidade do nome se estiver sendo alterado
        if item.nome and item.nome != pessoa.nome:
            existente = db.query(Pessoa).filter(Pessoa.nome == item.nome).first()
            if existente:
                raise HTTPException(status_code=400, detail="Já existe uma pessoa com este nome")

        update_data = item.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(pessoa, key, value)

        db.commit()
        db.refresh(pessoa)

        return {
            "message": "Pessoa atualizada com sucesso",
            "data": {
                "id": pessoa.id,
                "nome": pessoa.nome,
                "funcao": pessoa.funcao,
                "ativo": pessoa.ativo
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar pessoa: {str(e)}")


@router.delete("/pessoas/{id}")
async def delete_pessoa(id: int, db: Session = Depends(get_db)):
    """
    Deleta uma pessoa.
    """
    try:
        pessoa = db.query(Pessoa).filter(Pessoa.id == id).first()
        if not pessoa:
            raise HTTPException(status_code=404, detail="Pessoa não encontrada")

        info = {
            "id": pessoa.id,
            "nome": pessoa.nome,
            "funcao": pessoa.funcao
        }

        db.delete(pessoa)
        db.commit()

        return {
            "message": "Pessoa deletada com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar pessoa: {str(e)}")


# ==================== PRODUTO CRUD ====================

@router.get("/produtos")
@router.get("/produtos/")  # Aceita ambas versões
async def list_produtos(
    categoria: Optional[str] = None,
    ativo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Lista todos os produtos cadastrados.
    """
    try:
        query = db.query(ProdutoConfig)

        if categoria:
            query = query.filter(ProdutoConfig.categoria == categoria)
        if ativo is not None:
            query = query.filter(ProdutoConfig.ativo == ativo)

        produtos = query.order_by(ProdutoConfig.categoria, ProdutoConfig.nome).all()

        return {
            "total": len(produtos),
            "produtos": [
                {
                    "id": p.id,
                    "nome": p.nome,
                    "categoria": p.categoria,
                    "plano": p.plano,
                    "status": p.status,
                    "ativo": p.ativo
                }
                for p in produtos
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar produtos: {str(e)}")


@router.get("/produtos/{id}")
async def get_produto(id: int, db: Session = Depends(get_db)):
    """
    Busca um produto por ID.
    """
    try:
        produto = db.query(ProdutoConfig).filter(ProdutoConfig.id == id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        return {
            "id": produto.id,
            "nome": produto.nome,
            "categoria": produto.categoria,
            "plano": produto.plano,
            "status": produto.status,
            "ativo": produto.ativo
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar produto: {str(e)}")


@router.post("/produtos")
@router.post("/produtos/")  # Aceita ambas versões
async def create_produto(item: ProdutoCreate, db: Session = Depends(get_db)):
    """
    Cria um novo produto.
    Agora valida unicidade pela combinação (nome + plano).
    """
    try:
        # Verificar se já existe combinação nome + plano
        existente = db.query(ProdutoConfig).filter(
            ProdutoConfig.nome == item.nome,
            ProdutoConfig.plano == item.plano
        ).first()

        if existente:
            raise HTTPException(
                status_code=400,
                detail=f"Já existe o produto '{item.nome}' com o plano '{item.plano}'"
            )

        novo = ProdutoConfig(**item.dict())
        db.add(novo)
        db.commit()
        db.refresh(novo)

        return {
            "id": novo.id,
            "message": "Produto criado com sucesso",
            "data": {
                "id": novo.id,
                "nome": novo.nome,
                "categoria": novo.categoria,
                "plano": novo.plano,
                "status": novo.status,
                "ativo": novo.ativo
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar produto: {str(e)}")


@router.put("/produtos/{id}")
async def update_produto(id: int, item: ProdutoUpdate, db: Session = Depends(get_db)):
    """
    Atualiza um produto existente.
    Valida unicidade pela combinação (nome + plano).
    """
    try:
        produto = db.query(ProdutoConfig).filter(ProdutoConfig.id == id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        # Verificar unicidade da combinação nome + plano se estiverem mudando
        novo_nome = item.nome if item.nome else produto.nome
        novo_plano = item.plano if item.plano is not None else produto.plano

        if (item.nome and item.nome != produto.nome) or (item.plano is not None and item.plano != produto.plano):
            existente = db.query(ProdutoConfig).filter(
                ProdutoConfig.nome == novo_nome,
                ProdutoConfig.plano == novo_plano,
                ProdutoConfig.id != id
            ).first()

            if existente:
                raise HTTPException(
                    status_code=400,
                    detail=f"Já existe o produto '{novo_nome}' com o plano '{novo_plano}'"
                )

        update_data = item.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(produto, key, value)

        db.commit()
        db.refresh(produto)

        return {
            "message": "Produto atualizado com sucesso",
            "data": {
                "id": produto.id,
                "nome": produto.nome,
                "categoria": produto.categoria,
                "plano": produto.plano,
                "status": produto.status,
                "ativo": produto.ativo
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar produto: {str(e)}")


@router.delete("/produtos/{id}")
async def delete_produto(id: int, db: Session = Depends(get_db)):
    """
    Deleta um produto.
    """
    try:
        produto = db.query(ProdutoConfig).filter(ProdutoConfig.id == id).first()
        if not produto:
            raise HTTPException(status_code=404, detail="Produto não encontrado")

        info = {
            "id": produto.id,
            "nome": produto.nome,
            "categoria": produto.categoria
        }

        db.delete(produto)
        db.commit()

        return {
            "message": "Produto deletado com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar produto: {str(e)}")


# ==================== FUNIL CRUD ====================

@router.get("/funis")
@router.get("/funis/")  # Aceita ambas versões
async def list_funis(
    ativo: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """
    Lista todos os funis cadastrados.
    """
    try:
        query = db.query(FunilConfig)

        if ativo is not None:
            query = query.filter(FunilConfig.ativo == ativo)

        funis = query.order_by(FunilConfig.ordem, FunilConfig.nome).all()

        return {
            "total": len(funis),
            "funis": [
                {
                    "id": f.id,
                    "nome": f.nome,
                    "descricao": f.descricao,
                    "ativo": f.ativo,
                    "ordem": f.ordem
                }
                for f in funis
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao listar funis: {str(e)}")


@router.get("/funis/{id}")
async def get_funil(id: int, db: Session = Depends(get_db)):
    """
    Busca um funil por ID.
    """
    try:
        funil = db.query(FunilConfig).filter(FunilConfig.id == id).first()
        if not funil:
            raise HTTPException(status_code=404, detail="Funil não encontrado")

        return {
            "id": funil.id,
            "nome": funil.nome,
            "descricao": funil.descricao,
            "ativo": funil.ativo,
            "ordem": funil.ordem
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar funil: {str(e)}")


@router.post("/funis")
@router.post("/funis/")  # Aceita ambas versões
async def create_funil(item: FunilCreate, db: Session = Depends(get_db)):
    """
    Cria um novo funil.
    """
    try:
        existente = db.query(FunilConfig).filter(FunilConfig.nome == item.nome).first()
        if existente:
            raise HTTPException(status_code=400, detail="Já existe um funil com este nome")

        novo = FunilConfig(**item.dict())
        db.add(novo)
        db.commit()
        db.refresh(novo)

        return {
            "id": novo.id,
            "message": "Funil criado com sucesso",
            "data": {
                "id": novo.id,
                "nome": novo.nome,
                "descricao": novo.descricao,
                "ativo": novo.ativo
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar funil: {str(e)}")


@router.put("/funis/{id}")
async def update_funil(id: int, item: FunilUpdate, db: Session = Depends(get_db)):
    """
    Atualiza um funil existente.
    """
    try:
        funil = db.query(FunilConfig).filter(FunilConfig.id == id).first()
        if not funil:
            raise HTTPException(status_code=404, detail="Funil não encontrado")

        if item.nome and item.nome != funil.nome:
            existente = db.query(FunilConfig).filter(FunilConfig.nome == item.nome).first()
            if existente:
                raise HTTPException(status_code=400, detail="Já existe um funil com este nome")

        update_data = item.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(funil, key, value)

        db.commit()
        db.refresh(funil)

        return {
            "message": "Funil atualizado com sucesso",
            "data": {
                "id": funil.id,
                "nome": funil.nome,
                "descricao": funil.descricao,
                "ativo": funil.ativo
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar funil: {str(e)}")


@router.delete("/funis/{id}")
async def delete_funil(id: int, db: Session = Depends(get_db)):
    """
    Deleta um funil.
    """
    try:
        funil = db.query(FunilConfig).filter(FunilConfig.id == id).first()
        if not funil:
            raise HTTPException(status_code=404, detail="Funil não encontrado")

        info = {
            "id": funil.id,
            "nome": funil.nome
        }

        db.delete(funil)
        db.commit()

        return {
            "message": "Funil deletado com sucesso",
            "deleted": info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao deletar funil: {str(e)}")


# ==================== PESSOAS COM METAS ====================

@router.get("/pessoas/resumo")
async def get_pessoas_resumo(
    mes: int,
    ano: int,
    funcao: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Retorna pessoas com suas metas do mês específico.
    Metas agora vêm exclusivamente da tabela Meta.
    """
    try:
        query = db.query(Pessoa).filter(Pessoa.ativo == True)

        if funcao:
            query = query.filter(Pessoa.funcao == funcao)

        pessoas = query.order_by(Pessoa.funcao, Pessoa.nome).all()

        resultado = []
        for pessoa in pessoas:
            # Buscar meta do mês
            meta = db.query(Meta).filter(
                Meta.pessoa_id == pessoa.id,
                Meta.mes == mes,
                Meta.ano == ano
            ).first()

            resultado.append({
                "id": pessoa.id,
                "nome": pessoa.nome,
                "funcao": pessoa.funcao,
                "ativo": pessoa.ativo,
                "nivel_senioridade": pessoa.nivel_senioridade,
                "meta_mes": {
                    "ativacoes": meta.meta_ativacoes if meta else 0,
                    "leads": meta.meta_leads if meta else 0,
                    "reunioes": meta.meta_reunioes if meta else 0,
                    "vendas": meta.meta_vendas if meta else 0,
                    "faturamento": meta.meta_faturamento if meta else 0
                },
                "realizado": {
                    "ativacoes": meta.realizado_ativacoes if meta else 0,
                    "leads": meta.realizado_leads if meta else 0,
                    "reunioes": meta.realizado_reunioes if meta else 0,
                    "vendas": meta.realizado_vendas if meta else 0,
                    "faturamento": meta.realizado_faturamento if meta else 0
                },
                "perc_atingimento": meta.perc_atingimento if meta else 0
            })

        return {
            "total": len(resultado),
            "mes": mes,
            "ano": ano,
            "pessoas": resultado
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar pessoas: {str(e)}")


# ==================== UTILITARIOS ====================

@router.get("/resumo")
async def get_config_resumo(db: Session = Depends(get_db)):
    """
    Retorna um resumo de todas as configurações.
    """
    try:
        total_pessoas = db.query(func.count(Pessoa.id)).scalar()
        pessoas_ativas = db.query(func.count(Pessoa.id)).filter(Pessoa.ativo == True).scalar()

        total_produtos = db.query(func.count(ProdutoConfig.id)).scalar()
        produtos_ativos = db.query(func.count(ProdutoConfig.id)).filter(ProdutoConfig.ativo == True).scalar()

        total_funis = db.query(func.count(FunilConfig.id)).scalar()
        funis_ativos = db.query(func.count(FunilConfig.id)).filter(FunilConfig.ativo == True).scalar()

        # Contar por função
        pessoas_por_funcao = db.query(
            Pessoa.funcao,
            func.count(Pessoa.id)
        ).filter(Pessoa.ativo == True).group_by(Pessoa.funcao).all()

        return {
            "pessoas": {
                "total": total_pessoas,
                "ativos": pessoas_ativas,
                "por_funcao": {f: c for f, c in pessoas_por_funcao}
            },
            "produtos": {
                "total": total_produtos,
                "ativos": produtos_ativos
            },
            "funis": {
                "total": total_funis,
                "ativos": funis_ativos
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao gerar resumo: {str(e)}")


@router.post("/seed")
async def seed_config(db: Session = Depends(get_db)):
    """
    Popula configurações iniciais padrão.
    Agora sem campos de meta nas pessoas.
    """
    try:
        # Verificar se já existem dados
        if db.query(Pessoa).count() > 0:
            return {"message": "Configurações já existem, nenhuma alteração feita"}

        # Criar pessoas padrão (sem metas - metas devem ser criadas via tabela Meta)
        pessoas_default = [
            {"nome": "João Silva", "funcao": "social_selling", "nivel_senioridade": 3},
            {"nome": "Maria Santos", "funcao": "social_selling", "nivel_senioridade": 4},
            {"nome": "Pedro Costa", "funcao": "sdr", "nivel_senioridade": 2},
            {"nome": "Ana Oliveira", "funcao": "sdr", "nivel_senioridade": 3},
            {"nome": "Carlos Lima", "funcao": "closer", "nivel_senioridade": 5},
            {"nome": "Julia Ferreira", "funcao": "closer", "nivel_senioridade": 4},
        ]

        for p in pessoas_default:
            db.add(Pessoa(**p))

        # Criar produtos padrão (com plano único)
        produtos_default = [
            {"nome": "Assessoria de Marketing", "categoria": "Assessoria", "plano": "Start", "status": "ativo"},
            {"nome": "Assessoria de Marketing", "categoria": "Assessoria", "plano": "Select", "status": "ativo"},
            {"nome": "Assessoria de Marketing", "categoria": "Assessoria", "plano": "Premium", "status": "ativo"},
            {"nome": "Programa de Ativação", "categoria": "Programa", "plano": "Mensal", "status": "ativo"},
            {"nome": "Programa de Ativação", "categoria": "Programa", "plano": "Trimestral", "status": "ativo"},
            {"nome": "Programa de Ativação", "categoria": "Programa", "plano": "Anual", "status": "ativo"},
            {"nome": "Consultoria Estratégica", "categoria": "Consultoria", "plano": "Pontual", "status": "ativo"},
            {"nome": "Consultoria Estratégica", "categoria": "Consultoria", "plano": "Recorrente", "status": "ativo"},
        ]

        for p in produtos_default:
            db.add(ProdutoConfig(**p))

        # Criar funis padrão
        funis_default = [
            {"nome": "SS", "descricao": "Social Selling", "ordem": 1},
            {"nome": "Quiz", "descricao": "Quiz de Qualificação", "ordem": 2},
            {"nome": "Indicação", "descricao": "Indicações de Clientes", "ordem": 3},
            {"nome": "Webinário", "descricao": "Webinários e Eventos", "ordem": 4},
        ]

        for f in funis_default:
            db.add(FunilConfig(**f))

        db.commit()

        return {
            "message": "Configurações iniciais criadas com sucesso",
            "criados": {
                "pessoas": len(pessoas_default),
                "produtos": len(produtos_default),
                "funis": len(funis_default)
            }
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao criar configurações: {str(e)}")
