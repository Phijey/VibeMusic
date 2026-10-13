// ============================================================
//  sessao.js — controle de sessão, menu dinâmico e favoritos
//  Incluído em TODAS as páginas (antes do script específico).
// ============================================================

const API_USUARIOS = "http://localhost:3000/usuarios";
const API_FAVORITOS = "http://localhost:3000/favoritos";
const CHAVE_SESSAO = "usuarioLogado";


/* ---------- Sessão (sessionStorage) ---------- */

function getUsuarioLogado() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE_SESSAO)) || null;
  } catch {
    return null;
  }
}

function salvarSessao(usuario) {
  // Nunca guardamos a senha na sessão.
  const { id, login, nome, email, admin } = usuario;
  sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ id, login, nome, email, admin }));
}

function logout() {
  sessionStorage.removeItem(CHAVE_SESSAO);
  window.location.href = "index.html";
}

function estaLogado() {
  return getUsuarioLogado() !== null;
}

function ehAdmin() {
  const u = getUsuarioLogado();
  return !!(u && u.admin);
}


/* ---------- Guardas de página ---------- */

function exigirLogin() {
  if (!estaLogado()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function exigirAdmin() {
  if (!ehAdmin()) {
    window.location.href = "index.html";
    return false;
  }
  return true;
}


/* ---------- Menu dinâmico ---------- */

function atualizarMenu() {
  const usuario = getUsuarioLogado();
  const logado = !!usuario;

  const linkFavoritos = document.getElementById("link-favoritos");
  const linkCadastro = document.getElementById("link-cadastro");
  const linkLogin = document.getElementById("link-login");
  const linkRegistro = document.getElementById("link-registro");
  const btnLogout = document.getElementById("btn-logout");
  const saudacao = document.getElementById("saudacao-usuario");

  if (linkFavoritos) linkFavoritos.hidden = !logado;
  if (linkCadastro) linkCadastro.hidden = !(logado && usuario.admin);
  if (linkLogin) linkLogin.hidden = logado;
  if (linkRegistro) linkRegistro.hidden = logado;
  if (btnLogout) btnLogout.hidden = !logado;
  if (saudacao) {
    saudacao.hidden = !logado;
    if (logado) saudacao.textContent = `Olá, ${usuario.nome.split(" ")[0]}`;
  }

  if (btnLogout) btnLogout.addEventListener("click", logout);
}


/* ---------- Favoritos (coleção separada) ---------- */

// Cache em memória: Map(itemId -> id do registro de favorito)
let _favoritosCache = new Map();

async function getFavoritos(usuarioId) {
  try {
    const r = await fetch(`${API_FAVORITOS}?usuarioId=${usuarioId}`);
    return r.ok ? await r.json() : [];
  } catch (erro) {
    console.error("Não foi possível carregar os favoritos:", erro);
    return [];
  }
}

// Carrega o cache de favoritos do usuário logado. Sem login, cache vazio.
async function carregarFavoritosCache() {
  const usuario = getUsuarioLogado();
  _favoritosCache = new Map();
  if (!usuario) return _favoritosCache;

  const lista = await getFavoritos(usuario.id);
  lista.forEach(f => _favoritosCache.set(Number(f.itemId), f.id));
  return _favoritosCache;
}

function itemEhFavorito(itemId) {
  return _favoritosCache.has(Number(itemId));
}

// Marca/desmarca um favorito. Retorna true (favoritado), false (removido)
// ou null (sem login -> redireciona para login).
async function alternarFavorito(itemId) {
  const usuario = getUsuarioLogado();
  if (!usuario) {
    window.location.href = "login.html";
    return null;
  }

  itemId = Number(itemId);

  if (_favoritosCache.has(itemId)) {
    const favId = _favoritosCache.get(itemId);
    await fetch(`${API_FAVORITOS}/${favId}`, { method: "DELETE" });
    _favoritosCache.delete(itemId);
    return false;
  } else {
    const r = await fetch(API_FAVORITOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuarioId: usuario.id, itemId })
    });
    const criado = await r.json();
    _favoritosCache.set(itemId, criado.id);
    return true;
  }
}

// HTML do botão de coração (♡ vazio / ♥ preenchido).
function botaoFavoritoHTML(itemId) {
  const ativo = itemEhFavorito(itemId);
  return `<button class="btn-favorito ${ativo ? "ativo" : ""}" data-item-id="${itemId}"
            title="${ativo ? "Remover dos favoritos" : "Adicionar aos favoritos"}"
            aria-label="Favoritar">${ativo ? "♥" : "♡"}</button>`;
}

// Handler delegado de clique no coração. As páginas chamam:
//   container.addEventListener("click", aoClicarFavorito)
// e podem definir window.aposAlterarFavorito(itemId, ativo) para reagir.
async function aoClicarFavorito(event) {
  const btn = event.target.closest(".btn-favorito");
  if (!btn) return;
  event.preventDefault();
  event.stopPropagation();

  const itemId = btn.dataset.itemId;
  const ativo = await alternarFavorito(itemId);
  if (ativo === null) return; // redirecionado para login

  btn.classList.toggle("ativo", ativo);
  btn.textContent = ativo ? "♥" : "♡";
  btn.title = ativo ? "Remover dos favoritos" : "Adicionar aos favoritos";

  if (typeof window.aposAlterarFavorito === "function") {
    window.aposAlterarFavorito(Number(itemId), ativo);
  }
}


/* ---------- Menu hambúrguer (mobile) ---------- */

function configurarMenuMobile() {
  const hamburguer = document.querySelector(".menu-hamburguer");
  const header = document.querySelector("header");
  if (!hamburguer || !header) return;

  hamburguer.addEventListener("click", () => {
    header.classList.toggle("menu-aberto");
  });

  // Fecha o menu ao clicar em qualquer link/botão de navegação.
  header
    .querySelectorAll(".nav-link, #cabecalho-direita a, #cabecalho-direita button")
    .forEach(el => el.addEventListener("click", () => header.classList.remove("menu-aberto")));
}


// Inicializa menu dinâmico + menu mobile em qualquer página.
function inicializarSessao() {
  atualizarMenu();
  configurarMenuMobile();
}

document.addEventListener("DOMContentLoaded", inicializarSessao);
