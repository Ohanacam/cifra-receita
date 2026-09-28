const $ = (id) => document.getElementById(id);

let abaAtual = "cifrar";

async function chamarApi(url, corpo) {
    const resposta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo)
    });
    return resposta.json();
}

function mostrarErro(elemento, texto) {
    elemento.textContent = texto;
    elemento.classList.remove("hidden");
}

function limparErro(elemento) {
    elemento.classList.add("hidden");
}

// ============================================================
// ABAS
// ============================================================

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

// ============================================================
// CRIPTOGRAFAR
// ============================================================

async function cifrarMensagem() {
    const mensagem = $("mensagem").value.trim();
    const chave = $("chave").value.trim();
    const erro = $("erro-cifrar");

    limparErro(erro);

    if (!mensagem) return mostrarErro(erro, "Digite uma mensagem.");
    if (!chave) return mostrarErro(erro, "Digite uma chave.");

    try {
        const dados = await chamarApi("/api/cifrar", { mensagem, chave });

        if (!dados.sucesso) return mostrarErro(erro, dados.erro);

        $("receita").value = dados.texto;
        $("btn-copiar").disabled = false;

        // Facilita o teste na outra aba.
        $("receitaColada").value = dados.texto;
        $("chaveDecifragem").value = chave;

        atualizarTabela();

    } catch (e) {
        console.error(e);
        mostrarErro(erro, "Erro ao gerar a receita.");
    }
}

// ============================================================
// COPIAR
// ============================================================

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

// ============================================================
// DESCRIPTOGRAFAR
// ============================================================

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
        const dados = await chamarApi("/api/decifrar", { texto, chave });

        if (!dados.sucesso) return mostrarErro(erro, dados.erro);

        $("mensagemOriginal").textContent = dados.mensagem;
        saida.classList.remove("vazio");

        atualizarTabela();

    } catch (e) {
        console.error(e);
        mostrarErro(erro, "Erro ao descriptografar: " + e.message);
    }
}

// ============================================================
// TABELA DA CHAVE
// ============================================================

let temporizador;

function chaveAtiva() {
    const id = abaAtual === "cifrar" ? "chave" : "chaveDecifragem";
    return $(id).value.trim();
}

function atualizarTabela() {
    clearTimeout(temporizador);
    temporizador = setTimeout(async () => {
        const tabela = $("tabela");
        const chave = chaveAtiva();

        tabela.innerHTML = "";
        if (!chave) return;

        try {
            const dados = await chamarApi("/api/tabela", { chave });
            if (!dados.sucesso) return;

            Object.entries(dados.tabela).forEach(([letra, ingredientes]) => {
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