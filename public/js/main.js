
// Carregar depoimentos existentes
function loadTestimonials() {
  const list = document.getElementById("testimonial-list");
  const data = JSON.parse(localStorage.getItem("depoimentos")) || [];

  list.innerHTML = "";

  data.forEach(dep => {
    const card = `
      <div class="testimonial-card">
        <h3>${dep.nome}</h3>
        ${dep.profissao ? `<div class="job">${dep.profissao}</div>` : ""}
        <p>${dep.mensagem}</p>
      </div>
    `;
    list.innerHTML += card;
  });
}

loadTestimonials();

// Submissão do formulário
document.getElementById("testimonial-form").addEventListener("submit", function(e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value;
  const profissao = document.getElementById("profissao").value;
  const mensagem = document.getElementById("mensagem").value;

  const novoDepoimento = { nome, profissao, mensagem };

  const depoimentos = JSON.parse(localStorage.getItem("depoimentos")) || [];
  depoimentos.push(novoDepoimento);

  localStorage.setItem("depoimentos", JSON.stringify(depoimentos));

  this.reset();
  loadTestimonials();
});


