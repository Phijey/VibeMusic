# VibeMusic — Trabalho Prático 2

Plataforma de descoberta musical que reúne, em um único projeto, **todas as funcionalidades** das entregas anteriores **mais** a camada de usuários (login/sessão, papéis de administrador, favoritos e CRUD completo), rodando sobre um backend **JSON Server** (sem dados *hardcoded*).

Autor: **Pedro José de Magalhães Tavares Camilo** — Engenharia de Software · Turma 1 · [github.com/Phijey](https://github.com/Phijey)

---

## Funcionalidades

- **Home dinâmica** — artistas e álbuns carregados da API REST.
- **Busca em tempo real** — filtra por nome, **descrição**, categoria, artista e tags (ignora acentos/maiúsculas).
- **Carrossel de destaques** — itens marcados como `destaque`, com rotação automática (Bootstrap).
- **Página de detalhes** — layouts distintos para artista e álbum, com biografia/descrição, discografia/faixas, curiosidade e **galeria de fotos**.
- **Login e cadastro de usuários** — sessão mantida em `sessionStorage`; menu se adapta (Login ↔ Logout, Favoritos, Cadastrar).
- **Favoritos** — coração em cada item (home e detalhes); página dedicada com os favoritos do usuário logado.
- **CRUD completo de itens (apenas administradores)** — criar, **editar**, **excluir** e listar artistas/álbuns, com suporte a galeria.
- **Estatísticas** — seção na própria home com gráfico de **barras** (Chart.js) e cartões de resumo (total, artistas, álbuns, destaques, gênero top); o link "Estatísticas" rola até essa seção.
- **Seção "Sobre o Criador"** e layout **responsivo** (desktop, tablet e mobile).

---

## Tecnologias

- HTML5, CSS3 e JavaScript (vanilla, ES6+)
- [JSON Server](https://github.com/typicode/json-server) `^0.17.4` — API REST a partir de `db/db.json`
- [Bootstrap 5.3.3](https://getbootstrap.com/) (CDN) — carrossel
- [Chart.js](https://www.chartjs.org/) (CDN) — gráfico
- Google Fonts (Shrikhand)

---

## Estrutura de diretórios

```
TrabalhoPratico-02/
├── db/
│   └── db.json                 # itens, categorias, avaliacoes, usuarios, favoritos
├── public/                     # servido estaticamente pelo JSON Server
│   ├── index.html              # Home (busca + carrossel + cards + favoritos + gráfico + autor)
│   ├── detalhe.html            # Detalhes do item (com galeria e favorito)
│   ├── login.html              # Login
│   ├── registro.html           # Cadastro de novo usuário
│   ├── favoritos.html          # Favoritos do usuário logado
│   ├── cadastro.html           # CRUD de itens (admin)
│   └── assets/
│       ├── css/styles.css
│       ├── js/
│       │   ├── sessao.js        # sessão, menu dinâmico e favoritos (em todas as páginas)
│       │   ├── home.js          # cards, busca, carrossel, gráfico de barras e autor
│       │   ├── detalhe.js
│       │   ├── login.js
│       │   ├── registro.js
│       │   ├── favoritos.js
│       │   └── cadastro.js
│       └── img/                # capas + ícones (coloque avatar.jpg para a foto do autor)
├── package.json
└── README.md
```

---

## Como executar

Pré-requisito: [Node.js](https://nodejs.org/) instalado.

```bash
npm install      # instala o JSON Server
npm start        # sobe a API + arquivos estáticos em http://localhost:3000
```

Acesse **http://localhost:3000**.

---

## Usuários de teste

| Login | Senha | Papel |
|-------|-------|-------|
| `admin` | `123` | Administrador (vê o menu **Cadastrar** e acessa o CRUD) |
| `user`  | `123` | Usuário comum (favoritos, sem CRUD) |

> Novos usuários criados em **registro.html** entram como `admin: false`. Para tornar alguém administrador, edite manualmente o `db/db.json` (campo `"admin": true`).

---

## Endpoints da API

| Método | Endpoint | Uso |
|--------|----------|-----|
| GET | `/itens` / `/itens/:id` | Listar / obter item |
| POST / PUT / DELETE | `/itens` / `/itens/:id` | CRUD de itens (admin) |
| GET | `/categorias` | Gêneros (select do cadastro) |
| GET | `/usuarios?login=` | Login e checagem de duplicidade |
| POST | `/usuarios` | Cadastro de novo usuário |
| GET | `/favoritos?usuarioId=` | Favoritos do usuário |
| POST / DELETE | `/favoritos` / `/favoritos/:id` | Marcar / desmarcar favorito |

> As alterações são persistidas em `db/db.json`. A autenticação e a checagem de admin são feitas no front-end (escopo acadêmico).

---

## Foto do autor

A seção "Sobre o Criador" mostra um espaço reservado para a foto. Para exibir a sua imagem, salve-a em **`public/assets/img/avatar.jpg`** (o site usa esse caminho automaticamente).
