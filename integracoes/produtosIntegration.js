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

  let produtosGlobal = [];

  // Filtro por nome do produto
  const inputNome = document.querySelector("#filtro-nome-produto");
  inputNome.addEventListener("input", async () => {
    const response = await fetch(
      `${baseUrl}/api/estoque/produtos?nome=${inputNome.value}`,
      {
        headers: headers,
      }
    );
    const produtos = await response.json();
    preencherTabela(produtos);
  });

  // Filtro por categoria
  async function preencherSelectCategorias(produtos) {
    const categorias = [...new Set(produtos.map((p) => p.nome_categoria))];
    const selectCategoria = document.querySelector("#filtro-categoria");
    categorias.forEach((categoria) => {
      selectCategoria.innerHTML += `<option value="${categoria}">${categoria}</option>`;
    });
  }

  document
    .querySelector("#filtro-categoria")
    .addEventListener("change", (e) => {
      const categoriaSelecionada = e.target.value;
      const produtosFiltrados = produtosGlobal.filter(
        (p) =>
          !categoriaSelecionada || p.nome_categoria === categoriaSelecionada
      );
      preencherTabela(produtosFiltrados);
    });

  const inputPreco = document.querySelector("#preco-produto");
  inputPreco.addEventListener("input", (e) => {
    // Remove tudo que não for número
    let valor = e.target.value.replace(/\D/g, "");

    // Converte para decimal (divide por 100 para ter os centavos)
    valor = (parseInt(valor) / 100).toFixed(2);

    // Formata para moeda brasileira
    const valorFormatado = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

    // Atualiza o valor visual do input
    e.target.value = valorFormatado;

    // Guarda o valor numérico puro em um data attribute para envio
    e.target.dataset.valor = valor;
  });

  // Carregar lista de produtos
  async function carregarProdutos() {
    const response = await fetch(`${baseUrl}/api/estoque/produtos`, {
      headers: headers,
    });
    produtosGlobal = await response.json();
    preencherTabela(produtosGlobal);
    preencherSelectCategorias(produtosGlobal);
  }

  function preencherTabela(produtos) {
    const tbody = document.querySelector("#table tbody");
    if (!tbody) {
      console.error("Elemento tbody da tabela não encontrado.");
      return;
    }
    tbody.innerHTML = "";

    produtos.forEach((produto) => {
      const dataFormatada = new Date(produto.data_entrada).toLocaleDateString(
        "pt-BR"
      ); // Formata a data para o formato brasileiro

      // Formata o preço para o formato brasileiro
      const precoFormatado = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(produto.preco_produto);

      const row = document.createElement("tr");
      const estoqueClass =
        produto.qntd_produto <= 10 && produto.status_produto !== "Indisponível"
          ? "estoque-baixo"
          : "";
      const statusClass =
        produto.status_produto == "Indisponível" && produto.qntd_produto === 0
          ? "indisponivel"
          : "";
      row.className = `${estoqueClass} ${statusClass}`;

      row.innerHTML = `
                <td style="overflow: hidden;">${produto.nome}</td>
                <td style="overflow: hidden;">${produto.nome_categoria}</td>
                <td>${produto.qntd_produto}</td>
                <td>${dataFormatada}</td>
                <td>${precoFormatado}</td>
                <td>${produto.status_produto}</td>
                <td>
                    <button id="visualizarButton" onclick="visualizarProduto(${produto.id_produto})">Visualizar</button>
                    <button id="editbutton" onclick="editarProduto(${produto.id_produto})">Editar</button>
                    <button id="iconExcluir" title="Excluir" onclick="excluirProduto(${produto.id_produto})"></button>
                </td>
            `;
      tbody.appendChild(row);
    });
  }

  // Carregar lista de fornecedores para o datalist
  async function carregarFornecedores() {
    try {
      const response = await fetch(`${baseUrl}/api/participante`, {
        headers: headers,
      });
      const fornecedores = await response.json();
      console.log("Fornecedores carregados:", fornecedores); // Debug
      const datalist = document.querySelector("#fornecedores-list");
      datalist.innerHTML = "";

      fornecedores.forEach((fornecedor) => {
        const option = document.createElement("option");
        option.value = fornecedor.nome_participante;
        option.dataset.id = fornecedor.id_participante;
        datalist.appendChild(option);
      });
    } catch (error) {
      console.error("Erro ao carregar fornecedores:", error);
    }
  }

  // Carregar lista de categorias para o datalist
  async function carregarCategorias() {
    const response = await fetch(`${baseUrl}/api/categorias`, {
      headers: headers,
    });
    const categorias = await response.json();
    const datalist = document.querySelector("#categorias-list");
    datalist.innerHTML = "";

    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria.nome_categoria;
      option.dataset.id = categoria.id_categoria;
      datalist.appendChild(option);
    });
  }

  function apagarDados() {
    document.querySelector("#nome-produto").value = "";
    document.querySelector("#preco-produto").value = "";
    document.querySelector("#complemento-produto").value = "";
    document.querySelector("#contador-caracteres").value = "0/1000";
    document.querySelector("#codigo-participante-produto").value = "";
    document.querySelector("#categoria-produto").value = "";
    document.querySelector("#file-upload").value = "";
    document.querySelector("#preview-selected-image").src = "";
  }

  window.editarProduto = async (id) => {
    funcionarioIdParaEditar = id; // Armazena o ID do funcionário a ser editado
    try {
      const response = await fetch(`${baseUrl}/api/estoque/produtos/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const produto = await response.json();
        console.log("Produto a ser editado:", produto);

        // Preenche os campos com os dados atuais
        const dataEntrada = new Date(produto.data_entrada);
        const dataFormatada = dataEntrada.toISOString().split("T")[0];
        console.log("Data formatada:", dataFormatada); // Debug

        document.querySelector("#editar-nome-produto").value = produto.nome;
        /* document.querySelector('#editar-codigo-produto').value = produto.id_produto; */
        document.querySelector("#editar-categoria-produto").value =
          produto.nome_categoria;
        document.querySelector("#editar-dataEntrada").value = dataFormatada;
        document.querySelector("#editar-preco-produto").value =
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(produto.preco_produto);
        document.querySelector("#editar-participante-produto").value =
          produto.nome_participante;
        document.querySelector("#editar-complemento-produto").value =
          produto.descricao;

        if (produto.imagem_produto) {
          document.querySelector(
            "#editar-imagem-produto"
          ).src = `${baseUrl}/${produto.imagem_produto}`;
        }

        document.querySelector("#modalEditarDialog-produtos").showModal();
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao carregar dados do produto");
    }
  };

  // Função pra visualizar produto 
  window.visualizarProduto = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/api/estoque/produtos/${id}`, {
        headers: headers,
      });

      if (response.ok) {
        const produto = await response.json();
        console.log("Dados do produto:", produto); // Debug

        const dataEntrada = new Date(produto.data_entrada);
        const dataFormatada = dataEntrada.toISOString().split("T")[0];
        console.log("Data formatada:", dataFormatada); // Debug

        document.querySelector("#visualizar-nome-produto").value = produto.nome;
        /* document.querySelector('#visualizar-codigo-produto').value = produto.id_produto; */
        document.querySelector("#visualizar-categoria-produto").value =
          produto.nome_categoria;
        document.querySelector("#visualizar-dataEntrada").value = dataFormatada;
        document.querySelector("#visualizar-preco-produto").value =
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(produto.preco_produto);
        document.querySelector("#visualizar-participante-produto").value =
          produto.nome_participante;
        document.querySelector("#visualizar-complemento-produto").value =
          produto.descricao;

        if (produto.imagem_produto) {
          document.querySelector(
            "#visualizar-imagem-produto"
          ).src = `${baseUrl}/${produto.imagem_produto}`;
        }

        document.querySelector("#modalVisualizarDialog-produtos").showModal();
      }
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao carregar dados do produto");
    }
  };

  document
    .querySelector("#closeModalVisualizar-produtos")
    .addEventListener("click", () => {
      document.querySelector("#modalVisualizarDialog-produtos").close();
    });

  // Função para excluir produto - funcionou só com o função global
  window.excluirProduto = async (id) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      try {
        const response = await fetch(`${baseUrl}/api/estoque/produtos:${id}`, {
          method: "DELETE",
          headers: headers,
        });

        if (response.ok) {
          carregarProdutos();
          alert("Produto excluído com sucesso!");
        } else {
          throw new Error("Erro ao excluir produto");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao excluir produto");
      }
    }
  };
  // Enviando os dados do novo produto
  document.querySelector("#submitform").addEventListener("click", async () => {
    const categoriaInput = document.querySelector("#categoria-produto");
    const categoriaOption = document.querySelector(
      `#categorias-list option[value='${categoriaInput.value}']`
    );

    // Criar objeto com os dados
    const dados = {
      nome: document.querySelector("#nome-produto").value,
      preco_produto: parseFloat(
        document.querySelector("#preco-produto").dataset.valor
      ),
      descricao: document.querySelector("#complemento-produto").value,
      id_participante: parseInt(
        document.querySelector("#codigo-participante-produto").dataset.id
      ),
      id_categoria: parseInt(categoriaOption.dataset.id),
    };

    // Converter para FormData
    const formData = new FormData();
    Object.keys(dados).forEach((key) => {
      formData.append(key, dados[key]);
    });

    // Adicionar imagem se existir
    const fileInput = document.querySelector("#file-upload");
    if (fileInput.files[0]) {
      formData.append("imagemProduto", fileInput.files[0]);
      console.log("Imagem anexada ao FormData");
    }

    console.log("Dados antes do envio:", dados);

    try {
      const response = await fetch(`${baseUrl}/api/estoque/produtos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Dados enviados:", dados);
        console.error("Resposta do servidor:", errorData);
        throw new Error(errorData.message || "Erro ao adicionar produto");
      }

      //const resultado = await response.json();
      document.querySelector("#modalDialog-produtos").close();
      apagarDados();
      carregarProdutos();
      alert("Produto adicionado com sucesso!");
    } catch (error) {
      console.error("Erro completo:", error);
      console.error("Mensagem:", error.message);
      console.error("Stack:", error.stack);
      alert("Erro ao adicionar produto");
    }
  });

  // Evento para quando selecionar um fornecedor
  const inputFornecedor = document.querySelector(
    "#codigo-participante-produto"
  );
  if (inputFornecedor) {
    inputFornecedor.addEventListener("input", (e) => {
      const datalist = document.querySelector("#fornecedores-list");
      const options = datalist.options;
      const selectedOption = Array.from(options).find(
        (option) => option.value === e.target.value
      );

      if (selectedOption) {
        e.target.dataset.id = selectedOption.dataset.id;
      }
    });
  }

  // Evento para abrir modal de fornecedor
  document.querySelector("#add-fornecedor").addEventListener("click", () => {
    document.querySelector("#modalFornecedor").showModal();
  });

  // Evento para fechar modal
  document
    .querySelector("#closeModalFornecedor")
    .addEventListener("click", () => {
      document.querySelector("#modalFornecedor").close();
    });

  // Evento para salvar fornecedor
  document
    .querySelector("#salvarFornecedor")
    .addEventListener("click", async () => {
      const camposObrigatorios = [
        "nome-fornecedor",
        "telefone-fornecedor",
        "cnpj-fornecedor",
        "cpf-fornecedor",
        "rua-fornecedor",
        "numero-fornecedor",
        "bairro-fornecedor",
        "cidade-fornecedor",
        "estado-fornecedor",
        "cep-fornecedor",
      ];

      const camposVazios = camposObrigatorios.filter(
        (campo) => !document.querySelector(`#${campo}`).value
      ); // Verifica se algum campo obrigatório está vazio

      if (camposVazios.length > 0) {
        alert("Por favor, preencha todos os campos obrigatórios");
        return;
      } // Se algum campo obrigatório tiver vazio, exibe um alerta e não prossegue o envio

      const dados = {
        nome_participante: document.querySelector("#nome-fornecedor").value,
        telefone_participante: document.querySelector("#telefone-fornecedor")
          .value,
        cnpj: document.querySelector("#cnpj-fornecedor").value,
        cpf: document.querySelector("#cpf-fornecedor").value,
        rua: document.querySelector("#rua-fornecedor").value,
        numero: document.querySelector("#numero-fornecedor").value,
        bairro: document.querySelector("#bairro-fornecedor").value,
        cidade: document.querySelector("#cidade-fornecedor").value,
        estado: document.querySelector("#estado-fornecedor").value,
        cep: document.querySelector("#cep-fornecedor").value,
        complemento: "", // mesmo nao sendo obrigatório, precisa ser enviado, pelo menos em brnco
      };
      console.log("Dados do fornecedor:", dados); // Debug

      try {
        const response = await fetch(`${baseUrl}/api/participante`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dados),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Erro do servidor:", errorData);
          throw new Error(errorData.message || "Erro ao cadastrar fornecedor");
        }

        const novoFornecedor = await response.json();
        document.querySelector("#codigo-participante-produto").value =
          dados.nome_participante;
        document.querySelector("#codigo-participante-produto").dataset.id =
          novoFornecedor.id_participante;

        await carregarFornecedores();
        document.querySelector("#modalFornecedor").close();
        alert("Fornecedor cadastrado com sucesso!");
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao cadastrar fornecedor");
      }
    });

  // Eventos do modal de categoria
  document.querySelector("#add-categoria").addEventListener("click", () => {
    document.querySelector("#modalCategoria").showModal();
  });

  document
    .querySelector("#closeModalCategoria")
    .addEventListener("click", () => {
      document.querySelector("#modalCategoria").close();
    });

  document
    .querySelector("#salvarCategoria")
    .addEventListener("click", async () => {
      const dados = {
        nome_categoria: document.querySelector("#nome-categoria").value,
      };

      try {
        const response = await fetch(`${baseUrl}/api/categorias`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dados),
        });

        if (response.ok) {
          const novaCategoria = await response.json();
          document.querySelector("#categoria-produto").value =
            dados.nome_categoria;
          document.querySelector("#categoria-produto").dataset.id =
            novaCategoria.id_categoria;

          await carregarCategorias();
          document.querySelector("#modalCategoria").close();
          alert("Categoria cadastrada com sucesso!");
        } else {
          alert("Erro ao cadastrar categoria");
        }
      } catch (error) {
        console.error("Erro:", error);
        alert("Erro ao cadastrar categoria");
      }
    });

  const inputImagem = document.querySelector("#file-upload");
  const previewImagem = document.querySelector("#preview-selected-image");

  if (inputImagem && previewImagem) {
    inputImagem.addEventListener("change", (event) => {
      const files = event.target.files;
      if (files.length > 0) {
        const imageUrl = URL.createObjectURL(files[0]);
        previewImagem.src = imageUrl;
      }
    });
  }

  await carregarCategorias();

  await carregarFornecedores();

  carregarProdutos();
});