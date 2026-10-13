const API_ITENS = "http://localhost:3000/itens";
const API_CATEGORIAS = "http://localhost:3000/categorias";
const API_FAVORITOS_CRUD = "http://localhost:3000/favoritos";


/* ---------- Helpers de conversão ---------- */

function paraArray(str) {
  return str ? str.split(",").map(s => s.trim()).filter(Boolean) : [];
}

// Texto (uma foto por linha "caminho ; titulo") -> [{ imagem, titulo }]
function paraGaleria(str) {
  if (!str) return [];
  return str
    .split("\n")
    .map(linha => linha.trim())
    .filter(Boolean)
    .map(linha => {
      const [imagem, titulo] = linha.split(";").map(p => (p || "").trim());
      return { imagem, titulo: titulo || imagem };
    })
    .filter(foto => foto.imagem);
}

// [{ imagem, titulo }] -> texto (uma foto por linha "caminho ; titulo")
function galeriaParaTexto(galeria = []) {
  return (galeria || []).map(f => `${f.imagem} ; ${f.titulo}`).join("\n");
}


function mostrarMensagem(texto, tipo) {
  const box = document.getElementById("msg-cadastro");
  if (!box) return;
  box.className = tipo === "erro" ? "msg-erro" : "msg-sucesso";
  box.innerHTML = texto;
}


/* ---------- Categorias e campos dinâmicos ---------- */

async function carregarCategorias() {
  const select = document.getElementById("categoria");
  if (!select) return;
  try {
    const resposta = await fetch(API_CATEGORIAS);
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);
    const categorias = await resposta.json();
    categorias.forEach(cat => {
      const opt = document.createElement("option");
      opt.value = cat.nome;
      opt.textContent = cat.nome;
      select.appendChild(opt);
    });
  } catch (erro) {
    console.error("Não foi possível carregar as categorias:", erro);
  }
}

function alternarCampos() {
  const tipo = document.getElementById("tipo").value;
  const camposArtista = document.querySelector(".campos-artista");
  const camposAlbum = document.querySelector(".campos-album");

  const ehArtista = tipo === "artista";
  camposArtista.hidden = !ehArtista;
  camposAlbum.hidden = ehArtista;
}


/* ---------- Listagem (Read) ---------- */

async function carregarItens() {
  const container = document.getElementById("lista-itens-crud");
  if (!container) return;
  try {
    const resposta = await fetch(API_ITENS);
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);
    const itens = await resposta.json();
    renderListaCrud(itens);
  } catch (erro) {
    console.error("Não foi possível listar os itens:", erro);
    container.innerHTML = `<p class="erro">Não foi possível carregar os itens. Verifique se o JSON Server está rodando em ${API_ITENS}.</p>`;
  }
}

function renderListaCrud(itens) {
  const container = document.getElementById("lista-itens-crud");
  if (!container) return;

  if (!itens.length) {
    container.innerHTML = `<p class="busca-vazia">Nenhum item cadastrado ainda.</p>`;
    return;
  }

  container.innerHTML = itens.map(item => `
    <div class="crud-item">
      <img class="crud-thumb" src="${item.imagem}" alt="${item.nome}"
           onerror="this.style.visibility='hidden'">
      <div class="crud-info">
        <strong>${item.nome}</strong>
        <span>${item.tipo === "artista" ? "Artista" : "Álbum"} · ${item.categoria}</span>
      </div>
      <div class="crud-acoes">
        <button class="btn-editar" data-id="${item.id}">Editar</button>
        <button class="btn-excluir" data-id="${item.id}">Excluir</button>
      </div>
    </div>
  `).join("");
}


/* ---------- Edição (Update) ---------- */

function entrarModoEdicao() {
  document.getElementById("cadastro-titulo").textContent = "Editar item";
  document.getElementById("btn-submit").textContent = "Salvar alterações";
  document.getElementById("btn-cancelar").hidden = false;
}

function sairModoEdicao() {
  const form = document.getElementById("form-cadastro");
  form.reset();
  document.getElementById("item-id").value = "";
  document.getElementById("cadastro-titulo").textContent = "Cadastrar item";
  document.getElementById("btn-submit").textContent = "Cadastrar";
  document.getElementById("btn-cancelar").hidden = true;
  alternarCampos();
}

function preencherFormulario(item) {
  const form = document.getElementById("form-cadastro");
  form["item-id"].value = item.id;
  form.tipo.value = item.tipo;
  form.nome.value = item.nome || "";
  form.categoria.value = item.categoria || "";
  form.descricaoCurta.value = item.descricaoCurta || "";
  form.descricaoCompleta.value = item.descricaoCompleta || "";
  form.imagem.value = item.imagem || "";
  form.valor.value = item.valor || "";
  form.tags.value = (item.tags || []).join(", ");
  form.curiosidades.value = item.curiosidades || "";
  form.destaque.checked = !!item.destaque;
  form.galeria.value = galeriaParaTexto(item.galeria);

  if (item.tipo === "artista") {
    form.seguidores.value = item.seguidores || "";
    form.pais.value = item.pais || "";
    form.albuns.value = (item.albuns || []).join(", ");
  } else {
    form.artista.value = item.artista || "";
    form.ano.value = item.ano || "";
    form.gravadora.value = item.gravadora || "";
    form.faixas.value = (item.faixas || []).join(", ");
  }

  alternarCampos();
  entrarModoEdicao();
  document.getElementById("cadastro").scrollIntoView({ behavior: "smooth" });
}

async function editarItem(id) {
  try {
    const resposta = await fetch(`${API_ITENS}/${id}`);
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);
    const item = await resposta.json();
    preencherFormulario(item);
  } catch (erro) {
    console.error("Não foi possível carregar o item para edição:", erro);
    mostrarMensagem("Não foi possível carregar o item para edição.", "erro");
  }
}


/* ---------- Exclusão (Delete) ---------- */

async function limparFavoritosDoItem(itemId) {
  try {
    const r = await fetch(`${API_FAVORITOS_CRUD}?itemId=${itemId}`);
    if (!r.ok) return;
    const favs = await r.json();
    await Promise.all(favs.map(f =>
      fetch(`${API_FAVORITOS_CRUD}/${f.id}`, { method: "DELETE" })
    ));
  } catch (erro) {
    console.warn("Não foi possível limpar favoritos do item removido:", erro);
  }
}

async function excluirItem(id) {
  if (!confirm("Tem certeza que deseja excluir este item?")) return;
  try {
    const resposta = await fetch(`${API_ITENS}/${id}`, { method: "DELETE" });
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);
    await limparFavoritosDoItem(id);

    // Se estava editando justamente esse item, sai do modo edição.
    if (document.getElementById("item-id").value == id) sairModoEdicao();

    mostrarMensagem("🗑️ Item excluído com sucesso.", "sucesso");
    carregarItens();
  } catch (erro) {
    console.error("Não foi possível excluir o item:", erro);
    mostrarMensagem("Não foi possível excluir o item.", "erro");
  }
}


/* ---------- Criação / Atualização (Create / Update) ---------- */

async function enviar(evento) {
  evento.preventDefault();
  const form = evento.target;
  const tipo = form.tipo.value;
  const id = form["item-id"].value;

  const item = {
    tipo: tipo,
    nome: form.nome.value,
    categoria: form.categoria.value,
    descricaoCurta: form.descricaoCurta.value,
    descricaoCompleta: form.descricaoCompleta.value,
    imagem: form.imagem.value || "assets/img/icone1.jpg",
    valor: form.valor.value,
    tags: paraArray(form.tags.value),
    destaque: form.destaque.checked,
    curiosidades: form.curiosidades.value,
    galeria: paraGaleria(form.galeria.value)
  };

  if (tipo === "artista") {
    item.seguidores = form.seguidores.value;
    item.pais = form.pais.value;
    item.albuns = paraArray(form.albuns.value);
  } else {
    item.artista = form.artista.value;
    item.ano = form.ano.value;
    item.gravadora = form.gravadora.value;
    item.faixas = paraArray(form.faixas.value);
  }

  const editando = !!id;
  const url = editando ? `${API_ITENS}/${id}` : API_ITENS;
  const metodo = editando ? "PUT" : "POST";

  try {
    const resposta = await fetch(url, {
      method: metodo,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);
    const salvo = await resposta.json();

    if (editando) {
      mostrarMensagem(
        `✅ "${salvo.nome}" atualizado com sucesso! ` +
        `<a href="detalhe.html?id=${salvo.id}">Ver detalhes</a>`,
        "sucesso"
      );
      sairModoEdicao();
    } else {
      mostrarMensagem(
        `✅ "${salvo.nome}" cadastrado com sucesso! ` +
        `<a href="detalhe.html?id=${salvo.id}">Ver detalhes</a> · ` +
        `<a href="index.html">Ver na Home</a> · ` +
        `<a href="index.html#estatisticas">Ver no gráfico</a>`,
        "sucesso"
      );
      form.reset();
      alternarCampos();
    }
    carregarItens();
  } catch (erro) {
    console.error("Não foi possível salvar o item:", erro);
    mostrarMensagem(
      `❌ Não foi possível salvar. Verifique se o JSON Server está rodando em ${API_ITENS}.`,
      "erro"
    );
  }
}


/* ---------- Inicialização ---------- */

function init() {
  // Apenas administradores acessam o CRUD.
  if (!exigirAdmin()) return;

  carregarCategorias();
  carregarItens();

  const selectTipo = document.getElementById("tipo");
  if (selectTipo) selectTipo.addEventListener("change", alternarCampos);
  alternarCampos();

  const form = document.getElementById("form-cadastro");
  if (form) form.addEventListener("submit", enviar);

  const btnCancelar = document.getElementById("btn-cancelar");
  if (btnCancelar) btnCancelar.addEventListener("click", sairModoEdicao);

  // Delegação dos botões Editar/Excluir da lista.
  const lista = document.getElementById("lista-itens-crud");
  if (lista) {
    lista.addEventListener("click", e => {
      const editar = e.target.closest(".btn-editar");
      const excluir = e.target.closest(".btn-excluir");
      if (editar) editarItem(editar.dataset.id);
      else if (excluir) excluirItem(excluir.dataset.id);
    });
  }
}


document.addEventListener("DOMContentLoaded", init);
