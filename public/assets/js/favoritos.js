// Usa API_ITENS? Definido localmente; e helpers de sessao.js
// (exigirLogin, carregarFavoritosCache, itemEhFavorito, botaoFavoritoHTML, aoClicarFavorito).

const API_ITENS_FAV = "http://localhost:3000/itens";


function createCardFavorito(item) {
  const card = document.createElement("article");
  card.classList.add("card-item");
  card.dataset.itemId = item.id;

  card.innerHTML = `
    <div class="card-topo">${botaoFavoritoHTML(item.id)}</div>
    <img src="${item.imagem}" alt="${item.nome}">
    <p class="card-nome"><strong>${item.nome}</strong></p>
    <p class="card-descricao">${item.descricaoCurta}</p>
    <p class="card-categoria">${item.categoria}</p>
    <p class="card-valor">${item.valor}</p>
    <a class="btn-detalhes" href="detalhe.html?id=${item.id}">Ver detalhes</a>
  `;

  return card;
}


function mostrarVazio() {
  const container = document.getElementById("lista-favoritos");
  if (container) {
    container.innerHTML = `<p class="busca-vazia">Você ainda não marcou nenhum favorito. Explore a <a href="index.html">Home</a> e clique no coração dos itens.</p>`;
  }
}


function renderFavoritos(itens) {
  const container = document.getElementById("lista-favoritos");
  if (!container) return;

  const favoritos = itens.filter(item => itemEhFavorito(item.id));

  if (!favoritos.length) {
    mostrarVazio();
    return;
  }

  container.innerHTML = "";
  favoritos.forEach(item => container.appendChild(createCardFavorito(item)));
}


// Quando um favorito é removido nesta página, tira o card da lista.
window.aposAlterarFavorito = function (itemId, ativo) {
  if (ativo) return;
  const container = document.getElementById("lista-favoritos");
  const card = container && container.querySelector(`[data-item-id="${itemId}"]`);
  if (card) card.remove();
  if (container && !container.querySelector(".card-item")) mostrarVazio();
};


async function init() {
  if (!exigirLogin()) return;

  await carregarFavoritosCache();

  let itens = [];
  try {
    const r = await fetch(API_ITENS_FAV);
    if (!r.ok) throw new Error(`Erro na requisição: ${r.status}`);
    itens = await r.json();
  } catch (erro) {
    console.error("Não foi possível carregar os itens:", erro);
    const container = document.getElementById("lista-favoritos");
    if (container) {
      container.innerHTML = `<p class="erro">Não foi possível carregar os dados. Verifique se o JSON Server está rodando em ${API_ITENS_FAV}.</p>`;
    }
    return;
  }

  renderFavoritos(itens);

  const container = document.getElementById("lista-favoritos");
  if (container) container.addEventListener("click", aoClicarFavorito);
}


document.addEventListener("DOMContentLoaded", init);
