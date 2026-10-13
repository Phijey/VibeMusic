const API_ITENS = "http://localhost:3000/itens";

// Guarda os itens vindos do JSON Server para a busca filtrar em memória.
let itens = [];

const autor = {
  nome: "Pedro José de Magalhães Tavares Camilo",
  curso: "Engenharia de Software",
  turma: "Turma 1",
  minibio: "Estudante de Engenharia de Software, desenvolvedor do VibeMusic — uma plataforma de descoberta musical criada na disciplina de Desenvolvimento de Interfaces Web.",
  // Coloque a sua foto em assets/img/avatar.jpg para substituir o espaço reservado.
  avatar: "assets/img/avatar.jpg",
  redes: [
    { nome: "GitHub", url: "https://github.com/Phijey", rotulo: "github.com/Phijey" }
  ]
};


async function fetchItems() {
  try {
    const resposta = await fetch(API_ITENS);
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);
    return await resposta.json();
  } catch (erro) {
    console.error("Não foi possível buscar os itens:", erro);
    mostrarErro();
    return [];
  }
}


function renderCarrossel() {
  const indicadores = document.getElementById("carrossel-indicadores");
  const inner = document.getElementById("carrossel-inner");
  if (!inner) return;

  const destaques = itens.filter(item => item.destaque);

  indicadores.innerHTML = "";
  inner.innerHTML = "";

  destaques.forEach((item, index) => {
    const ativo = index === 0;

    indicadores.innerHTML += `
      <button type="button" data-bs-target="#carrossel-destaques"
              data-bs-slide-to="${index}"
              class="${ativo ? "active" : ""}"
              ${ativo ? 'aria-current="true"' : ""}
              aria-label="Slide ${index + 1}"></button>
    `;

    inner.innerHTML += `
      <div class="carousel-item ${ativo ? "active" : ""}">
        <div class="slide-destaque">
          <img src="${item.imagem}" alt="${item.nome}" class="slide-img">
          <div class="slide-texto">
            <span class="slide-tipo">${item.tipo === "artista" ? "Artista" : "Álbum"} em destaque</span>
            <h3 class="slide-nome">${item.nome}</h3>
            <p class="slide-descricao">${item.descricaoCurta}</p>
            <a class="btn-detalhes" href="detalhe.html?id=${item.id}">Ver detalhes</a>
          </div>
        </div>
      </div>
    `;
  });

  const elCarrossel = document.getElementById("carrossel-destaques");
  if (window.bootstrap && elCarrossel) {
    bootstrap.Carousel.getOrCreateInstance(elCarrossel, { interval: 5000, ride: "carousel" });
  }
}


function createCard(item) {
  const card = document.createElement("article");
  card.classList.add("card-item");

  // O coração só é exibido quando há usuário logado (reflete a sessão).
  const favorito = estaLogado() ? botaoFavoritoHTML(item.id) : "";

  card.innerHTML = `
    <div class="card-topo">${favorito}</div>
    <img src="${item.imagem}" alt="${item.nome}">
    <p class="card-nome"><strong>${item.nome}</strong></p>
    <p class="card-descricao">${item.descricaoCurta}</p>
    <p class="card-categoria">${item.categoria}</p>
    <p class="card-valor">${item.valor}</p>
    <a class="btn-detalhes" href="detalhe.html?id=${item.id}">Ver detalhes</a>
  `;

  return card;
}


function normalizar(txt) {
  return (txt ?? "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}


function itemCorresponde(item, termo) {
  if (!termo) return true;
  const alvo = normalizar([
    item.nome,
    item.descricaoCurta,
    item.categoria,
    item.artista,
    ...(item.tags || [])
  ].join(" "));
  return alvo.includes(termo);
}


function renderCards(filtro = "") {
  const containerArtistas = document.getElementById("lista-artistas");
  const containerAlbuns = document.getElementById("lista-albuns");
  if (!containerArtistas || !containerAlbuns) return;

  const termo = normalizar(filtro).trim();
  const filtrados = itens.filter(item => itemCorresponde(item, termo));

  containerArtistas.innerHTML = "";
  containerAlbuns.innerHTML = "";

  let qtdArtistas = 0;
  let qtdAlbuns = 0;

  filtrados.forEach(item => {
    const card = createCard(item);
    if (item.tipo === "artista") {
      containerArtistas.appendChild(card);
      qtdArtistas++;
    } else if (item.tipo === "album") {
      containerAlbuns.appendChild(card);
      qtdAlbuns++;
    }
  });

  if (qtdArtistas === 0) {
    containerArtistas.innerHTML = `<p class="busca-vazia">Nenhum artista encontrado.</p>`;
  }
  if (qtdAlbuns === 0) {
    containerAlbuns.innerHTML = `<p class="busca-vazia">Nenhum álbum encontrado.</p>`;
  }
}


function renderAutor() {
  const container = document.getElementById("autor");
  if (!container) return;

  const redes = autor.redes
    .map(r => `<a class="autor-rede" href="${r.url}" target="_blank" rel="noopener">${r.nome}: ${r.rotulo}</a>`)
    .join("");

  container.innerHTML = `
    <h1>Sobre o Criador</h1>
    <div class="autor-card">
      <img class="autor-foto" src="${autor.avatar}" alt="Foto de ${autor.nome}"
           onerror="this.classList.add('autor-foto-vazia'); this.removeAttribute('src');">
      <div class="autor-info">
        <h2 class="autor-nome">${autor.nome}</h2>
        <p class="autor-curso">${autor.curso} · ${autor.turma}</p>
        <p class="autor-descricao">${autor.minibio}</p>
        <div class="autor-redes">${redes}</div>
      </div>
    </div>
  `;
}


function mostrarErro() {
  const containerArtistas = document.getElementById("lista-artistas");
  if (containerArtistas) {
    containerArtistas.innerHTML =
      `<p class="erro">Não foi possível carregar os dados. Verifique se o JSON Server está rodando em ${API_ITENS}.</p>`;
  }
}


/* ---------- Seção de Estatísticas (visualização avançada) ---------- */

// Agrupa por gênero separando a contagem de artistas e de álbuns.
function agruparPorGeneroTipo(lista) {
  const mapa = {};
  lista.forEach(item => {
    if (!mapa[item.categoria]) mapa[item.categoria] = { artistas: 0, albuns: 0 };
    if (item.tipo === "artista") mapa[item.categoria].artistas++;
    else if (item.tipo === "album") mapa[item.categoria].albuns++;
  });
  return mapa;
}


function renderResumo(lista) {
  const container = document.getElementById("estatisticas-resumo");
  if (!container) return;

  const total = lista.length;
  const qtdArtistas = lista.filter(i => i.tipo === "artista").length;
  const qtdAlbuns = lista.filter(i => i.tipo === "album").length;
  const destaques = lista.filter(i => i.destaque).length;

  const agrupado = agruparPorGeneroTipo(lista);
  let generoTop = "—";
  let maiorContagem = -1;
  Object.keys(agrupado).forEach(genero => {
    const qtd = agrupado[genero].artistas + agrupado[genero].albuns;
    if (qtd > maiorContagem) {
      maiorContagem = qtd;
      generoTop = genero;
    }
  });

  const cartoes = [
    { numero: total, rotulo: "Itens no total" },
    { numero: qtdArtistas, rotulo: "Artistas" },
    { numero: qtdAlbuns, rotulo: "Álbuns" },
    { numero: destaques, rotulo: "Destaques" },
    { numero: generoTop, rotulo: "Gênero com mais itens", texto: true }
  ];

  container.innerHTML = cartoes.map(c => `
    <div class="resumo-card">
      <span class="resumo-numero ${c.texto ? "resumo-texto" : ""}">${c.numero}</span>
      <span class="resumo-rotulo">${c.rotulo}</span>
    </div>
  `).join("");
}


function renderGrafico(lista) {
  const canvas = document.getElementById("grafico-generos");
  if (!canvas || !window.Chart) return;

  const agrupado = agruparPorGeneroTipo(lista);
  const labels = Object.keys(agrupado);
  const dadosArtistas = labels.map(g => agrupado[g].artistas);
  const dadosAlbuns = labels.map(g => agrupado[g].albuns);

  new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Artistas",
          data: dadosArtistas,
          backgroundColor: "#2980B9",
          borderColor: "#1c5d86",
          borderWidth: 1
        },
        {
          label: "Álbuns",
          data: dadosAlbuns,
          backgroundColor: "#E67E22",
          borderColor: "#b35e10",
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: "#5a3210", font: { size: 13 } },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { color: "#5a3210", stepSize: 1, precision: 0 },
          grid: { color: "rgba(139,69,19,0.12)" }
        }
      },
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#5a3210", font: { size: 14 } }
        },
        title: {
          display: true,
          text: "Artistas e álbuns por gênero",
          color: "#8B4513",
          font: { size: 18, weight: "bold" }
        }
      }
    }
  });
}


// Trata os atalhos vindos do menu:
//  #autor  -> rola até a seção "Sobre o Criador"
//  #buscar -> foca a caixa de busca, pronta para digitar
function tratarHash() {
  const hash = window.location.hash;
  if (hash === "#autor") {
    const autorEl = document.getElementById("autor");
    if (autorEl) autorEl.scrollIntoView({ behavior: "smooth" });
  } else if (hash === "#estatisticas") {
    const estatEl = document.getElementById("estatisticas");
    if (estatEl) estatEl.scrollIntoView({ behavior: "smooth" });
  } else if (hash === "#buscar") {
    const campo = document.getElementById("campo-busca");
    if (campo) {
      campo.scrollIntoView({ behavior: "smooth", block: "center" });
      campo.focus();
    }
  }
}


async function init() {
  itens = await fetchItems();
  await carregarFavoritosCache();

  renderCarrossel();
  renderCards();
  renderResumo(itens);
  renderGrafico(itens);
  renderAutor();

  const campoBusca = document.getElementById("campo-busca");
  if (campoBusca) {
    campoBusca.addEventListener("input", e => renderCards(e.target.value));
  }

  // Delegação de clique nos corações dos cards.
  ["lista-artistas", "lista-albuns"].forEach(id => {
    const c = document.getElementById(id);
    if (c) c.addEventListener("click", aoClicarFavorito);
  });

  // Atalhos do menu (Sobre Nós / Explorar), inclusive ao clicar já estando na Home.
  tratarHash();
  window.addEventListener("hashchange", tratarHash);
}


document.addEventListener("DOMContentLoaded", init);
