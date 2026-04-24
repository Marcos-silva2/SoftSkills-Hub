"""
Script de seed — popula o banco com dados iniciais.
Execute uma vez após instalar as dependências:

    python seed.py
"""
from core.database import engine, SessionLocal
import models
from core import security as auth

models.Base.metadata.create_all(bind=engine)

db = SessionLocal()

# ─── Empresas ─────────────────────────────────────────────────────────────────

empresas_iniciais = [
    # Instituições de Saúde e Assistência
    "Hospital Nipo-Brasileiro (ENKYO)",
    "Hospital Geral Guarulhos",
    "Hospital Municipal de Urgências (HMU)",
    "Hospital Pimentas Bonsucesso",
    "HBC Saúde",
    "NotreDame Intermédica",
    "NotreLabs",
    "Santa Fé",
    "Unimed",
    "UBS (Unidade Básica de Saúde)",
    "Casas André Luiz (Centro Espírita Nosso Lar)",
    "Casa de Repouso Espírito Santo",
    "Pensionato São Francisco de Assis",
    # Setor Industrial e Químico
    "AQIA Química Inovativa",
    "Artepel Embalagens Prime",
    "Contratil Embalagens",
    "Copobras",
    "Dispafilm do Brasil",
    "Embagraf",
    "Fremplast Tintas",
    "Glasser Tecnologia em Alvenaria e Pavimentação",
    "Indústria Bandeirante",
    "Polimix Concreto",
    "Rulli Standard",
    "Axalta",
    "Verquímica",
    "Oswaldo Cruz Química",
    "Maxi Plating",
    "Alko",
    "Flextech",
    # Logística e Serviços
    "Nobre Cestas",
    "Daicast",
    "Newrest Travel Retail",
    "Puratos",
    "Reis Office",
    "Rodowessler",
    "LSG Sky Chefs",
    "Transville",
    "Cruz de Malta Transportadora & Guindaste",
    "Navarro",
    "Raft Embalagens",
    "VTCLOG",
    # Sindicatos e Associações
    "Associação dos Cabos e Soldados PMESP",
    "CIESP",
    "SINDEG",
    "Sindiquímicos",
    "Sindicato dos Trabalhadores nas Indústrias Químicas de Suzano",
    "STAP Guarulhos",
    "STI (Papel, Papelão e Cortiça de Guarulhos)",
    "Sinteata",
    # Educação e Outros
    "Educação Infantil Pequeno Príncipe",
    "Colégio Mater Amabilis",
    "Inova Formaturas",
    "Impala Cosméticos",
    "Santo Angelo (Música na veia)",
    "Academia de Bombeiros Arco de Fogo",
    "LIS Gráfica e Editora",
    "Starcast",
    "Estrela Aviamentos",
    "Prefeitura de Guarulhos",
    "Secretaria da Saúde de Guarulhos",
]

inseridas = 0
for nome in empresas_iniciais:
    if not db.query(models.Empresa).filter(models.Empresa.nome == nome).first():
        db.add(models.Empresa(nome=nome))
        inseridas += 1

db.commit()
print(f"[OK] Empresas: {inseridas} inseridas, {len(empresas_iniciais) - inseridas} já existiam. Total: {len(empresas_iniciais)}.")

# ─── Admin ────────────────────────────────────────────────────────────────────

ADMIN_USERNAME = "admin"
ADMIN_SENHA = "123456"

if not db.query(models.Gestor).filter(models.Gestor.username == ADMIN_USERNAME).first():
    db.add(models.Gestor(
        username=ADMIN_USERNAME,
        senha_hash=auth.hash_senha(ADMIN_SENHA),
        nome="Administrador",
    ))
    db.commit()
    print(f"[OK] Admin criado     — usuário: {ADMIN_USERNAME} | senha: {ADMIN_SENHA}")
else:
    print(f"[--] Admin já existia: {ADMIN_USERNAME}")

# ─── Artigos iniciais ─────────────────────────────────────────────────────────

artigos = [
    {
        "titulo": "Como receber feedback sem levar para o lado pessoal",
        "resumo": "Técnicas práticas de inteligência emocional para transformar críticas em crescimento profissional.",
        "conteudo": (
            "Receber feedback é uma das habilidades mais valiosas — e mais difíceis — do ambiente de trabalho. "
            "Quando alguém aponta um erro ou sugere uma melhoria, nossa primeira reação costuma ser defensiva. "
            "Isso é natural: o cérebro interpreta críticas como ameaças.\n\n"
            "**3 técnicas para mudar esse padrão:**\n\n"
            "1. **Respira antes de responder.** Uma pausa de 3 segundos ativa o córtex pré-frontal e reduz a reação emocional imediata.\n"
            "2. **Separe o comportamento da identidade.** 'Esse relatório precisa de mais dados' é diferente de 'você é incompetente'.\n"
            "3. **Faça uma pergunta.** 'O que você sugere para melhorar?' mostra maturidade e transforma o feedback em diálogo."
        ),
        "categoria": "inteligencia_emocional",
        "tempo_leitura": 4,
    },
    {
        "titulo": "Comunicação assertiva: diga o que pensa sem agressividade",
        "resumo": "Aprenda a se expressar com clareza e respeito, sem passividade nem agressão.",
        "conteudo": (
            "Ser assertivo é ocupar o espaço certo na comunicação — nem se calar quando deveria falar, "
            "nem partir para o ataque quando se sente pressionado.\n\n"
            "**A fórmula da comunicação assertiva:**\n\n"
            "Use a estrutura: **'Quando [situação], eu me sinto [emoção], porque [impacto]. "
            "Gostaria que [pedido claro].'**\n\n"
            "Exemplo: 'Quando recebo tarefas de última hora, eu me sinto sobrecarregado, "
            "porque não consigo fazer um bom trabalho. Gostaria de receber as demandas com pelo menos um dia de antecedência.'\n\n"
            "Essa estrutura evita acusações e abre espaço para uma conversa real."
        ),
        "categoria": "comunicacao",
        "tempo_leitura": 5,
    },
    {
        "titulo": "Seus direitos como jovem aprendiz — o que a lei garante",
        "resumo": "Entenda o que a Lei da Aprendizagem protege e como agir se seus direitos forem desrespeitados.",
        "conteudo": (
            "A Lei nº 10.097/2000 (Lei da Aprendizagem) garante direitos específicos para jovens de 14 a 24 anos "
            "em contratos de aprendizagem. Conhecê-los é o primeiro passo para se proteger.\n\n"
            "**Direitos garantidos:**\n\n"
            "- **Carteira assinada** desde o primeiro dia\n"
            "- **Salário mínimo hora** (proporcional à jornada)\n"
            "- **Jornada máxima de 6 horas/dia** para quem ainda está no Ensino Médio "
            "(8h para quem já concluiu)\n"
            "- **Participação obrigatória** nos cursos teóricos — a empresa não pode proibir\n"
            "- **FGTS** com alíquota de 2%\n"
            "- **13º salário, férias e vale-transporte**\n\n"
            "Se algum desses direitos estiver sendo desrespeitado, você pode denunciar ao "
            "Ministério do Trabalho ou à instituição formadora (SENAI, SENAC, etc.) sem precisar "
            "se identificar publicamente."
        ),
        "categoria": "postura_profissional",
        "tempo_leitura": 6,
    },
    {
        "titulo": "Ansiedade no trabalho: sinais, causas e o que fazer",
        "resumo": "Como identificar quando o estresse vira ansiedade e estratégias práticas para retomar o equilíbrio.",
        "conteudo": (
            "Um nível saudável de pressão pode até melhorar o desempenho. "
            "Mas quando a tensão é constante e começa a impactar o sono, a concentração e as relações, "
            "é sinal de que algo precisa mudar.\n\n"
            "**Sinais de alerta:**\n"
            "- Dificuldade de concentração mesmo em tarefas simples\n"
            "- Sensação de que 'não dá conta de nada'\n"
            "- Coração acelerado antes de ir trabalhar\n"
            "- Irritabilidade fora do normal\n\n"
            "**O que ajuda no curto prazo:**\n"
            "1. **Técnica 4-7-8:** inspire por 4 segundos, segure por 7, expire por 8. Repita 3 vezes.\n"
            "2. **Escreva o que está pesando.** Externalizar os pensamentos reduz a intensidade emocional.\n"
            "3. **Fale com alguém de confiança.** Você não precisa resolver tudo sozinho.\n\n"
            "Se os sintomas persistirem, procure apoio de um profissional de saúde mental."
        ),
        "categoria": "saude_mental",
        "tempo_leitura": 5,
    },
]

inseridos = 0
for a in artigos:
    if not db.query(models.Artigo).filter(models.Artigo.titulo == a["titulo"]).first():
        db.add(models.Artigo(**a))
        inseridos += 1

db.commit()
print(f"[OK] {inseridos} artigos inseridos ({len(artigos) - inseridos} já existiam).")

# ─── Dados de enquete (geração aleatória para demo) ───────────────────────────

import random

if db.query(models.RespostaEnquete).count() == 0:

    random.seed(42)  # seed fixo → dados reproduzíveis

    # Empresas com perfis distintos para tornar o dashboard interessante
    perfis_empresa = {
        # nome_empresa: (nota_min, nota_max, perc_efetivacao_sim, problemas_frequentes)
        "Unimed":                          (3, 5, 0.70, ["falta_feedback", "microgerenciamento"]),
        "Hospital Nipo-Brasileiro (ENKYO)":(2, 4, 0.45, ["sobrecarga", "carga_excessiva", "pressao_psicologica"]),
        "Hospital Geral Guarulhos":        (2, 3, 0.30, ["sobrecarga", "carga_excessiva", "falta_orientacao", "assedio_moral"]),
        "Prefeitura de Guarulhos":         (3, 5, 0.60, ["desorganizacao", "falta_feedback"]),
        "AQIA Química Inovativa":          (1, 3, 0.25, ["condicoes_inseguras", "desvio_funcao", "carga_excessiva", "ameacas_demissao"]),
        "Polimix Concreto":                (2, 4, 0.40, ["carga_excessiva", "condicoes_inseguras", "ausencia_intervalo"]),
        "LSG Sky Chefs":                   (3, 5, 0.65, ["tarefas_repetitivas", "falta_feedback"]),
        "Puratos":                         (4, 5, 0.80, ["nenhum"]),
        "Copobras":                        (2, 4, 0.35, ["desvio_funcao", "microgerenciamento", "desvalorizacao_ideias"]),
        "Newrest Travel Retail":           (3, 5, 0.55, ["falta_orientacao", "tarefas_repetitivas"]),
        "Secretaria da Saúde de Guarulhos":(2, 4, 0.40, ["pressao_psicologica", "falta_feedback", "sobrecarga"]),
        "Axalta":                          (4, 5, 0.75, ["nenhum", "tarefas_repetitivas"]),
        "Colégio Mater Amabilis":          (3, 5, 0.60, ["falta_feedback", "microgerenciamento"]),
        "Transville":                      (1, 3, 0.20, ["carga_excessiva", "desrespeito_direitos", "atraso_pagamento", "ameacas_demissao"]),
        "Indústria Bandeirante":           (2, 4, 0.45, ["desvio_funcao", "condicoes_inseguras", "ausencia_intervalo"]),
    }

    todos_problemas = [
        "assedio_moral", "favorecimento", "machismo", "assedio_sexual",
        "desvio_funcao", "carga_excessiva", "falta_orientacao", "sobrecarga",
        "preconceito_etario", "discriminacao_racial", "homofobia",
        "intolerancia_religiosa", "atraso_pagamento", "falta_feedback",
        "pressao_psicologica", "condicoes_inseguras", "exclusao_equipe",
        "desvalorizacao_ideias", "microgerenciamento", "tarefas_repetitivas",
        "ameacas_demissao", "falta_estrutura", "desrespeito_direitos",
        "ausencia_intervalo", "proibicao_cursos",
    ]
    positivos_opcoes = ["aprendizado", "clima_bom", "lideranca_apoio", "beneficios", "flexibilidade"]
    negativos_opcoes = ["comunicacao_ruim", "desorganizacao", "clima_tenso", "falta_reconhecimento", "distancia_lideranca"]
    generos  = ["feminino", "masculino", "prefiro_nao_dizer"]
    faixas   = ["15-16", "17-18", "19-21", "22"]
    efetivacoes = ["sim", "nao", "talvez"]

    def faixa_para_idade(faixa):
        mapa = {"15-16": 15, "17-18": 17, "19-21": 20, "22": 22}
        return mapa[faixa]

    empresas_db = {e.nome: e for e in db.query(models.Empresa).all()}

    qtd_respostas = 0
    for nome_empresa, (nota_min, nota_max, perc_sim, problemas_freq) in perfis_empresa.items():
        empresa = empresas_db.get(nome_empresa)
        if not empresa:
            continue

        n_respostas = random.randint(10, 18)
        for _ in range(n_respostas):
            faixa   = random.choice(faixas)
            genero  = random.choices(generos, weights=[40, 45, 15])[0]
            nota    = random.randint(nota_min, nota_max)

            # Decisão de efetivação alinhada com satisfação e perfil da empresa
            r = random.random()
            if r < perc_sim:
                efetivacao = "sim"
            elif r < perc_sim + 0.25:
                efetivacao = "talvez"
            else:
                efetivacao = "nao"

            resposta = models.RespostaEnquete(
                empresa_id=empresa.id,
                genero=genero,
                faixa_etaria=faixa,
                desejo_efetivacao=efetivacao,
                nota_satisfacao=nota,
            )
            db.add(resposta)
            db.flush()

            # Problemas: mistura frequentes da empresa + aleatórios ocasionais
            if "nenhum" in problemas_freq and nota >= 4:
                escolhidos = ["nenhum"]
            else:
                n_prob = random.randint(1, 3)
                pool = problemas_freq * 3 + todos_problemas  # peso nos frequentes
                escolhidos = list(set(random.choices(pool, k=n_prob)))

            for p in escolhidos:
                db.add(models.RespostaProblema(resposta_id=resposta.id, problema=p))

            # Pontos positivos / negativos (2-3 cada)
            for v in random.sample(positivos_opcoes, k=random.randint(1, 3)):
                db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="positivo", valor=v))
            for v in random.sample(negativos_opcoes, k=random.randint(1, 2)):
                db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="negativo", valor=v))

            qtd_respostas += 1

    db.commit()
    print(f"[OK] {qtd_respostas} respostas de enquete geradas em {len(perfis_empresa)} empresas.")
else:
    total = db.query(models.RespostaEnquete).count()
    print(f"[--] Enquetes já existiam: {total} respostas no banco.")

# ─── Respostas datadas para 2024 e 2025 ──────────────────────────────────────

from datetime import datetime, timezone, timedelta

def _gerar_respostas_ano(ano: int, qtd: int, seed_val: int):
    """Gera `qtd` respostas com data_resposta distribuída ao longo do ano."""
    from sqlalchemy import func as _func
    ja_existe = db.query(_func.count(models.RespostaEnquete.id)).filter(
        _func.substr(models.RespostaEnquete.data_resposta, 1, 4) == str(ano)
    ).scalar()
    if ja_existe:
        print(f"[--] Respostas de {ano} já existiam: {ja_existe} registros.")
        return

    random.seed(seed_val)
    empresas_db = {e.nome: e for e in db.query(models.Empresa).all()}

    perfis = [
        ("Unimed",                          3, 5, 0.70, ["falta_feedback", "microgerenciamento"]),
        ("Hospital Geral Guarulhos",        2, 3, 0.30, ["sobrecarga", "falta_orientacao"]),
        ("Prefeitura de Guarulhos",         3, 5, 0.60, ["desorganizacao", "falta_feedback"]),
        ("AQIA Química Inovativa",          1, 3, 0.25, ["condicoes_inseguras", "carga_excessiva"]),
        ("Puratos",                         4, 5, 0.80, ["nenhum"]),
        ("Transville",                      1, 3, 0.20, ["carga_excessiva", "atraso_pagamento"]),
        ("Axalta",                          4, 5, 0.75, ["nenhum"]),
        ("LSG Sky Chefs",                   3, 5, 0.65, ["tarefas_repetitivas"]),
    ]
    todos_problemas = [
        "assedio_moral", "desvio_funcao", "carga_excessiva", "falta_orientacao",
        "sobrecarga", "atraso_pagamento", "falta_feedback", "pressao_psicologica",
        "condicoes_inseguras", "microgerenciamento", "tarefas_repetitivas",
        "ameacas_demissao", "desrespeito_direitos", "ausencia_intervalo",
    ]
    positivos_opcoes = ["aprendizado", "clima_bom", "lideranca_apoio", "beneficios", "flexibilidade"]
    negativos_opcoes = ["comunicacao_ruim", "desorganizacao", "clima_tenso", "falta_reconhecimento", "distancia_lideranca"]
    generos = ["feminino", "masculino", "prefiro_nao_dizer"]
    faixas  = ["15-16", "17-18", "19-21", "22"]

    # Gera datas distribuídas ao longo do ano (sem timezone para compatibilidade com SQLite)
    inicio_ano = datetime(ano, 1, 1)
    dias_no_ano = 366 if ano % 4 == 0 else 365
    datas = sorted([inicio_ano + timedelta(days=random.randint(0, dias_no_ano - 1)) for _ in range(qtd)])

    inseridas = 0
    for i in range(qtd):
        nome_empresa, nota_min, nota_max, perc_sim, problemas_freq = random.choice(perfis)
        empresa = empresas_db.get(nome_empresa)
        if not empresa:
            continue

        faixa  = random.choice(faixas)
        genero = random.choices(generos, weights=[40, 45, 15])[0]
        nota   = random.randint(nota_min, nota_max)

        r = random.random()
        efetivacao = "sim" if r < perc_sim else ("talvez" if r < perc_sim + 0.25 else "nao")

        resposta = models.RespostaEnquete(
            empresa_id=empresa.id,
            genero=genero,
            faixa_etaria=faixa,
            desejo_efetivacao=efetivacao,
            nota_satisfacao=nota,
            data_resposta=datas[i],
        )
        db.add(resposta)
        db.flush()

        if "nenhum" in problemas_freq and nota >= 4:
            escolhidos = ["nenhum"]
        else:
            pool = problemas_freq * 3 + todos_problemas
            escolhidos = list(set(random.choices(pool, k=random.randint(1, 3))))
        for p in escolhidos:
            db.add(models.RespostaProblema(resposta_id=resposta.id, problema=p))

        for v in random.sample(positivos_opcoes, k=random.randint(1, 3)):
            db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="positivo", valor=v))
        for v in random.sample(negativos_opcoes, k=random.randint(1, 2)):
            db.add(models.RespostaAvaliacao(resposta_id=resposta.id, tipo="negativo", valor=v))

        inseridas += 1

    db.commit()
    print(f"[OK] {inseridas} respostas geradas para {ano} (distribuídas ao longo do ano).")

_gerar_respostas_ano(ano=2024, qtd=20, seed_val=2024)
_gerar_respostas_ano(ano=2025, qtd=20, seed_val=2025)

db.close()
print("\nSeed concluído! Banco pronto para uso.")
print("Inicie o servidor com:  uvicorn main:app --reload")
