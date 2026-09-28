"""
CIFRA DA RECEITA
================

Lógica (fácil de explicar):

1) A CHAVE embaralha 40 ingredientes e monta a tabela:
   cada letra vira um ingrediente. As letras mais comuns (A, E, O, I, S,
   R, N, D, M, U, T) ganham 2 ou 3 ingredientes, e a cada vez que a letra
   aparece usamos um diferente. Isso evita repetir sempre o mesmo.

2) A MENSAGEM vira o MODO DE PREPARO:
   - cada PALAVRA = uma etapa da receita;
   - cada LETRA = um ingrediente dessa etapa, na mesma ordem;
   - o ACENTO vira uma medida na frente do ingrediente:
       agudo    (á é í ó ú)  -> "uma pitada de"
       grave    (à)          -> "um toque de"
       circunf. (â ê ô)      -> "uma porção de"
       til      (ã õ)        -> "uma colherada de"
       cedilha  (ç)          -> "um punhado de"

3) NÚMEROS viram instruções de cozinha com tempo (a cada 2 dígitos):
       1º grupo -> "Leve ao fogo por 19 minutos."
       2º grupo -> "Bata no liquidificador por 26 segundos."
       3º grupo -> "Asse no forno por ... minutos."
       4º grupo -> "Deixe na geladeira por ... minutos."
   (depois volta ao começo). Ex.: 2026 = fogo por 20 min + liquidificador 26 s.

4) PONTUAÇÃO vira uma instrução curta, sem ingrediente:
       .  -> "Mexa bem."
       ,  -> "Espere um instante."
       !  -> "Bata com vontade."
       ?  -> "Prove para conferir o sabor."
       ;  -> "Deixe descansar um pouco."
       :  -> "Mexa devagar."
   O sinal fica grudado no fim da palavra, como no texto original.

5) A FINALIZAÇÃO guarda uma conferência:
   minutos de forno = total de letras e números, porções = total de palavras.

   MAIÚSCULA -> o ingrediente vem "de primeira" (ex.: "nozes de primeira").
   Minúscula  -> só o nome do ingrediente.

Outros símbolos (aspas, hífen, @, etc.) são ignorados.
"""

import hashlib
import re
import unicodedata

ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

# Em ordem de cozinha (também é a ordem da lista de ingredientes)
INGREDIENTES = [
    ("ovos", "3 ovos"),
    ("manteiga", "100 g de manteiga"),
    ("açúcar", "1/2 xícara de açúcar"),
    ("farinha de trigo", "1 xícara de farinha de trigo"),
    ("fubá", "1/2 xícara de fubá"),
    ("amido de milho", "2 colheres de sopa de amido de milho"),
    ("fermento em pó", "1 colher de sopa de fermento em pó"),
    ("cacau em pó", "2 colheres de sopa de cacau em pó"),
    ("chocolate", "100 g de chocolate"),
    ("aveia", "1/2 xícara de aveia"),
    ("leite", "100 ml de leite"),
    ("iogurte natural", "100 ml de iogurte natural"),
    ("creme de leite", "100 ml de creme de leite"),
    ("leite condensado", "1/2 lata de leite condensado"),
    ("doce de leite", "100 g de doce de leite"),
    ("requeijão", "100 g de requeijão"),
    ("mel", "2 colheres de sopa de mel"),
    ("café", "1 colher de chá de café"),
    ("essência de baunilha", "1 colher de chá de essência de baunilha"),
    ("canela", "1 colher de chá de canela"),
    ("gengibre", "1 colher de chá de gengibre"),
    ("coco ralado", "1/2 xícara de coco ralado"),
    ("banana", "2 bananas"),
    ("maçã", "2 maçãs"),
    ("pera", "2 peras"),
    ("morango", "100 g de morango"),
    ("cenoura", "2 cenouras"),
    ("abóbora", "100 g de abóbora"),
    ("laranja", "1 laranja"),
    ("limão", "1 limão"),
    ("abacaxi", "100 g de abacaxi"),
    ("cereja", "50 g de cereja"),
    ("damasco", "50 g de damasco"),
    ("uva passa", "50 g de uva passa"),
    ("goiabada", "100 g de goiabada"),
    ("nozes", "50 g de nozes"),
    ("amêndoas", "50 g de amêndoas"),
    ("castanhas", "50 g de castanhas"),
    ("amendoim", "50 g de amendoim"),
    ("pistache", "50 g de pistache"),
]
assert len(INGREDIENTES) == 40

QUANTIDADE = dict(INGREDIENTES)
ORDEM = {nome: i for i, (nome, _) in enumerate(INGREDIENTES)}

# Letras que ganham um ingrediente extra (A, E, O ganham 2 extras)
LETRAS_EXTRAS = ["A", "E", "O", "I", "U"]

# Acento (marca combinante Unicode) -> medida
ACENTOS = {
    "\u0301": "uma pitada de",     # agudo
    "\u0300": "um toque de",       # grave
    "\u0302": "uma porção de",     # circunflexo
    "\u0303": "uma colherada de",  # til
    "\u0327": "um punhado de",     # cedilha
}

MAIUSCULA = "de primeira"

# Pontuação -> instrução (nenhuma contém nome de ingrediente)
PONTUACAO = {
    ".": "Mexa bem.",
    ",": "Espere um instante.",
    "!": "Reserve.",
    "?": "Prove para conferir o sabor.",
    ";": "Deixe descansar um pouco.",
    ":": "Mexa devagar.",
}

# Números: (frase, unidade no singular)
ACOES_NUM = [
    ("Leve ao fogo por {n} {u}.", "minuto"),
    ("Bata no liquidificador por {n} {u}.", "segundo"),
    ("Asse no forno por {n} {u}.", "minuto"),
    ("Deixe na geladeira por {n} {u}.", "minuto"),
]

ABERTURA_PRIMEIRA = "Em uma tigela, misture"
ABERTURA_MEIO = ["acrescente", "adicione", "junte", "incorpore", "Misture", "Mexa"]
ABERTURA_ULTIMA = "por fim, adicione"
POR_BLOCO = 4


# ------------------------------------------------------------
# UTILITÁRIOS
# ------------------------------------------------------------
def _sem_acento(texto):
    texto = unicodedata.normalize("NFD", texto.upper())
    return "".join(c for c in texto if unicodedata.category(c) != "Mn")


def tokenizar(mensagem):
    """Texto -> lista de palavras. Cada palavra é uma lista de
    [letra, acento, maiúscula?], ["#", "dígitos"] ou ["@", "pontuação"]."""
    if not mensagem or not mensagem.strip():
        raise ValueError("Digite uma mensagem.")

    palavras, atual = [], []
    for c in unicodedata.normalize("NFD", mensagem):
        letra = c.upper()
        if len(letra) == 1 and "A" <= letra <= "Z":
            atual.append([letra, None, c.isupper()])
        elif "0" <= c <= "9":
            if atual and atual[-1][0] == "#":
                atual[-1][1] += c          # continua o mesmo número
            else:
                atual.append(["#", c])     # novo número
        elif c in PONTUACAO:
            if atual:                                  # fecha a palavra atual
                atual.append(["@", c])
                palavras.append(atual)
                atual = []
            elif palavras:                             # ex.: "..." ou "?!"
                palavras[-1].append(["@", c])
            else:
                palavras.append([["@", c]])
        elif unicodedata.category(c) == "Mn":
            if c in ACENTOS and atual and atual[-1][0] in ALFABETO and atual[-1][1] is None:
                atual[-1][1] = c
        elif atual:
            palavras.append(atual)
            atual = []
    if atual:
        palavras.append(atual)

    if not palavras:
        raise ValueError("Digite uma mensagem com pelo menos uma letra ou número.")
    return palavras


# ------------------------------------------------------------
# 1) TABELA DA CHAVE
# ------------------------------------------------------------
def gerar_mapa(chave):
    """letra -> lista de ingredientes possíveis."""
    if not chave or not chave.strip():
        raise ValueError("Digite uma chave.")

    ordenados = sorted(
        (n for n, _ in INGREDIENTES),
        key=lambda n: hashlib.sha256(f"{chave}|{n}".encode("utf-8")).digest(),
    )
    mapa = {letra: [nome] for letra, nome in zip(ALFABETO, ordenados[:26])}
    for letra, nome in zip(LETRAS_EXTRAS, ordenados[26:]):
        mapa[letra].append(nome)
    return mapa


# ------------------------------------------------------------
# 2) MODO DE PREPARO
# ------------------------------------------------------------
def _lista_natural(itens):
    return itens[0] if len(itens) == 1 else ", ".join(itens[:-1]) + " e " + itens[-1]


def _montar_etapa(segmentos, indice_etapa, eh_ultima):
    """segmentos: ("ing", [ingredientes]) ou ("acao", "frase pronta.")"""
    frases, extras = [], 0
    for tipo, conteudo in segmentos:
        if tipo == "acao":
            frases.append(conteudo)
            continue
        for i in range(0, len(conteudo), POR_BLOCO):
            bloco = conteudo[i:i + POR_BLOCO]
            if not frases:
                if indice_etapa == 0:
                    abertura = ABERTURA_PRIMEIRA
                elif eh_ultima:
                    abertura = ABERTURA_ULTIMA.capitalize()
                else:
                    abertura = ABERTURA_MEIO[(indice_etapa - 1) % len(ABERTURA_MEIO)].capitalize()
            else:
                abertura = "Em seguida, " + ABERTURA_MEIO[extras % len(ABERTURA_MEIO)]
                extras += 1
            frases.append(f"{abertura} {_lista_natural(bloco)}.")
    return " ".join(frases)


# ------------------------------------------------------------
# 3) FINALIZAÇÃO
# ------------------------------------------------------------
def _finalizacao(total_letras, total_palavras):
    porcoes = "porção" if total_palavras == 1 else "porções"
    return (
        f"Misture bem e leve ao forno preaquecido a 180 °C por "
        f"{total_letras} minutos. Deixe esfriar e sirva em "
        f"{total_palavras} {porcoes}."
    )


# ------------------------------------------------------------
# CRIPTOGRAFAR
# ------------------------------------------------------------
def cifrar(mensagem, chave):
    palavras = tokenizar(mensagem)
    mapa = gerar_mapa(chave)

    contador = {}   # quantas vezes cada letra já apareceu
    usados = set()
    etapas = []
    total = 0       # letras + dígitos

    for i, palavra in enumerate(palavras):
        segmentos, vistos = [], {}
        for tok in palavra:
            if tok[0] == "@":
                segmentos.append(("acao", PONTUACAO[tok[1]]))
                continue

            if tok[0] == "#":
                digitos = tok[1]
                total += len(digitos)
                for g, ini in enumerate(range(0, len(digitos), 2)):
                    n = digitos[ini:ini + 2]
                    modelo, unidade = ACOES_NUM[g % len(ACOES_NUM)]
                    if int(n) != 1:
                        unidade += "s"
                    segmentos.append(("acao", modelo.format(n=n, u=unidade)))
                continue

            letra, acento, maiuscula = tok
            total += 1
            opcoes = mapa[letra]
            nome = opcoes[contador.get(letra, 0) % len(opcoes)]
            contador[letra] = contador.get(letra, 0) + 1
            usados.add(nome)

            medida = ACENTOS.get(acento)
            item = f"{medida} {nome}" if medida else nome
            if maiuscula:
                item += " " + MAIUSCULA
            vistos[item] = vistos.get(item, 0) + 1
            if vistos[item] > 1:
                item = "mais " + item

            if segmentos and segmentos[-1][0] == "ing":
                segmentos[-1][1].append(item)
            else:
                segmentos.append(("ing", [item]))

        etapas.append(_montar_etapa(segmentos, i, i == len(palavras) - 1 and i > 0))

    lista = [QUANTIDADE[n] for n in sorted(usados, key=ORDEM.get)]

    return {
        "ingredientes": lista,
        "etapas": etapas,
        "finalizacao": _finalizacao(total, len(palavras)),
    }


def receita_para_texto(receita):
    linhas = ["", "INGREDIENTES", ""]
    linhas += [f"- {i}" for i in receita["ingredientes"]]
    linhas += ["", "MODO DE PREPARO", ""]
    linhas += [f"{n}. {e}" for n, e in enumerate(receita["etapas"], 1)]
    linhas += ["", "FINALIZAÇÃO", "", receita["finalizacao"]]
    return "\n".join(linhas)


# ------------------------------------------------------------
# DESCRIPTOGRAFAR
# ------------------------------------------------------------
def decifrar(texto_receita, chave, retornar_aviso=False):
    mapa = gerar_mapa(chave)

    nome_para_letra = {}
    for letra, nomes in mapa.items():
        for n in nomes:
            nome_para_letra[_sem_acento(n)] = letra

    medida_para_acento = {_sem_acento(m): a for a, m in ACENTOS.items()}

    # Maiores primeiro: "LEITE CONDENSADO" e "DOCE DE LEITE" antes de "LEITE"
    nomes = sorted(nome_para_letra, key=len, reverse=True)
    medidas = sorted(medida_para_acento, key=len, reverse=True)

    def limpar(t):
        return re.sub(r"[^A-Z0-9]+", " ", _sem_acento(t)).strip()

    frase_para_marca = {limpar(f): marca for marca, f in PONTUACAO.items()}
    frases_p = sorted(frase_para_marca, key=len, reverse=True)
    padrao = re.compile(
        r"(\d+)|(?<![A-Z])(" + "|".join(frases_p) + r")(?![A-Z])"
        r"|(?<![A-Z])(?:(" + "|".join(medidas) + r") )?("
        + "|".join(nomes) + r")(?: (" + _sem_acento(MAIUSCULA) + r"))?(?![A-Z])"
    )

    m = re.search(r"MODO DE PREPARO\s*(.*?)\s*FINALIZA[ÇC][ÃA]O\s*(.*)",
                  texto_receita, flags=re.S | re.I)
    if not m:
        raise ValueError("Receita inválida: não achei MODO DE PREPARO / FINALIZAÇÃO.")

    etapas = re.findall(r"^\s*\d+[.)]\s*(.+?)\s*$", m.group(1), flags=re.M)
    if not etapas:
        raise ValueError("Nenhuma etapa encontrada.")

    palavras, total_letras = [], 0
    for etapa in etapas:
        limpo = re.sub(r"[^A-Z0-9]+", " ", _sem_acento(etapa))
        letras = []
        for numero, pont, medida, nome, maiuscula in padrao.findall(limpo):
            if numero:
                letras.append(numero)
                total_letras += len(numero)
                continue
            if pont:
                letras.append(frase_para_marca[pont])
                continue
            total_letras += 1
            letra = nome_para_letra[nome]
            if medida:
                letra = unicodedata.normalize("NFC", letra + medida_para_acento[medida])
            letras.append(letra if maiuscula else letra.lower())
        palavras.append("".join(letras))

    aviso = None
    nums = re.findall(r"\d+", m.group(2))  # [180, minutos, porções]
    if len(nums) < 3:
        aviso = "Não consegui conferir a finalização."
    elif int(nums[1]) != total_letras or int(nums[2]) != len(palavras):
        aviso = "Atenção: a finalização não bate com as etapas."

    mensagem = " ".join(palavras)
    return (mensagem, aviso) if retornar_aviso else mensagem


# Apelidos de compatibilidade com o app.py
criptografar = cifrar
descriptografar = decifrar


def main():
    msg = input("Mensagem: ")
    chave = input("Chave: ")

    texto = receita_para_texto(cifrar(msg, chave))
    print("\n" + texto + "\n")

    resultado, aviso = decifrar(texto, chave, retornar_aviso=True)
    print("Decifrado:", resultado)
    if aviso:
        print(aviso)


if __name__ == "__main__":
    main()