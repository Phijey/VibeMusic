// Usa API_USUARIOS de sessao.js.

function mostrarMensagem(texto, tipo) {
  const box = document.getElementById("msg-registro");
  if (!box) return;
  box.className = tipo === "erro" ? "msg-erro" : "msg-sucesso";
  box.innerHTML = texto;
}


async function loginExiste(login) {
  const resposta = await fetch(`${API_USUARIOS}?login=${encodeURIComponent(login)}`);
  if (!resposta.ok) return false;
  const usuarios = await resposta.json();
  return usuarios.length > 0;
}


async function cadastrar(evento) {
  evento.preventDefault();
  const form = evento.target;

  const login = form.login.value.trim();
  const senha = form.senha.value;
  const confirmacao = form.confirmacao.value;

  if (senha !== confirmacao) {
    mostrarMensagem("As senhas não conferem.", "erro");
    return;
  }

  try {
    if (await loginExiste(login)) {
      mostrarMensagem("Este nome de usuário já está em uso. Escolha outro.", "erro");
      return;
    }

    const novoUsuario = {
      login: login,
      nome: form.nome.value.trim(),
      email: form.email.value.trim(),
      senha: senha,
      admin: false
    };

    const resposta = await fetch(API_USUARIOS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(novoUsuario)
    });
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);

    mostrarMensagem(
      `✅ Conta criada com sucesso! <a href="login.html">Ir para o login</a>`,
      "sucesso"
    );
    form.reset();
  } catch (erro) {
    console.error("Não foi possível cadastrar o usuário:", erro);
    mostrarMensagem(`Não foi possível cadastrar. Verifique se o JSON Server está rodando em ${API_USUARIOS}.`, "erro");
  }
}


function init() {
  const form = document.getElementById("form-registro");
  if (form) form.addEventListener("submit", cadastrar);
}


document.addEventListener("DOMContentLoaded", init);
