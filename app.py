from flask import Flask, render_template, request, jsonify

from cifra_receita import (
    cifrar,
    gerar_mapa,
    receita_para_texto,
    descriptografar
)


app = Flask(__name__)


@app.route("/")
def index():

    return render_template(
        "index.html"
    )


@app.route(
    "/api/cifrar",
    methods=["POST"]
)
def api_cifrar():

    try:

        dados = request.get_json()

        mensagem = dados.get(
            "mensagem",
            ""
        )

        chave = dados.get(
            "chave",
            ""
        )

        receita = cifrar(
            mensagem,
            chave
        )

        texto = receita_para_texto(
            receita
        )

        return jsonify({

            "sucesso": True,

            "texto": texto

        })

    except Exception as erro:

        return jsonify({

            "sucesso": False,

            "erro": str(erro)

        }), 400


@app.route(
    "/api/decifrar",
    methods=["POST"]
)
def api_decifrar():

    try:

        dados = request.get_json()

        texto = dados.get(
            "texto",
            ""
        )

        chave = dados.get(
            "chave",
            ""
        )

        mensagem = descriptografar(
            texto,
            chave
        )

        return jsonify({

            "sucesso": True,

            "mensagem": mensagem

        })

    except Exception as erro:

        return jsonify({

            "sucesso": False,

            "erro": str(erro)

        }), 400


@app.route("/api/tabela", methods=["POST"])
def api_tabela():

    try:

        dados = request.get_json()

        mapa = gerar_mapa(dados.get("chave", ""))

        return jsonify({
            "sucesso": True,
            "tabela": mapa
        })

    except Exception as erro:

        return jsonify({
            "sucesso": False,
            "erro": str(erro)
        }), 400


if __name__ == "__main__":

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )