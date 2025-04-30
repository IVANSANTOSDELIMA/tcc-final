document.addEventListener('DOMContentLoaded', async function() {
    const baseUrl = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    const funcionario = JSON.parse(localStorage.getItem('funcionario'));
    const imgElement = document.querySelector('#imageUser img');
    
    if (funcionario && funcionario.imagem_funcionario) {
        imgElement.src = `${baseUrl}/${funcionario.imagem_funcionario}`;
    } // Se a imagem do funcionário estiver disponível, atualiza o src da imagem
    else {
        imgElement.src = 'https://placecats.com/neo_banana/300/200'; // Define uma imagem padrão caso não haja imagem
    }

    let funcionariosGlobal = [];
    
    // Carregar lista de funcionários
    async function carregarFuncionarios() {
        const response = await fetch(`${baseUrl}/api/funcionarios`, {
            headers: headers
        });
        funcionariosGlobal = await response.json();
        preencherTabela(funcionariosGlobal);
        preencherSelectCargos(funcionariosGlobal);
    }

    // Filtro por nome de funcionarios
    const inputNome = document.querySelector('input[name="NomeCategory"]');
    inputNome.addEventListener('input', async () => {
        const response = await fetch(`${baseUrl}/api/funcionarios?nome=${inputNome.value}`, {
            headers: headers
        });
        const funcionarios = await response.json();
        preencherTabela(funcionarios);
    });

    // Filtro por cargo de funcionarios - Procurando cargos únicos pro select
    function preencherSelectCargos(funcionarios) {
        const cargos = [...new Set(funcionarios.map(f => f.cargo))];
        console.log('Cargos únicos:', cargos);
        const selectCargo = document.querySelector('#filtro-cargo');
        console.log('Select encontrado:', selectCargo);
        
        cargos.forEach(cargo => {
            selectCargo.innerHTML += `<option value="${cargo}">${cargo}</option>`;
        });
    }

// Filtrar quando selecionar um cargo
document.querySelector('#filtro-cargo').addEventListener('change', (e) => {
    const cargoSelecionado = e.target.value;
    const funcionariosFiltrados = funcionariosGlobal.filter(f => 
        !cargoSelecionado || f.cargo === cargoSelecionado
    );
    preencherTabela(funcionariosFiltrados);
});

    // Preencher tabela com dados
    function preencherTabela(funcionarios) {
        const tbody = document.querySelector('#table tbody');
        if (!tbody) {
            console.error('Elemento tbody da tabela não encontrado.');
            return;
        }
        tbody.innerHTML = '';
        
        funcionarios.forEach(funcionario => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${funcionario.nome_funcionario}</td>
                <td>${funcionario.cargo}</td>
                <td>${funcionario.telefone_funcionario}</td>
                <td>${funcionario.email}</td>
                <td>
                    <button id="visualizarButton" onclick="visualizarFuncionario(${funcionario.id_funcionario})">Visualizar</button>
                    <button id="editbutton" onclick="editarFuncionario(${funcionario.id_funcionario})">Editar</button>
                    <button id="iconExcluir" title="Excluir" onclick="excluirFuncionario(${funcionario.id_funcionario})"></button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Função global para excluir um funcionário
    window.excluirFuncionario = async (id) => {
        if (confirm('Tem certeza que deseja excluir este funcionário?')) { 
            try {
                const response = await fetch(`${baseUrl}/api/funcionarios/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
    
                if (response.ok) { // Se a resposta do servidor for bem-sucedida (status 200-299)
                    alert('Funcionário excluído com sucesso!');
                    carregarFuncionarios();
                } else { // Se a resposta do servidor não for bem-sucedida
                    alert('Erro ao excluir funcionário');
                }
            } catch (error) { // Se ocorrer um erro durante a requisição
                console.error('Erro:', error);
                alert('Erro ao excluir funcionário');
            }
        }
    }

    const closeModalEditar = document.querySelector('#closeModalEditar');

    if (closeModalEditar) {
        closeModalEditar.addEventListener('click', () => {
            document.querySelector('#nome').value = '';
            document.querySelector('#cargo').value = '';
            document.querySelector('#telefone').value = '';
            document.querySelector('#email').value = '';
            document.querySelector('#cpf').value = '';
            document.querySelector('#dataAdmissao').value = '';
            document.querySelector('#senha').value = '';
            document.querySelector('#nivelAcesso').value = '';
            document.querySelector('#rua').value = '';
            document.querySelector('#numero').value = '';
            document.querySelector('#complemento').value = '';
            document.querySelector('#bairro').value = '';
            document.querySelector('#cidade').value = '';
            document.querySelector('#estado').value = '';
            document.querySelector('#cep').value = '';
            document.querySelector('#preview-selected-image').src = '';
            document.querySelector('#file-upload').value = '';
            document.querySelector('#modalEditarDialog').close();
        });
    }
    // Função para abrir modal de edição
    
    let funcionarioIdParaEditar;
    window.editarFuncionario = async (id) => {
        funcionarioIdParaEditar = id; // Armazena o ID do funcionário a ser editado
        try {
            const response = await fetch(`${baseUrl}/api/funcionarios/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const funcionario = await response.json();
                
                // Preenche os campos com os dados atuais
                document.querySelector('#editar-nome').value = funcionario.nome_funcionario;
                document.querySelector('#editar-nivelAcesso').value = funcionario.nivel_acesso;
                document.querySelector('#editar-cpf').value = funcionario.cpf;
                document.querySelector('#editar-cargo').value = funcionario.cargo;
                document.querySelector('#editar-dataAdmissao').value = new Date(funcionario.data_admissao).toISOString().split('T')[0];
                document.querySelector('#editar-telefone').value = funcionario.telefone_funcionario;
                document.querySelector('#editar-email').value = funcionario.email;
                document.querySelector('#editar-estado').value = funcionario.estado;
                document.querySelector('#editar-cidade').value = funcionario.cidade;
                document.querySelector('#editar-cep').value = funcionario.cep;
                document.querySelector('#editar-rua').value = funcionario.rua;
                document.querySelector('#editar-bairro').value = funcionario.bairro;
                document.querySelector('#editar-numero').value = funcionario.numero;
                document.querySelector('#editar-complemento').value = funcionario.complemento;
                /* document.querySelector('#editar-senha').value = funcionario.senha; */
                
                if (funcionario.imagem_funcionario) {
                    document.querySelector('#editar-imagem').src = `${baseUrl}/${funcionario.imagem_funcionario}`;
                }

                document.querySelector('#modalEditarDialog').showModal();
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar dados do funcionário');
        }
    }

    // Função para fechar o modal de visualização
    const closeModalVisualizar = document.querySelector('#closeModalVisualizar');
    if (closeModalVisualizar) {
        closeModalVisualizar.addEventListener('click', () => {
            document.querySelector('#modalVisualizarDialog').close();
        });
    }

    window.visualizarFuncionario = async (id) => {
        try {
            const response = await fetch(`${baseUrl}/api/funcionarios/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const funcionario = await response.json();

                // Formata a data de admissão
                const dataAdmissao = new Date(funcionario.data_admissao);
                const dataFormatada = dataAdmissao.toISOString().split('T')[0];
                
                // Preenche os campos
                document.querySelector('#visualizar-nome').value = funcionario.nome_funcionario;
                document.querySelector('#visualizar-nivelAcesso').value = funcionario.nivel_acesso;
                document.querySelector('#visualizar-cpf').value = funcionario.cpf;
                document.querySelector('#visualizar-cargo').value = funcionario.cargo;
                document.querySelector('#visualizar-dataAdmissao').value = dataFormatada;
                document.querySelector('#visualizar-telefone').value = funcionario.telefone_funcionario;
                document.querySelector('#visualizar-email').value = funcionario.email;
                document.querySelector('#visualizar-estado').value = funcionario.estado;
                document.querySelector('#visualizar-cidade').value = funcionario.cidade;
                document.querySelector('#visualizar-cep').value = funcionario.cep;
                document.querySelector('#visualizar-rua').value = funcionario.rua;
                document.querySelector('#visualizar-bairro').value = funcionario.bairro;
                document.querySelector('#visualizar-numero').value = funcionario.numero;
                document.querySelector('#visualizar-complemento').value = funcionario.complemento;
                
                if (funcionario.imagem_funcionario) {
                    document.querySelector('#visualizar-imagem').src = `${baseUrl}/${funcionario.imagem_funcionario}`;
                }

                document.querySelector('#modalVisualizarDialog').showModal();
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao carregar dados do funcionário');
        }
    }
    // Preview de imagem
    const inputImagem = document.querySelector('#file-upload');
    const previewImagem = document.querySelector('#preview-selected-image');

    // Preview de imagem
    if (inputImagem && previewImagem) { // Verifica se os elementos existem no DOM
        inputImagem.addEventListener('change', (event) => {
            const files = event.target.files; // Pega os arquivos selecionados no input de arquivo
            if (files.length > 0) {
                const imageUrl = URL.createObjectURL(files[0]); // Cria uma URL temporária para o arquivo de imagem selecionado
                previewImagem.src = imageUrl; // Atualiza o src da imagem de preview com a URL temporária
            }
        });
    }

    // Preview de imagem no modal de edição
    const inputImagemEditar = document.querySelector('#editar-file-upload');
    const previewImagemEditar = document.querySelector('#editar-imagem');

    if (inputImagemEditar && previewImagemEditar) {
        inputImagemEditar.addEventListener('change', (event) => {
            const files = event.target.files;
            if (files.length > 0) {
                const imageUrl = URL.createObjectURL(files[0]);
                previewImagemEditar.src = imageUrl;
            }
        });

    }    
    

    // Modal de adicionar
    const btnAdicionar = document.querySelector('#openButton');
    const modalDialog = document.querySelector('#modalDialog');
    const submitButton = document.querySelector('#submitform');



    if (btnAdicionar) {
        btnAdicionar.addEventListener('click', () => {
            const hoje = new Date(); 
            const dataFormatada = hoje.toISOString().split('T')[0]; // Formata a data no formato YYYY-MM-DD
            document.querySelector('#dataAdmissao').value = dataFormatada; // Define o valor do campo de data de admissão como a data atual

            modalDialog.showModal();
        });
    }

    const salvarEdicao = document.querySelector('#salvarEdicao');

    // Salvando as alterações do funcionario no banco/api
    if (salvarEdicao) {
        salvarEdicao.addEventListener('click', async () => {
            console.log('Dados sendo enviados:', {
                nome: document.querySelector('#editar-nome').value,
                cargo: document.querySelector('#editar-cargo').value,
                nivel_acesso: document.querySelector('#editar-nivelAcesso').value,
            });

            const dados = {
                nome_funcionario: document.querySelector('#editar-nome').value,
                nivel_acesso: document.querySelector('#editar-nivelAcesso').value,
                cpf: document.querySelector('#editar-cpf').value,
                cargo: document.querySelector('#editar-cargo').value,
                data_admissao: document.querySelector('#editar-dataAdmissao').value,
                telefone_funcionario: document.querySelector('#editar-telefone').value,
                email: document.querySelector('#editar-email').value,
                estado: document.querySelector('#editar-estado').value,
                cidade: document.querySelector('#editar-cidade').value,
                cep: document.querySelector('#editar-cep').value,
                rua: document.querySelector('#editar-rua').value,
                bairro: document.querySelector('#editar-bairro').value,
                numero: document.querySelector('#editar-numero').value,
                complemento: document.querySelector('#editar-complemento').value
            };

            try {
                const response = await fetch(`${baseUrl}/api/funcionarios/${funcionarioIdParaEditar}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dados)
                });

                if (response.ok) {
                    // Se houver uma nova imagem, faz o upload
                    const fileInput = document.querySelector('#editar-file-upload');
                    if (fileInput.files[0]) {
                        const formData = new FormData();
                        formData.append('imagemFuncionario', fileInput.files[0]);
                        
                        await fetch(`${baseUrl}/api/funcionarios/${funcionarioIdParaEditar}/imagem`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            },
                            body: formData
                        });
                    }

                    alert('Funcionário atualizado com sucesso!');
                    document.querySelector('#nome').value = '';
                    document.querySelector('#cargo').value = '';
                    document.querySelector('#telefone').value = '';
                    document.querySelector('#email').value = '';
                    document.querySelector('#cpf').value = '';
                    document.querySelector('#dataAdmissao').value = '';
                    /* document.querySelector('#senha').value = ''; */
                    document.querySelector('#nivelAcesso').value = '';
                    document.querySelector('#rua').value = '';
                    document.querySelector('#numero').value = '';
                    document.querySelector('#complemento').value = '';
                    document.querySelector('#bairro').value = '';
                    document.querySelector('#cidade').value = '';
                    document.querySelector('#estado').value = '';
                    document.querySelector('#cep').value = '';
                    document.querySelector('#preview-selected-image').src = '';
                    document.querySelector('#file-upload').value = '';
                    document.querySelector('#modalEditarDialog').close();
                    carregarFuncionarios();
                } else {
                    alert('Erro ao atualizar funcionário');
                }
            } catch (error) {
                console.error('Erro:', error);
                alert('Erro ao atualizar funcionário');
            }
        });
    }
    // enviando os dados do novo funcionario para o banco/api
    if (submitButton) {
        submitButton.addEventListener('click', async () => { 
            const formData = new FormData();
            console.log('Iniciando envio de dados...');

            formData.append('nome_funcionario', document.querySelector('#nome').value);
            formData.append('cargo', document.querySelector('#cargo').value);
            formData.append('telefone_funcionario', document.querySelector('#telefone').value);
            formData.append('email', document.querySelector('#email').value);
            formData.append('cpf', document.querySelector('#cpf').value);
            formData.append('data_admissao', document.querySelector('#dataAdmissao').value);
            formData.append('senha', document.querySelector('#senha').value);
            formData.append('nivel_acesso', document.querySelector('#nivelAcesso').value);
            formData.append('rua', document.querySelector('#rua').value);
            formData.append('numero', document.querySelector('#numero').value);
            formData.append('complemento', document.querySelector('#complemento').value);
            formData.append('bairro', document.querySelector('#bairro').value);
            formData.append('cidade', document.querySelector('#cidade').value);
            formData.append('estado', document.querySelector('#estado').value);
            formData.append('cep', document.querySelector('#cep').value);
            console.log('FormData montado');
            
            const fileInput = document.querySelector('#file-upload');
            if (fileInput.files[0]) {
                formData.append('imagemFuncionario', fileInput.files[0]);
                console.log('Imagem anexada ao FormData');
            }
            

            try {
                console.log('Iniciando requisição...');
                
                const response = await fetch(`${baseUrl}/api/funcionarios`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });
                console.log('Resposta recebida:', response.status);
                const responseData = await response.json();
                console.log('Dados da resposta:', responseData);
                

                if (response.ok) {
                    alert('Funcionário cadastrado com sucesso!');
                    // pra limpar o modal, preciso achar uma forma melhor de fazeer isso mais pra frente
                    document.querySelector('#nome').value = '';
                    document.querySelector('#cargo').value = '';
                    document.querySelector('#telefone').value = '';
                    document.querySelector('#email').value = '';
                    document.querySelector('#cpf').value = '';
                    document.querySelector('#dataAdmissao').value = '';
                    document.querySelector('#senha').value = '';
                    document.querySelector('#nivelAcesso').value = '';
                    document.querySelector('#rua').value = '';
                    document.querySelector('#numero').value = '';
                    document.querySelector('#complemento').value = '';
                    document.querySelector('#bairro').value = '';
                    document.querySelector('#cidade').value = '';
                    document.querySelector('#estado').value = '';
                    document.querySelector('#cep').value = '';
                    document.querySelector('#preview-selected-image').src = '';
                    document.querySelector('#file-upload').value = '';
                    // fechando o modal
                    modalDialog.close();
                    carregarFuncionarios();
                } else {
                    alert('Erro ao cadastrar funcionário!!');
                }
            } catch (error) {
                console.error('Erro ao cadastrar:', error);
                alert('Erro ao cadastrar funcionário');
            }
        });
    }    carregarFuncionarios();

    
});

// FINALMENTE ACABOU???