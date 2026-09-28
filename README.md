# Cifra Receita

A **Cifra Receita** é um método de criptografia simples e original que transforma uma mensagem em uma receita culinária. A mensagem é codificada utilizando uma **chave secreta**, que determina a relação entre as letras do alfabeto e diferentes ingredientes.

O objetivo é fazer com que uma mensagem aparentemente comum seja apresentada no formato de uma receita, enquanto a pessoa que possui a chave consegue utilizar a mesma lógica para recuperar a mensagem original.

---

## Objetivo

O objetivo do projeto é demonstrar, de forma prática, conceitos básicos relacionados à criptografia e ao desenvolvimento de aplicações web, como:

- Utilização de uma chave secreta;
- Substituição de caracteres;
- Criação de uma tabela de correspondência;
- Criptografia de uma mensagem;
- Descriptografia de uma mensagem;
- Transformação de dados em um formato diferente;
- Desenvolvimento de uma aplicação web interativa.

---

## Como funciona a Cifra Receita

A Cifra Receita utiliza uma **chave secreta** para determinar a relação entre as letras do alfabeto e os ingredientes utilizados na receita.

A mensagem original é transformada seguindo algumas regras.

O funcionamento pode ser representado da seguinte forma:

```text
Mensagem + Chave
       ↓
Tabela de ingredientes
       ↓
Conversão das letras
       ↓
Modo de preparo
       ↓
Receita criptografada
````

Para recuperar a mensagem:

```text
Receita + Chave
       ↓
Identificação dos ingredientes
       ↓
Tabela gerada pela chave
       ↓
Conversão dos ingredientes
       ↓
Mensagem original
```

---

## Chave secreta

A chave é uma informação fundamental para o funcionamento da cifra.

Ela é utilizada para determinar a organização dos ingredientes e criar uma tabela de correspondência entre as letras e os ingredientes.

Por exemplo, uma determinada chave pode gerar uma relação como:

```text
A → chocolate
B → farinha de trigo
C → banana
D → café
...
```

Outra chave produzirá uma organização diferente.

A mesma chave sempre gera a mesma tabela, permitindo que a receita seja posteriormente descriptografada.

---

## Tabela da chave

A aplicação possui uma área que permite visualizar a tabela gerada a partir da chave.

A tabela apresenta a relação entre cada letra e os ingredientes correspondentes.

A tabela é determinada pela chave utilizada. Por isso, a chave utilizada na descriptografia deve ser a mesma utilizada durante a criptografia.

---

## Conversão das letras

Cada letra da mensagem é representada por um ingrediente.

Por exemplo, se a tabela determinar:

```text
A → chocolate
B → banana
C → farinha de trigo
```

uma mensagem contendo essas letras será transformada utilizando os ingredientes correspondentes.

Algumas letras possuem mais de uma opção de ingrediente. Quando uma dessas letras aparece novamente, a cifra pode alternar entre as opções disponíveis.

Isso ajuda a tornar a receita mais natural e menos repetitiva.

---

## Conversão das palavras

Cada palavra da mensagem original corresponde a uma etapa do **modo de preparo**.

Por exemplo:

```text
Mensagem:

OI MEU NOME
```

é dividida em:

```text
OI
MEU
NOME
```

Cada palavra será representada por uma etapa diferente da receita.

Dessa forma, além dos ingredientes, a estrutura das palavras também é preservada.

---

## Acentos

Os acentos também podem ser representados durante a transformação da mensagem.

A cifra utiliza expressões relacionadas a medidas culinárias para representar essas informações.

| Informação         | Representação    |
| ------------------ | ---------------- |
| Acento agudo       | uma pitada de    |
| Acento grave       | um toque de      |
| Acento circunflexo | uma porção de    |
| Til                | uma colherada de |
| Cedilha            | um punhado de    |

Durante a descriptografia, essas representações são utilizadas para recuperar a informação correspondente.

---

## Letras maiúsculas

As letras maiúsculas também podem ser diferenciadas.

Quando uma letra originalmente está em maiúsculo, a cifra adiciona a expressão:

```text
de primeira
```

Isso permite preservar a informação sobre a capitalização durante o processo.

---

## Números

Os números presentes na mensagem também podem ser representados utilizando instruções relacionadas ao preparo da receita.

Por exemplo:

```text
Leve ao fogo por 19 minutos.
```

ou:

```text
Bata no liquidificador por 26 segundos.
```

ou:

```text
Asse no forno por 20 minutos.
```

Dessa forma, os números podem ser incorporados ao formato da receita.

---

## Pontuação

Alguns sinais de pontuação são representados por pequenas instruções culinárias.

Exemplos:

```text
. → Mexa bem.
, → Espere um instante.
! → Reserve.
? → Prove para conferir o sabor.
; → Deixe descansar um pouco.
: → Mexa devagar.
```

Essas instruções fazem parte da receita gerada e podem ser utilizadas durante o processo de descriptografia.

---

# Exemplo de utilização

## 1. Criptografar

Na aba **Criptografar**, o usuário informa:

### Mensagem

```text
OI MEU NOME
```

### Chave

```text
minha-chave
```

Depois, basta clicar em:

```text
Gerar receita
```

A aplicação utiliza a chave para gerar a tabela de ingredientes e transforma a mensagem em uma receita.

O resultado possui a estrutura:

```text
INGREDIENTES

- ...
- ...
- ...

MODO DE PREPARO

1. ...
2. ...
3. ...

FINALIZAÇÃO

...
```

A receita gerada pode ser copiada utilizando o botão **Copiar**.

---

## 2. Descriptografar

Para recuperar a mensagem, o usuário deve acessar a aba **Descriptografar**.

É necessário informar:

* A receita gerada;
* A mesma chave utilizada durante a criptografia.

Depois, basta clicar em:

```text
Descriptografar
```

A aplicação analisa os ingredientes presentes no modo de preparo, consulta a tabela criada a partir da chave e reconstrói a mensagem original.

O resultado será:

```text
OI MEU NOME
```

---

# Estrutura do projeto

A versão publicada no GitHub Pages possui a seguinte estrutura:

```text
cifra-receita/
│
├── index.html
├── script.js
├── style.css
├── README.md
│
└── images/
    ├── inicio.png
    └── tabela-chave.png
```

### `index.html`

Responsável pela estrutura da aplicação.

Contém:

* Área de criptografia;
* Área de descriptografia;
* Campos para mensagem;
* Campos para chave;
* Área para a receita;
* Área para a mensagem original;
* Tabela da chave;
* Explicação sobre o funcionamento da cifra.

### `script.js`

Contém a lógica da Cifra Receita.

É responsável por:

* Gerar a tabela a partir da chave;
* Criptografar a mensagem;
* Converter letras em ingredientes;
* Transformar palavras em etapas;
* Representar acentos;
* Representar números;
* Representar pontuação;
* Descriptografar a receita;
* Recuperar a mensagem original.

### `style.css`

Responsável pela aparência da aplicação.

Controla:

* Layout;
* Cores;
* Botões;
* Campos de entrada;
* Cards;
* Tabelas;
* Responsividade;
* Organização visual da aplicação.

---

# Tecnologias utilizadas

O projeto utiliza:

* **HTML5** — estrutura da aplicação;
* **CSS3** — estilização da interface;
* **JavaScript** — implementação da cifra e funcionamento da aplicação;
* **GitHub Pages** — hospedagem da aplicação web.

---

# Fluxo completo da aplicação

O funcionamento completo pode ser resumido da seguinte forma:

```text
                    CRIPTOGRAFIA

              Mensagem original
                      +
                  Chave secreta
                      ↓
              Geração da tabela
                      ↓
              Conversão das letras
                      ↓
             Organização por palavras
                      ↓
               Receita criptografada
                      │
                      │
                      ▼
              ┌─────────────────┐
              │     RECEITA     │
              └─────────────────┘
                      │
                      │
                      ▼
                    Chave
                      +
                    Receita
                      ↓
              Geração da tabela
                      ↓
              Identificação dos
                 ingredientes
                      ↓
              Conversão dos dados
                      ↓
              Mensagem original
```

---

# Conclusão

A **Cifra Receita** apresenta uma forma diferente de representar uma mensagem criptografada, utilizando elementos de uma receita culinária como parte do texto codificado.

A aplicação demonstra como uma chave pode ser utilizada para criar uma tabela de correspondência e como essa mesma chave permite realizar o processo inverso para recuperar a mensagem original.

O projeto também demonstra a utilização de **HTML, CSS e JavaScript** na criação de uma aplicação web interativa e sua disponibilização através do **GitHub Pages**.


```
