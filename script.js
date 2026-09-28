const $ = (id) => document.getElementById(id);

let abaAtual = "cifrar";
let temporizador;

const ALFABETO = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

const INGREDIENTES = [
    ["ovos", "3 ovos"],
    ["manteiga", "100 g de manteiga"],
    ["açúcar", "1/2 xícara de açúcar"],
    ["farinha de trigo", "1 xícara de farinha de trigo"],
    ["fubá", "1/2 xícara de fubá"],
    ["amido de milho", "2 colheres de sopa de amido de milho"],
    ["fermento em pó", "1 colher de sopa de fermento em pó"],
    ["cacau em pó", "2 colheres de sopa de cacau em pó"],
    ["chocolate", "100 g de chocolate"],
    ["aveia", "1/2 xícara de aveia"],
    ["leite", "100 ml de leite"],
    ["iogurte natural", "100 ml de iogurte natural"],
    ["creme de leite", "100 ml de creme de leite"],
    ["leite condensado", "1/2 lata de leite condensado"],
    ["doce de leite", "100 g de doce de leite"],
    ["requeijão", "100 g de requeijão"],
    ["mel", "2 colheres de sopa de mel"],
    ["café", "1 colher de chá de café"],
    ["essência de baunilha", "1 colher de chá de essência de baunilha"],
    ["canela", "1 colher de chá de canela"],
    ["gengibre", "1 colher de chá de gengibre"],
    ["coco ralado", "1/2 xícara de coco ralado"],
    ["banana", "2 bananas"],
    ["maçã", "2 maçãs"],
    ["pera", "2 peras"],
    ["morango", "100 g de morango"],
    ["cenoura", "2 cenouras"],
    ["abóbora", "100 g de abóbora"],
    ["laranja", "1 laranja"],
    ["limão", "1 limão"],
    ["abacaxi", "100 g de abacaxi"],
    ["cereja", "50 g de cereja"],
    ["damasco", "50 g de damasco"],
    ["uva passa", "50 g de uva passa"],
    ["goiabada", "100 g de goiabada"],
    ["nozes", "50 g de nozes"],
    ["amêndoas", "50 g de amêndoas"],
    ["castanhas", "50 g de castanhas"],
    ["amendoim", "50 g de amendoim"],
    ["pistache", "50 g de pistache"]
];

const QUANTIDADE = Object.fromEntries(INGREDIENTES);
const ORDEM = Object.fromEntries(INGREDIENTES.map(([nome], i) => [nome, i]));

const LETRAS_EXTRAS = ["A", "E", "O", "I", "U"];

const ACENTOS = {
    "\u0301": "uma pitada de",
    "\u0300": "um toque de",
    "\u0302": "uma porção de",
    "\u0303": "uma colherada de",
    "\u0327": "um punhado de"
};

const MAIUSCULA = "de primeira";

const PONTUACAO = {
    ".": "Mexa bem.",
    ",": "Espere um instante.",
    "!": "Reserve.",
    "?": "Prove para conferir o sabor.",
    ";": "Deixe descansar um pouco.",
    ":": "Mexa devagar."
};

const ACOES_NUM = [
    ["Leve ao fogo por {n} {u}.", "minuto"],
    ["Bata no liquidificador por {n} {u}.", "segundo"],
    ["Asse no forno por {n} {u}.", "minuto"],
    ["Deixe na geladeira por {n} {u}.", "minuto"]
];

const ABERTURA_PRIMEIRA = "Em uma tigela, misture";
const ABERTURA_MEIO = [
    "acrescente",
    "adicione",
    "junte",
    "incorpore",
    "misture",
    "combine",
    "envolva",
    "agregue",
    "una",
    "adicione aos poucos",
    "junte delicadamente",
    "incorpore aos poucos",
    "misture delicadamente",
    "misture bem",
    "combine delicadamente",
]
const ABERTURA_ULTIMA = "por fim, adicione";
const POR_BLOCO = 4;

function semAcento(texto) {
    return texto
        .normalize("NFD")
        .toUpperCase()
        .replace(/[\u0300-\u036f]/g, "");
}

function tokenizar(mensagem) {
    if (!mensagem || !mensagem.trim()) {
        throw new Error("Digite uma mensagem.");
    }

    const palavras = [];
    let atual = [];

    for (const c of mensagem.normalize("NFD")) {
        const letra = c.toUpperCase();

        if (letra.length === 1 && letra >= "A" && letra <= "Z") {
            atual.push([letra, null, c === c.toUpperCase() && c !== c.toLowerCase()]);
        } else if (c >= "0" && c <= "9") {
            if (atual.length && atual[atual.length - 1][0] === "#") {
                atual[atual.length - 1][1] += c;
            } else {
                atual.push(["#", c]);
            }
        } else if (Object.prototype.hasOwnProperty.call(PONTUACAO, c)) {
            if (atual.length) {
                atual.push(["@", c]);
                palavras.push(atual);
                atual = [];
            } else if (palavras.length) {
                palavras[palavras.length - 1].push(["@", c]);
            } else {
                palavras.push([["@", c]]);
            }
        } else if (/[\u0300-\u036f]/.test(c)) {
            if (Object.prototype.hasOwnProperty.call(ACENTOS, c) &&
                atual.length &&
                ALFABETO.includes(atual[atual.length - 1][0]) &&
                atual[atual.length - 1][1] === null) {
                atual[atual.length - 1][1] = c;
            }
        } else if (atual.length) {
            palavras.push(atual);
            atual = [];
        }
    }

    if (atual.length) palavras.push(atual);

    if (!palavras.length) {
        throw new Error("Digite uma mensagem com pelo menos uma letra ou número.");
    }

    return palavras;
}

/*
 * SHA-256 assíncrono usando a API nativa do navegador.
 * O GitHub Pages funciona em HTTPS, então crypto.subtle está disponível.
 */
async function sha256Hex(texto) {
    const dados = new TextEncoder().encode(texto);
    const hash = await crypto.subtle.digest("SHA-256", dados);
    return Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");
}

async function gerarMapa(chave) {
    if (!chave || !chave.trim()) {
        throw new Error("Digite uma chave.");
    }

    const ordenados = await Promise.all(
        INGREDIENTES.map(async ([nome]) => [nome, await sha256Hex(`${chave}|${nome}`)])
    );

    ordenados.sort((a, b) => a[1].localeCompare(b[1]));

    const mapa = {};
    ALFABETO.split("").forEach((letra, i) => {
        mapa[letra] = [ordenados[i][0]];
    });

    LETRAS_EXTRAS.forEach((letra, i) => {
        mapa[letra].push(ordenados[26 + i][0]);
    });

    return mapa;
}

function listaNatural(itens) {
    if (itens.length === 1) return itens[0];
    return itens.slice(0, -1).join(", ") + " e " + itens[itens.length - 1];
}

function montarEtapa(segmentos, indiceEtapa, ehUltima) {
    const frases = [];
    let extras = 0;

    for (const [tipo, conteudo] of segmentos) {
        if (tipo === "acao") {
            frases.push(conteudo);
            continue;
        }

        for (let i = 0; i < conteudo.length; i += POR_BLOCO) {
            const bloco = conteudo.slice(i, i + POR_BLOCO);
            let abertura;

            if (frases.length === 0) {
                if (indiceEtapa === 0) {
                    abertura = ABERTURA_PRIMEIRA;
                } else if (ehUltima) {
                    abertura = ABERTURA_ULTIMA.charAt(0).toUpperCase() + ABERTURA_ULTIMA.slice(1);
                } else {
                    const valor = ABERTURA_MEIO[(indiceEtapa - 1) % ABERTURA_MEIO.length];
                    abertura = valor.charAt(0).toUpperCase() + valor.slice(1);
                }
            } else {
                abertura = "Em seguida, " + ABERTURA_MEIO[extras % ABERTURA_MEIO.length];
                extras++;
            }

            frases.push(`${abertura} ${listaNatural(bloco)}.`);
        }
    }

    return frases.join(" ");
}

function finalizacao(totalLetras, totalPalavras) {
    const porcoes = totalPalavras === 1 ? "porção" : "porções";
    return `Misture bem e leve ao forno preaquecido a 180 °C por ${totalLetras} minutos. Deixe esfriar e sirva em ${totalPalavras} ${porcoes}.`;
}

async function cifrar(mensagem, chave) {
    const palavras = tokenizar(mensagem);
    const mapa = await gerarMapa(chave);

    const contador = {};
    const usados = new Set();
    const etapas = [];
    let total = 0;

    for (let i = 0; i < palavras.length; i++) {
        const palavra = palavras[i];
        const segmentos = [];
        const vistos = {};

        for (const tok of palavra) {
            if (tok[0] === "@") {
                segmentos.push(["acao", PONTUACAO[tok[1]]]);
                continue;
            }

            if (tok[0] === "#") {
                const digitos = tok[1];
                total += digitos.length;

                for (let g = 0, ini = 0; ini < digitos.length; g++, ini += 2) {
                    const n = digitos.slice(ini, ini + 2);
                    const [modelo, unidadeBase] = ACOES_NUM[g % ACOES_NUM.length];
                    const unidade = Number(n) === 1 ? unidadeBase : unidadeBase + "s";
                    segmentos.push(["acao", modelo.replace("{n}", n).replace("{u}", unidade)]);
                }
                continue;
            }

            const [letra, acento, maiuscula] = tok;
            total++;

            const opcoes = mapa[letra];
            const indice = contador[letra] || 0;
            const nome = opcoes[indice % opcoes.length];
            contador[letra] = indice + 1;
            usados.add(nome);

            const medida = acento ? ACENTOS[acento] : null;
            let item = medida ? `${medida} ${nome}` : nome;

            if (maiuscula) item += " " + MAIUSCULA;

            vistos[item] = (vistos[item] || 0) + 1;
            if (vistos[item] > 1) item = "mais " + item;

            if (segmentos.length && segmentos[segmentos.length - 1][0] === "ing") {
                segmentos[segmentos.length - 1][1].push(item);
            } else {
                segmentos.push(["ing", [item]]);
            }
        }

        etapas.push(montarEtapa(
            segmentos,
            i,
            i === palavras.length - 1 && i > 0
        ));
    }

    const lista = Array.from(usados).sort((a, b) => ORDEM[a] - ORDEM[b]).map(n => QUANTIDADE[n]);

    return {
        ingredientes: lista,
        etapas,
        finalizacao: finalizacao(total, palavras.length)
    };
}

function receitaParaTexto(receita) {
    const linhas = ["", "INGREDIENTES", ""];
    linhas.push(...receita.ingredientes.map(i => `- ${i}`));
    linhas.push("", "MODO DE PREPARO", "");
    linhas.push(...receita.etapas.map((e, i) => `${i + 1}. ${e}`));
    linhas.push("", "FINALIZAÇÃO", "", receita.finalizacao);
    return linhas.join("\n");
}

function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function limparParaBusca(texto) {
    return texto
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]+/g, " ")
        .trim();
}

async function decifrar(textoReceita, chave) {
    const mapa = await gerarMapa(chave);

    const nomeParaLetra = {};
    for (const [letra, nomes] of Object.entries(mapa)) {
        for (const nome of nomes) {
            nomeParaLetra[semAcento(nome)] = letra;
        }
    }

    const medidaParaAcento = {};
    for (const [acento, medida] of Object.entries(ACENTOS)) {
        medidaParaAcento[semAcento(medida)] = acento;
    }

    const nomes = Object.keys(nomeParaLetra).sort((a, b) => b.length - a.length);
    const medidas = Object.keys(medidaParaAcento).sort((a, b) => b.length - a.length);

    const fraseParaMarca = {};
    for (const [marca, frase] of Object.entries(PONTUACAO)) {
        fraseParaMarca[limparParaBusca(frase)] = marca;
    }

    const frasesP = Object.keys(fraseParaMarca).sort((a, b) => b.length - a.length);

    const modoMatch = textoReceita.match(
        /MODO DE PREPARO\s*([\s\S]*?)\s*FINALIZA[ÇC][ÃA]O\s*([\s\S]*)/i
    );

    if (!modoMatch) {
        throw new Error("Receita inválida: não achei MODO DE PREPARO / FINALIZAÇÃO.");
    }

    const etapas = [];
    const linhas = modoMatch[1].split(/\r?\n/);

    for (const linha of linhas) {
        const m = linha.match(/^\s*\d+[.)]\s*(.+?)\s*$/);
        if (m) etapas.push(m[1]);
    }

    if (!etapas.length) {
        throw new Error("Nenhuma etapa encontrada.");
    }

    // Todas as buscas são feitas sobre o texto sem acentos.
    // Os nomes maiores são procurados primeiro para evitar que "leite"
    // seja extraído de "leite condensado".
    const medidasAlternativas = medidas.map(escaparRegex);
    const nomesAlternativas = nomes.map(escaparRegex);
    const frasesAlternativas = frasesP.map(escaparRegex);

    const padrao = new RegExp(
        `(\\d+)|(?<![A-Z])(${frasesAlternativas.join("|")})(?![A-Z])|` +
        `(?<![A-Z])(?:(${medidasAlternativas.join("|")}) )?` +
        `(${nomesAlternativas.join("|")})(?: (${escaparRegex(semAcento(MAIUSCULA))}))?(?![A-Z])`,
        "g"
    );

    const palavras = [];
    let totalLetras = 0;

    for (const etapa of etapas) {
        const limpo = limparParaBusca(etapa);
        const letras = [];
        let match;

        padrao.lastIndex = 0;

        while ((match = padrao.exec(limpo)) !== null) {
            const numero = match[1];
            const pont = match[2];
            const medida = match[3];
            const nome = match[4];
            const maiuscula = match[5];

            if (numero) {
                letras.push(numero);
                totalLetras += numero.length;
                continue;
            }

            if (pont) {
                letras.push(fraseParaMarca[pont]);
                continue;
            }

            if (nome) {
                totalLetras++;

                let letra = nomeParaLetra[nome];

                if (medida) {
                    letra = letra + medidaParaAcento[medida];
                }

                letras.push(maiuscula ? letra : letra.toLowerCase());
            }
        }

        palavras.push(letras.join(""));
    }

    let aviso = null;
    const nums = modoMatch[2].match(/\d+/g) || [];

    if (nums.length < 3) {
        aviso = "Não consegui conferir a finalização.";
    } else if (Number(nums[1]) !== totalLetras || Number(nums[2]) !== palavras.length) {
        aviso = "Atenção: a finalização não bate com as etapas.";
    }

    return {
        mensagem: palavras.join(" "),
        aviso
    };
}

// ============================================================
// INTERFACE
// ============================================================

function mostrarErro(elemento, texto) {
    elemento.textContent = texto;
    elemento.classList.remove("hidden");
}

function limparErro(elemento) {
    elemento.classList.add("hidden");
}

function trocarAba(aba) {
    abaAtual = aba;

    ["cifrar", "decifrar"].forEach((nome) => {
        const ativa = nome === aba;
        $("painel-" + nome).classList.toggle("hidden", !ativa);
        $("tab-" + nome).classList.toggle("active", ativa);
        $("tab-" + nome).setAttribute("aria-selected", ativa);
    });

    atualizarTabela();
}

async function cifrarMensagem() {
    const mensagem = $("mensagem").value.trim();
    const chave = $("chave").value.trim();
    const erro = $("erro-cifrar");

    limparErro(erro);

    if (!mensagem) return mostrarErro(erro, "Digite uma mensagem.");
    if (!chave) return mostrarErro(erro, "Digite uma chave.");

    try {
        const receita = await cifrar(mensagem, chave);
        const texto = receitaParaTexto(receita);

        $("receita").value = texto;
        $("btn-copiar").disabled = false;

        $("receitaColada").value = texto;
        $("chaveDecifragem").value = chave;

        atualizarTabela();
    } catch (e) {
        console.error(e);
        mostrarErro(erro, e.message || "Erro ao gerar a receita.");
    }
}

async function copiarReceita() {
    const campo = $("receita");
    const botao = $("btn-copiar");

    if (!campo.value) return;

    try {
        await navigator.clipboard.writeText(campo.value);
    } catch (e) {
        campo.select();
        document.execCommand("copy");
    }

    botao.textContent = "Copiado";
    setTimeout(() => (botao.textContent = "Copiar"), 1500);
}

async function descriptografarMensagem() {
    const texto = $("receitaColada").value.trim();
    const chave = $("chaveDecifragem").value.trim();
    const erro = $("erro");
    const aviso = $("aviso");
    const saida = $("resultadoDecifragem");

    limparErro(erro);
    limparErro(aviso);

    if (!texto) return mostrarErro(erro, "Cole a receita.");
    if (!chave) return mostrarErro(erro, "Digite a chave.");

    try {
        const dados = await decifrar(texto, chave);

        $("mensagemOriginal").textContent = dados.mensagem;
        saida.classList.remove("vazio");

        if (dados.aviso) {
            aviso.textContent = dados.aviso;
            aviso.classList.remove("hidden");
        }

        atualizarTabela();
    } catch (e) {
        console.error(e);
        mostrarErro(erro, "Erro ao descriptografar: " + (e.message || e));
    }
}

function chaveAtiva() {
    const id = abaAtual === "cifrar" ? "chave" : "chaveDecifragem";
    return $(id).value.trim();
}

async function atualizarTabela() {
    clearTimeout(temporizador);

    temporizador = setTimeout(async () => {
        const tabela = $("tabela");
        const chave = chaveAtiva();

        tabela.innerHTML = "";
        if (!chave) return;

        try {
            const mapa = await gerarMapa(chave);

            Object.entries(mapa).forEach(([letra, ingredientes]) => {
                const celula = document.createElement("div");
                celula.className = "celula";

                const rotulo = document.createElement("b");
                rotulo.textContent = letra;

                const nomes = document.createElement("span");
                nomes.textContent = ingredientes.join(" / ");

                celula.append(rotulo, nomes);
                tabela.appendChild(celula);
            });
        } catch (e) {
            console.error(e);
        }
    }, 250);
}

$("chave").addEventListener("input", atualizarTabela);
$("chaveDecifragem").addEventListener("input", atualizarTabela);
