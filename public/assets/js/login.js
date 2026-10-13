// Usa API_USUARIOS, salvarSessao e getUsuarioLogado de sessao.js.

function mostrarMensagem(texto, tipo) {
  const box = document.getElementById("msg-login");
  if (!box) return;
  box.className = tipo === "erro" ? "msg-erro" : "msg-sucesso";
  box.textContent = texto;
}


async function autenticar(evento) {
  evento.preventDefault();
  const form = evento.target;
  const login = form.login.value.trim();
  const senha = form.senha.value;

  try {
    const resposta = await fetch(`${API_USUARIOS}?login=${encodeURIComponent(login)}`);
    if (!resposta.ok) throw new Error(`Erro na requisição: ${resposta.status}`);
    const usuarios = await resposta.json();
    const usuario = usuarios.find(u => u.senha === senha);

    if (!usuario) {
      mostrarMensagem("Usuário ou senha inválidos.", "erro");
      return;
    }

    salvarSessao(usuario);
    window.location.href = "index.html";
  } catch (erro) {
    console.error("Falha no login:", erro);
    mostrarMensagem(`Não foi possível entrar. Verifique se o JSON Server está rodando em ${API_USUARIOS}.`, "erro");
  }
}


function init() {
  // Se já estiver logado, vai direto para a home.
  if (getUsuarioLogado()) {
    window.location.href = "index.html";
    return;
  }
  const form = document.getElementById("form-login");
  if (form) form.addEventListener("submit", autenticar);
}


document.addEventListener("DOMContentLoaded", init);
