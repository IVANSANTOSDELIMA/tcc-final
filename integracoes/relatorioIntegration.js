document.addEventListener("DOMContentLoaded", async function () {
  const baseUrl = "http://localhost:3000";
  const token = localStorage.getItem("token");
  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const funcionario = JSON.parse(localStorage.getItem("funcionario"));
  const imgElement = document.querySelector("#imageUser img");

  if (funcionario && funcionario.imagem_funcionario) {
    imgElement.src = `${baseUrl}/${funcionario.imagem_funcionario}`;
  } // Se a imagem do funcionário estiver disponível, atualiza o src da imagem
  else {
    imgElement.src = "https://placecats.com/neo_banana/300/200"; // Define uma imagem padrão caso não haja imagem
  }

  // checagem de token
  if (!token) {
    alert("Sua sessão expirou. Por favor, faça login novamente.");
    window.location.href = "telalogin.html";
    return;
  }

  // botões do acordeão
  const accDia = document.getElementById("acc-dia");
  const accSemana = document.getElementById("acc-semana");
  const accMes = document.getElementById("acc-mes");
  const accAno = document.getElementById("acc-a");

  // containers de conteúdo
  const containerDia = accDia.nextElementSibling; // Pegando a div que tem depois do button referente
  const containerSemana = accSemana.nextElementSibling; // Pegando a div que tem depois do button referente
  const containerMes = accMes.nextElementSibling; // Pegando a div que tem depois do button referente
  const containerAno = accAno.nextElementSibling; // Pegando a div que tem depois do button referente

  // busca de movimentações do dia
  async function carregarMovimentacoesDiarias() {
    try {
      const hoje = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `${baseUrl}/api/estoque/movimentacao?dataInicio=${hoje}&dataFim=${hoje}`,
        {
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar movimentações: ${response.status}`);
      }

      const movimentacoes = await response.json();
      console.log("dia: ", movimentacoes);
      preencherConteudoDia(movimentacoes);
    } catch (error) {
      console.error("Erro ao carregar movimentações diárias:", error);
      containerDia.innerHTML = "<p>Erro ao carregar movimentações</p>";

      if (error.message.includes("401")) {
        alert("Sua sessão expirou. Por favor, faça login novamente.");
        window.location.href = "telalogin.html";
      }
    }
  }

  // busca de movimentações da semana
  async function carregarMovimentacoesSemanais() {
    try {
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - 6); // Últimos 7 dias (incluindo hoje)

      const response = await fetch(
        `${baseUrl}/api/estoque/movimentacao?dataInicio=${
          inicioSemana.toISOString().split("T")[0]
        }&dataFim=${hoje.toISOString().split("T")[0]}`,
        {
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar movimentações: ${response.status}`);
      }

      const movimentacoes = await response.json();
      console.log("semana: ", movimentacoes);
      preencherConteudoSemana(movimentacoes);
    } catch (error) {
      console.error("Erro ao carregar movimentações semanais:", error);
      containerSemana.innerHTML = "<p>Erro ao carregar movimentações</p>";
    }
  }

  // busca de movimentações do mês
  async function carregarMovimentacoesMensais() {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1); // dia 1 do mês

      const response = await fetch(
        `${baseUrl}/api/estoque/movimentacao?dataInicio=${
          inicioMes.toISOString().split("T")[0]
        }&dataFim=${hoje.toISOString().split("T")[0]}`,
        {
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar movimentações: ${response.status}`);
      }

      const movimentacoes = await response.json();
      console.log("mes: ", movimentacoes);
      preencherConteudoMes(movimentacoes);
    } catch (error) {
      console.error("Erro ao carregar movimentações mensais:", error);
      containerMes.innerHTML = "<p>Erro ao carregar movimentações</p>";
    }
  }

  // busca de movimentações do ano
  async function carregarMovimentacoesAnuais() {
    try {
      const hoje = new Date();
      const inicioAno = new Date(hoje.getFullYear(), 0, 1); // dia 1 do ano

      const response = await fetch(
        `${baseUrl}/api/estoque/movimentacao?dataInicio=${
          inicioAno.toISOString().split("T")[0]
        }&dataFim=${hoje.toISOString().split("T")[0]}`,
        {
          headers: headers,
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao carregar movimentações: ${response.status}`);
      }

      const movimentacoes = await response.json();
      console.log("ano: ", movimentacoes);
      preencherConteudoAno(movimentacoes);
    } catch (error) {
      console.error("Erro ao carregar movimentações anuais:", error);
      containerAno.innerHTML = "<p>Erro ao carregar movimentações</p>";
    }
  }

  // Funções para preencher os conteúdos
  function preencherConteudoDia(movimentacoes) {
    if (!movimentacoes || movimentacoes.length === 0) {
      containerDia.innerHTML = "<p>Nenhuma movimentação encontrada</p>";
      return;
    }

    // html da tabela
    let html = `
            <h3>Detalhes das Movimentações</h3>
            <div class="tabela-container">
                <table class="tabela-movimentacoes">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Produto</th>
                            <th>Tipo</th>
                            <th>Quantidade</th>
                            <th>Valor Total</th>
                            <th>Participante</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    // linhas da tabela
    for (let i = 0; i < movimentacoes.length; i++) {
      const m = movimentacoes[i];
      const data = new Date(m.data).toLocaleDateString("pt-BR");
      const tipo = m.id_tipo_movimentacao === "E" ? "Entrada" : "Saída";
      const valor = formatarMoeda(m.preco_total || 0);

      html += `
                <tr>
                    <td>${data}</td>
                    <td>${m.nome_produto || "N/A"}</td>
                    <td>${tipo}</td>
                    <td>${m.quantidade || 0}</td>
                    <td>${valor}</td>
                    <td>${m.nome_participante || "N/A"}</td>
                </tr>
            `;
    }

    html += `
                    </tbody>
                </table>
            </div>
        `;

    containerDia.innerHTML = html;
  }

  function preencherConteudoSemana(movimentacoes) {
    if (!movimentacoes || movimentacoes.length === 0) {
      containerSemana.innerHTML = "<p>Nenhuma movimentação encontrada</p>";
      return;
    }

    // html da tabela
    let html = `
            <h3>Detalhes das Movimentações</h3>
            <div class="tabela-container">
                <table class="tabela-movimentacoes">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Produto</th>
                            <th>Tipo</th>
                            <th>Quantidade</th>
                            <th>Valor Total</th>
                            <th>Participante</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    // linhas da tabela
    for (let i = 0; i < movimentacoes.length; i++) {
      const m = movimentacoes[i];
      const data = new Date(m.data).toLocaleDateString("pt-BR");
      const tipo = m.id_tipo_movimentacao === "E" ? "Entrada" : "Saída";
      const valor = formatarMoeda(m.preco_total || 0);

      html += `
                <tr>
                    <td>${data}</td>
                    <td>${m.nome_produto || "N/A"}</td>
                    <td>${tipo}</td>
                    <td>${m.quantidade || 0}</td>
                    <td>${valor}</td>
                    <td>${m.nome_participante || "N/A"}</td>
                </tr>
            `;
    }

    html += `
                    </tbody>
                </table>
            </div>
        `;

    containerSemana.innerHTML = html;
  }

  function preencherConteudoMes(movimentacoes) {
    if (!movimentacoes || movimentacoes.length === 0) {
      containerMes.innerHTML = "<p>Nenhuma movimentação encontrada</p>";
      return;
    }

    // html da tabela
    let html = `
            <h3>Detalhes das Movimentações</h3>
            <div class="tabela-container">
                <table class="tabela-movimentacoes">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Produto</th>
                            <th>Tipo</th>
                            <th>Quantidade</th>
                            <th>Valor Total</th>
                            <th>Participante</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    // linhas da tabela
    for (let i = 0; i < movimentacoes.length; i++) {
      const m = movimentacoes[i];
      const data = new Date(m.data).toLocaleDateString("pt-BR");
      const tipo = m.id_tipo_movimentacao === "E" ? "Entrada" : "Saída";
      const valor = formatarMoeda(m.preco_total || 0);

      html += `
                <tr>
                    <td>${data}</td>
                    <td>${m.nome_produto || "N/A"}</td>
                    <td>${tipo}</td>
                    <td>${m.quantidade || 0}</td>
                    <td>${valor}</td>
                    <td>${m.nome_participante || "N/A"}</td>
                </tr>
            `;
    }

    html += `
                    </tbody>
                </table>
            </div>
        `;

    containerMes.innerHTML = html;
  }

  function preencherConteudoAno(movimentacoes) {
    if (!movimentacoes || movimentacoes.length === 0) {
      containerAno.innerHTML = "<p>Nenhuma movimentação encontrada</p>";
      return;
    }

    // html da tabela
    let html = `
            <h3>Detalhes das Movimentações</h3>
            <div class="tabela-container">
                <table class="tabela-movimentacoes">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Produto</th>
                            <th>Tipo</th>
                            <th>Quantidade</th>
                            <th>Valor Total</th>
                            <th>Participante</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

    // linhas da tabela
    for (let i = 0; i < movimentacoes.length; i++) {
      const m = movimentacoes[i];
      const data = new Date(m.data).toLocaleDateString("pt-BR");
      const tipo = m.id_tipo_movimentacao === "E" ? "Entrada" : "Saída";
      const valor = formatarMoeda(m.preco_total || 0);

      html += `
                <tr>
                    <td>${data}</td>
                    <td>${m.nome_produto || "N/A"}</td>
                    <td>${tipo}</td>
                    <td>${m.quantidade || 0}</td>
                    <td>${valor}</td>
                    <td>${m.nome_participante || "N/A"}</td>
                </tr>
            `;
    }

    html += `
                    </tbody>
                </table>
            </div>
        `;

    containerAno.innerHTML = html;
  }

  // Função pra formatar valores monetários
  function formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  // carrega os dados iniciais
  carregarMovimentacoesDiarias();
  carregarMovimentacoesSemanais();
  carregarMovimentacoesMensais();
  carregarMovimentacoesAnuais();

  // botão de logout
  document.querySelector("#sairLogin").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("funcionario");
    window.location.href = "telalogin.html";
  });
});