"""
Atualiza campo 'funil' em Closer Métricas
Troca "SS" por "Social Selling"
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.models.models import CloserMetrica

def atualizar_funil_closer():
    print("="*60)
    print("ATUALIZANDO FUNIL EM CLOSER MÉTRICAS")
    print("="*60)

    db = SessionLocal()

    try:
        # Contar registros antes
        count_ss = db.query(CloserMetrica).filter(
            CloserMetrica.funil == 'SS'
        ).count()

        print(f"\n📊 Registros com funil='SS': {count_ss}")

        if count_ss == 0:
            print("✓ Nenhum registro para atualizar!")
            return

        # Atualizar
        db.query(CloserMetrica).filter(
            CloserMetrica.funil == 'SS'
        ).update({
            CloserMetrica.funil: 'Social Selling'
        })

        db.commit()

        # Contar após
        count_social = db.query(CloserMetrica).filter(
            CloserMetrica.funil == 'Social Selling'
        ).count()

        print(f"✅ Atualizado com sucesso!")
        print(f"   └─ {count_ss} registros alterados")
        print(f"   └─ Total 'Social Selling': {count_social}")

        # Verificar se ainda existe 'SS'
        remaining_ss = db.query(CloserMetrica).filter(
            CloserMetrica.funil == 'SS'
        ).count()

        if remaining_ss == 0:
            print(f"\n✓ Nenhum registro 'SS' restante")
        else:
            print(f"\n⚠️  Ainda existem {remaining_ss} registros com 'SS'")

        # Mostrar todos os funis únicos
        print("\n📋 Funis únicos em Closer:")
        funis = db.query(CloserMetrica.funil).distinct().all()
        for (funil,) in funis:
            count = db.query(CloserMetrica).filter(
                CloserMetrica.funil == funil
            ).count()
            print(f"   - {funil}: {count} registros")

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()

    print("\n" + "="*60)
    print("✅ ATUALIZAÇÃO CONCLUÍDA!")
    print("="*60)

if __name__ == "__main__":
    atualizar_funil_closer()
