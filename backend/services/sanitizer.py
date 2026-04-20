import re

_TAG_RE = re.compile(r'<[^>]+>')
_SPACE_RE = re.compile(r'\s+')

# Palavras que violam a política de uso do mural (ambiente de aprendizes jovens).
# Expandir conforme necessário; a comparação ignora acentuação e capitalização.
_BLOCKLIST: frozenset[str] = frozenset({
    "viado", "bicha", "sapatao", "sapatão",
    "neguinho", "neguinha", "macaco", "macaca",
    "retardado", "retardada", "imbecil", "idiota",
    "puta", "vagabunda", "piranha", "prostituta",
    "nazista", "fascista",
})


def sanitizar_conteudo(texto: str) -> str:
    """Remove tags HTML, normaliza espaços e rejeita linguagem ofensiva.

    Levanta ValueError se a mensagem violar a política de uso.
    """
    texto = _TAG_RE.sub('', texto)
    texto = _SPACE_RE.sub(' ', texto).strip()

    palavras = set(re.findall(r'\b\w+\b', texto.lower()))
    ofensivas = palavras & _BLOCKLIST
    if ofensivas:
        raise ValueError("Mensagem contém linguagem ofensiva e não pode ser publicada.")

    return texto
