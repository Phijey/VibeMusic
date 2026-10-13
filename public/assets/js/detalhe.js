const API_BASE = "http://localhost:3000/itens";


function getId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}


function mostrarMensagem(texto) {
  const container = document.getElementById("conteudo-detalhes");
  if (container) {
    container.innerHTML = `<p class="mensagem-detalhe">${texto}</p>`;
  }
}


async function fetchItem(id) {
  const resposta = await fetch(`${API_BASE}/${id}`);
  if (!resposta.ok) {
    throw new Error("Item não encontrado");
  }
  return await resposta.json();
}


function renderTags(tags = []) {
  return tags.map(tag => `<span class="chip">${tag}</span>`).join("");
}


function renderGaleria(galeria = []) {
  if (!galeria || !galeria.length) return "";

  const fotos = galeria.map(foto => `
    <figure class="galeria-item">
      <img src="${foto.imagem}" alt="${foto.titulo}">
      <figcaption class="galeria-titulo">${foto.titulo}</figcaption>
    </figure>
  `).join("");

  return `
    <div class="detalhe-galeria">
      <h2>Fotos Vinculadas</h2>
      <div class="galeria-grid">${fotos}</div>
    </div>
  `;
}


function renderDetalhes(item) {
  const container = document.getElementById("conteudo-detalhes");
  if (!container) return;

  // Coração de favorito (apenas para usuário logado).
  const favorito = estaLogado()
    ? `<div class="detalhe-favorito">${botaoFavoritoHTML(item.id)}</div>`
    : "";

  if (item.tipo === "artista") {
    container.innerHTML = `
      <div class="detalhe-hero">
        <img src="${item.imagem}" alt="${item.nome}" class="detalhe-img-artista">
        <div class="detalhe-info">
          <span class="detalhe-tipo">Artista</span>
          ${favorito}
          <h1 class="detalhe-nome">${item.nome}</h1>
          <p class="detalhe-genero">${item.categoria} · ${item.pais}</p>
          <div class="detalhe-stats">
            <div class="stat"><span>${item.seguidores}</span><label>Seguidores</label></div>
            <div class="stat"><span>${item.valor}</span><label>Ouvintes Mensais</label></div>
          </div>
          <p class="detalhe-descricao">${item.descricaoCurta}</p>
          <div class="detalhe-tags">${renderTags(item.tags)}</div>
        </div>
      </div>
      <div class="detalhe-corpo">
        <div class="detalhe-bio">
          <h2>Biografia</h2>
          <p>${item.descricaoCompleta}</p>
        </div>
        <div class="detalhe-extra">
          <div class="detalhe-albuns">
            <h2>Discografia</h2>
            <ul>
              ${(item.albuns || []).map(a => `<li>🎵 ${a}</li>`).join("")}
            </ul>
          </div>
          <div class="detalhe-curiosidade">
            <h2>Curiosidade</h2>
            <p>💡 ${item.curiosidades}</p>
          </div>
        </div>
      </div>
      ${renderGaleria(item.galeria)}
    `;
  } else if (item.tipo === "album") {
    container.innerHTML = `
      <div class="detalhe-hero">
        <img src="${item.imagem}" alt="${item.nome}" class="detalhe-img-album">
        <div class="detalhe-info">
          <span class="detalhe-tipo">Álbum</span>
          ${favorito}
          <h1 class="detalhe-nome">${item.nome}</h1>
          <p class="detalhe-genero">${item.artista} · ${item.ano} · ${item.categoria}</p>
          <div class="detalhe-stats">
            <div class="stat"><span>${item.valor}</span><label>Ouvintes</label></div>
            <div class="stat"><span>${(item.faixas || []).length}</span><label>Faixas</label></div>
          </div>
          <p class="detalhe-descricao">${item.descricaoCurta}</p>
          <p class="detalhe-gravadora">Gravadora: <strong>${item.gravadora}</strong></p>
          <div class="detalhe-tags">${renderTags(item.tags)}</div>
        </div>
      </div>
      <div class="detalhe-corpo">
        <div class="detalhe-bio">
          <h2>Sobre o Álbum</h2>
          <p>${item.descricaoCompleta}</p>
        </div>
        <div class="detalhe-extra">
          <div class="detalhe-albuns">
            <h2>Faixas</h2>
            <ol>
              ${(item.faixas || []).map(f => `<li>🎵 ${f}</li>`).join("")}
            </ol>
          </div>
          <div class="detalhe-curiosidade">
            <h2>Curiosidade</h2>
            <p>💡 ${item.curiosidades}</p>
          </div>
        </div>
      </div>
      ${renderGaleria(item.galeria)}
    `;
  }

  // Liga o clique do coração.
  container.addEventListener("click", aoClicarFavorito);
}


async function init() {
  const id = getId();

  if (!id) {
    mostrarMensagem("Nenhum item informado na URL. Volte para a Home e escolha um item.");
    return;
  }

  try {
    const item = await fetchItem(id);
    await carregarFavoritosCache();
    renderDetalhes(item);
  } catch (erro) {
    console.error(erro);
    mostrarMensagem("Item não encontrado. Verifique o link ou volte para a Home.");
  }
}

document.addEventListener("DOMContentLoaded", init);
