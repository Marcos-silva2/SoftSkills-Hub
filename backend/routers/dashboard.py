import csv
import io
import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func, case
from sqlalchemy.orm import Session

import models
import schemas
from core.database import get_db
from core.dependencies import get_gestor_atual
from services.dashboard_service import filtrar_ano

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "/resumo",
    response_model=schemas.DashboardResumo,
    summary="Totais e médias gerais (com filtros opcionais)",
)
def dashboard_resumo(
    empresa_id: Optional[int] = None,
    genero: Optional[str] = None,
    faixa_etaria: Optional[str] = None,
    ano: Optional[int] = None,
    desejo_efetivacao: Optional[str] = None,
    gestor: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = db.query(models.RespostaEnquete)
    if empresa_id:
        query = query.filter(models.RespostaEnquete.empresa_id == empresa_id)
    if genero:
        query = query.filter(models.RespostaEnquete.genero == genero)
    if faixa_etaria:
        query = query.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
    if desejo_efetivacao:
        query = query.filter(models.RespostaEnquete.desejo_efetivacao == desejo_efetivacao)
    query = filtrar_ano(query, ano)

    agg = query.with_entities(
        func.count(models.RespostaEnquete.id).label("total"),
        func.avg(models.RespostaEnquete.nota_satisfacao).label("media"),
        func.sum(
            case((models.RespostaEnquete.desejo_efetivacao == "sim", 1), else_=0)
        ).label("qtd_sim"),
    ).one()

    total = agg.total or 0
    if total == 0:
        return {
            "total_respostas": 0, "media_satisfacao": 0.0, "perc_quer_efetivacao": 0.0,
            "top_positivos": [], "top_negativos": [],
        }

    def _top_avaliacoes(tipo: str):
        q = (
            db.query(models.RespostaAvaliacao.valor, func.count().label("total"))
            .join(models.RespostaEnquete)
            .filter(models.RespostaAvaliacao.tipo == tipo)
        )
        if empresa_id:
            q = q.filter(models.RespostaEnquete.empresa_id == empresa_id)
        if genero:
            q = q.filter(models.RespostaEnquete.genero == genero)
        if faixa_etaria:
            q = q.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
        if desejo_efetivacao:
            q = q.filter(models.RespostaEnquete.desejo_efetivacao == desejo_efetivacao)
        q = filtrar_ano(q, ano)
        return [
            {"valor": r.valor, "total": r.total}
            for r in q.group_by(models.RespostaAvaliacao.valor).order_by(func.count().desc()).limit(3).all()
        ]

    return {
        "total_respostas": total,
        "media_satisfacao": round(agg.media, 2),
        "perc_quer_efetivacao": round((agg.qtd_sim / total) * 100, 1),
        "top_positivos": _top_avaliacoes("positivo"),
        "top_negativos": _top_avaliacoes("negativo"),
    }


@router.get(
    "/problemas",
    response_model=list[schemas.ProblemaContagem],
    summary="Ranking de problemas por frequência de relatos",
)
def dashboard_problemas(
    empresa_id: Optional[int] = None,
    genero: Optional[str] = None,
    faixa_etaria: Optional[str] = None,
    ano: Optional[int] = None,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.RespostaProblema.problema,
            func.count(models.RespostaProblema.problema).label("total"),
        )
        .join(models.RespostaEnquete)
        .filter(models.RespostaProblema.problema != "nenhum")
    )
    if empresa_id:
        query = query.filter(models.RespostaEnquete.empresa_id == empresa_id)
    if genero:
        query = query.filter(models.RespostaEnquete.genero == genero)
    if faixa_etaria:
        query = query.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
    query = filtrar_ano(query, ano)

    resultado = (
        query.group_by(models.RespostaProblema.problema)
        .order_by(func.count().desc())
        .all()
    )
    return [{"problema": r.problema, "total": r.total} for r in resultado]


@router.get(
    "/satisfacao-por-empresa",
    response_model=list[schemas.SatisfacaoEmpresa],
    summary="Média de satisfação agrupada por empresa",
)
def satisfacao_por_empresa(
    ano: Optional[int] = None,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.Empresa.id,
            models.Empresa.nome,
            func.avg(models.RespostaEnquete.nota_satisfacao).label("media"),
            func.count(models.RespostaEnquete.id).label("total"),
        )
        .join(models.RespostaEnquete, models.Empresa.id == models.RespostaEnquete.empresa_id)
    )
    query = filtrar_ano(query, ano)
    resultado = query.group_by(models.Empresa.id).all()
    return [
        {"empresa_id": r.id, "empresa": r.nome, "media_satisfacao": round(r.media, 2), "total_respostas": r.total}
        for r in resultado
    ]


@router.get(
    "/efetivacao-por-empresa",
    summary="Percentual de desejo de efetivação por empresa",
)
def efetivacao_por_empresa(
    empresa_id: Optional[int] = None,
    genero: Optional[str] = None,
    faixa_etaria: Optional[str] = None,
    ano: Optional[int] = None,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = (
        db.query(
            models.Empresa.nome,
            models.RespostaEnquete.desejo_efetivacao,
            func.count(models.RespostaEnquete.id).label("qtd"),
        )
        .join(models.RespostaEnquete, models.Empresa.id == models.RespostaEnquete.empresa_id)
    )
    if empresa_id:
        query = query.filter(models.RespostaEnquete.empresa_id == empresa_id)
    if genero:
        query = query.filter(models.RespostaEnquete.genero == genero)
    if faixa_etaria:
        query = query.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
    query = filtrar_ano(query, ano)

    linhas = query.group_by(models.Empresa.nome, models.RespostaEnquete.desejo_efetivacao).all()

    por_empresa: dict = {}
    for nome, opcao, qtd in linhas:
        if nome not in por_empresa:
            por_empresa[nome] = {"sim": 0, "nao": 0, "talvez": 0}
        por_empresa[nome][opcao] = qtd

    resultado = []
    for nome, cont in por_empresa.items():
        total = cont["sim"] + cont["nao"] + cont["talvez"]
        resultado.append({
            "empresa": nome,
            "total": total,
            "sim_perc":    round(cont["sim"]    / total * 100, 1),
            "nao_perc":    round(cont["nao"]    / total * 100, 1),
            "talvez_perc": round(cont["talvez"] / total * 100, 1),
        })
    return resultado


@router.get(
    "/empresa/{empresa_id}/detalhes",
    summary="Detalhes completos de uma empresa: efetivação por gênero, problemas e avaliações",
)
def detalhe_empresa(
    empresa_id: int,
    _: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    empresa = db.query(models.Empresa).filter(models.Empresa.id == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa não encontrada")

    total = db.query(func.count(models.RespostaEnquete.id)).filter(
        models.RespostaEnquete.empresa_id == empresa_id
    ).scalar() or 0

    if total == 0:
        return {
            "empresa": empresa.nome, "total_respostas": 0,
            "efetivacao_genero": [], "pontos_positivos": [], "pontos_negativos": [], "problemas": [],
        }

    linhas_ef = (
        db.query(
            models.RespostaEnquete.genero,
            models.RespostaEnquete.desejo_efetivacao,
            func.count().label("qtd"),
        )
        .filter(models.RespostaEnquete.empresa_id == empresa_id)
        .group_by(models.RespostaEnquete.genero, models.RespostaEnquete.desejo_efetivacao)
        .all()
    )
    por_genero: dict = {}
    for genero, efetivacao, qtd in linhas_ef:
        if genero not in por_genero:
            por_genero[genero] = {"sim": 0, "nao": 0, "talvez": 0}
        por_genero[genero][efetivacao] = qtd

    efetivacao_genero = [
        {"genero": g, "sim": v["sim"], "nao": v["nao"], "talvez": v["talvez"],
         "total": v["sim"] + v["nao"] + v["talvez"]}
        for g, v in por_genero.items()
    ]

    positivos = (
        db.query(models.RespostaAvaliacao.valor, func.count().label("total"))
        .join(models.RespostaEnquete)
        .filter(models.RespostaEnquete.empresa_id == empresa_id, models.RespostaAvaliacao.tipo == "positivo")
        .group_by(models.RespostaAvaliacao.valor)
        .order_by(func.count().desc())
        .all()
    )
    negativos = (
        db.query(models.RespostaAvaliacao.valor, func.count().label("total"))
        .join(models.RespostaEnquete)
        .filter(models.RespostaEnquete.empresa_id == empresa_id, models.RespostaAvaliacao.tipo == "negativo")
        .group_by(models.RespostaAvaliacao.valor)
        .order_by(func.count().desc())
        .all()
    )
    problemas = (
        db.query(models.RespostaProblema.problema, func.count().label("total"))
        .join(models.RespostaEnquete)
        .filter(
            models.RespostaEnquete.empresa_id == empresa_id,
            models.RespostaProblema.problema != "nenhum",
        )
        .group_by(models.RespostaProblema.problema)
        .order_by(func.count().desc())
        .all()
    )

    return {
        "empresa": empresa.nome,
        "total_respostas": total,
        "efetivacao_genero": efetivacao_genero,
        "pontos_positivos":  [{"valor": r.valor, "total": r.total} for r in positivos],
        "pontos_negativos":  [{"valor": r.valor, "total": r.total} for r in negativos],
        "problemas":         [{"problema": r.problema, "total": r.total} for r in problemas],
    }


@router.get(
    "/export",
    summary="Exporta respostas da enquete em CSV (com os mesmos filtros do resumo)",
)
def exportar_csv(
    empresa_id: Optional[int] = None,
    genero: Optional[str] = None,
    faixa_etaria: Optional[str] = None,
    ano: Optional[int] = None,
    gestor: models.Gestor = Depends(get_gestor_atual),
    db: Session = Depends(get_db),
):
    query = db.query(models.RespostaEnquete).join(models.Empresa)
    if empresa_id:
        query = query.filter(models.RespostaEnquete.empresa_id == empresa_id)
    if genero:
        query = query.filter(models.RespostaEnquete.genero == genero)
    if faixa_etaria:
        query = query.filter(models.RespostaEnquete.faixa_etaria == faixa_etaria)
    query = filtrar_ano(query, ano)

    respostas = query.order_by(models.RespostaEnquete.data_resposta.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output, quoting=csv.QUOTE_ALL)
    writer.writerow([
        "data_resposta", "empresa", "genero", "faixa_etaria",
        "desejo_efetivacao", "nota_satisfacao",
        "problemas", "pontos_positivos", "pontos_negativos",
    ])
    for r in respostas:
        problemas   = "|".join(p.problema for p in r.problemas)
        positivos   = "|".join(a.valor for a in r.avaliacoes if a.tipo == "positivo")
        negativos   = "|".join(a.valor for a in r.avaliacoes if a.tipo == "negativo")
        writer.writerow([
            r.data_resposta.strftime("%Y-%m-%d %H:%M"),
            r.empresa.nome,
            r.genero,
            r.faixa_etaria,
            r.desejo_efetivacao,
            r.nota_satisfacao,
            problemas,
            positivos,
            negativos,
        ])

    data = output.getvalue().encode("utf-8-sig")  # BOM para Excel reconhecer UTF-8
    filename = f"softskills-export-{ano or 'todos'}.csv"
    logger.info("csv_exportado gestor_id=%s registros=%s", gestor.id, len(respostas))
    return StreamingResponse(
        iter([data]),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
