document.addEventListener('DOMContentLoaded', async function() {
    const baseUrl = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const funcionarioLogado = JSON.parse(localStorage.getItem('funcionario'));
    console.log(funcionarioLogado.nome);
    
    if (!token) {
        alert('Sua sessão expirou. Por favor, faça login novamente.');
        window.location.href = 'telalogin.html';
        return;
    }
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    const imgElement = document.querySelector('#imageUser img');

    if (funcionarioLogado && funcionarioLogado.imagem_funcionario) {
        imgElement.src = `${baseUrl}/${funcionarioLogado.imagem_funcionario}`;
    } // Se a imagem do funcionário estiver disponível, atualiza o src da imagem
    else {
        imgElement.src = 'https://placecats.com/neo_banana/300/200'; // Define uma imagem padrão caso não haja imagem
    }

    // Variáveis globais
    let participantes = [];
    let funcionarios = [];
    let produtos = [];
    let itemCount = 1;

    // Carregando dados iniciais
    async function carregarDados() {
        try {
            // Carregando participantes (fornecedores/clientes)
            const responseParticipantes = await fetch(`${baseUrl}/api/participante`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!responseParticipantes.ok) {
                throw new Error(`Erro ao carregar participantes: ${responseParticipantes.status}`);
            }
            
            participantes = await responseParticipantes.json();
            
            // Carrega funcionários
            const responseFuncionarios = await fetch(`${baseUrl}/api/funcionarios`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!responseFuncionarios.ok) {
                throw new Error(`Erro ao carregar funcionários: ${responseFuncionarios.status}`);
            }
            
            funcionarios = await responseFuncionarios.json();
            
            // Carregando produtos
            const responseProdutos = await fetch(`${baseUrl}/api/estoque/produtos`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!responseProdutos.ok) {
                throw new Error(`Erro ao carregar produtos: ${responseProdutos.status}`);
            }
            
            produtos = await responseProdutos.json();
            
            // Configurando autocomplete pra participantes
            setupAutocomplete(document.getElementById('participante_nome'), participantes, 'id_participante', 'nome_participante');
            
            // Configurando autocomplete pros funcionários
            setupAutocomplete(document.getElementById('funcionario_nome'), funcionarios, 'id_funcionario', 'nome_funcionario');
            
            // Preenchendo automaticamente o funcionário logado
            if (funcionarioLogado) {
                document.getElementById('funcionario_nome').value = funcionarioLogado.nome;
                document.getElementById('id_funcionario').value = funcionarioLogado.id;
                // Desabilitando o campo pra evitar alterações
                document.getElementById('funcionario_nome').readOnly = true;
            }
            
            // Configurando autocomplete pro primeiro produto
            setupAutocomplete(document.querySelector('.produto-nome'), produtos, document.querySelector('.id-produto'), 'nome');
            
            // Configurando eventos pra calcular subtotal
            document.querySelector('.quantidade').addEventListener('input', updateSubtotal);
            document.querySelector('.valor-unitario').addEventListener('input', updateSubtotal);
            
            // Definindo data atual
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('data_movimentacao').value = formattedDate;

            // Definindo hora atual
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            document.getElementById('hora_movimentacao').value = formattedTime;
            
            // Adicionando event listeners para os radio buttons de tipo de movimentação
            document.querySelectorAll('input[name="id_tipo_movimentacao"]').forEach(radio => {
                radio.addEventListener('change', handleTipoMovimentacaoChange);
            });
            
            // Verificar o tipo de movimentação inicial
            const tipoMovimentacaoSelecionado = document.querySelector('input[name="id_tipo_movimentacao"]:checked');
            if (tipoMovimentacaoSelecionado) {
                handleTipoMovimentacaoChange.call(tipoMovimentacaoSelecionado);
            }
            
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            if (error.message.includes('401')) {
                alert('Sua sessão expirou. Por favor, faça login novamente.');
                window.location.href = 'telalogin.html';
            } else {
                alert('Erro ao carregar dados iniciais. Por favor, recarregue a página.');
            }
        }
    }

    // Função para lidar com a mudança no tipo de movimentação
    function handleTipoMovimentacaoChange() {
        const tipoMovimentacao = this.value;
        const participanteNomeInput = document.getElementById('participante_nome');
        const participanteIdInput = document.getElementById('id_participante');
        
        // Se for saída, tenta selecionar "Consumidor Final"
        if (tipoMovimentacao === 'S') {
            const consumidorFinal = participantes.find(p => 
                p.nome_participante.toLowerCase().includes('consumidor final'));
            
            if (consumidorFinal) {
                participanteNomeInput.value = consumidorFinal.nome_participante;
                participanteIdInput.value = consumidorFinal.id_participante;
            }
        } else {
            // Se for entrada, limpa o campo de participante
            participanteNomeInput.value = '';
            participanteIdInput.value = '';
        }
    }

    // Configurando autocomplete
    function setupAutocomplete(input, items, targetIdField, nameField) {
        let currentFocus;
        
        input.addEventListener("input", function() {
            let a, b, i, val = this.value;
            closeAllLists();
            if (!val) { return false; }
            currentFocus = -1;
            
            a = document.createElement("div");
            a.setAttribute("class", "autocomplete-items");
            this.parentNode.appendChild(a);
            
            for (i = 0; i < items.length; i++) {
                if (items[i][nameField].toLowerCase().includes(val.toLowerCase())) {
                    b = document.createElement("div");
                    b.innerHTML = items[i][nameField];
                    b.innerHTML += `<input type='hidden' value='${items[i].id_produto || items[i].id_funcionario || items[i].id_participante}'>`;
                    
                    // Guardando o preço do produto no elemento pra usar depois
                    if (items[i].preco_produto) {
                        b.dataset.preco = items[i].preco_produto;
                    }
                    
                    b.addEventListener("click", function() {
                        input.value = this.textContent;
                        const idValue = this.getElementsByTagName("input")[0].value;
                        
                        if (typeof targetIdField === 'string') {
                            document.getElementById(targetIdField).value = idValue;
                        } else {
                            targetIdField.value = idValue;
                        }
                        
                        // Se for um produto, preenchendo o preço unitário
                        if (this.dataset.preco) {
                            const row = input.closest('tr');
                            if (row) {
                                const valorUnitarioInput = row.querySelector('.valor-unitario');
                                if (valorUnitarioInput) {
                                    valorUnitarioInput.value = parseFloat(this.dataset.preco).toFixed(2);
                                    // Disparando o evento de input pra recalcular o subtotal
                                    const event = new Event('input', { bubbles: true });
                                    valorUnitarioInput.dispatchEvent(event);
                                }
                            }
                        }
                        
                        closeAllLists();
                    });
                    a.appendChild(b);
                }
            }
        });
        
        input.addEventListener("keydown", function(e) {
            let x = document.getElementsByClassName("autocomplete-items")[0];
            if (x) x = x.getElementsByTagName("div");
            if (e.keyCode == 40) { // seta pra baixo
                currentFocus++;
                addActive(x);
            } else if (e.keyCode == 38) { // seta pra cima
                currentFocus--;
                addActive(x);
            } else if (e.keyCode == 13) { // enter
                e.preventDefault();
                if (currentFocus > -1) {
                    if (x) x[currentFocus].click();
                }
            }
        });
        
        function addActive(x) {
            if (!x) return false;
            removeActive(x);
            if (currentFocus >= x.length) currentFocus = 0;
            if (currentFocus < 0) currentFocus = (x.length - 1);
            x[currentFocus].classList.add("autocomplete-active");
        }
        
        function removeActive(x) {
            for (let i = 0; i < x.length; i++) {
                x[i].classList.remove("autocomplete-active");
            }
        }
        
        function closeAllLists(elmnt) {
            const x = document.getElementsByClassName("autocomplete-items");
            for (let i = 0; i < x.length; i++) {
                if (elmnt != x[i] && elmnt != input) {
                    x[i].parentNode.removeChild(x[i]);
                }
            }
        }
        
        document.addEventListener("click", function(e) {
            closeAllLists(e.target);
        });
    }

    // Atualizando subtotal
    function updateSubtotal() {
        const row = this.closest('tr');
        const quantidade = parseFloat(row.querySelector('.quantidade').value) || 0;
        const valorUnitario = parseFloat(row.querySelector('.valor-unitario').value) || 0;
        const subtotal = quantidade * valorUnitario;
        row.querySelector('.subtotal').textContent = subtotal.toFixed(2);
        calculateTotal();
    }

    // Calculando total
    function calculateTotal() {
        let total = 0;
        document.querySelectorAll('.subtotal').forEach(cell => {
            total += parseFloat(cell.textContent) || 0;
        });
        document.getElementById('total-value').textContent = total.toFixed(2);
    }

    // Adicionando novo item
    document.getElementById('addItemBtn').addEventListener('click', function() {
        itemCount++;
        const itemsTable = document.getElementById('itensTable').getElementsByTagName('tbody')[0];
        
        const newRow = document.createElement('tr');
        newRow.id = `item-row-${itemCount}`;
        newRow.className = 'item-row';
        
        newRow.innerHTML = `
            <td data-label="Item">${itemCount}</td>
            <td data-label="Produto">
                <div class="autocomplete">
                    <input type="text" class="produto-nome" placeholder="Buscar produto" required>
                    <input type="hidden" class="id-produto" name="itens[${itemCount-1}][id_produto]">
                </div>
            </td>
            <td data-label="Quantidade">
                <input type="number" class="quantidade" name="itens[${itemCount-1}][quantidade]" min="0.01" step="0.01" value="1" required>
            </td>
            <td data-label="Valor Unitário">
                <input type="number" class="valor-unitario" name="itens[${itemCount-1}][valor_unitario]" min="0.01" step="0.01" value="0.00" required>
            </td>
            <td data-label="Subtotal" class="subtotal">0.00</td>
            <td data-label="Ações" class="action-cell">
                <span class="item-action delete-btn" title="Remover item">🗑️</span>
            </td>
        `;
        
        itemsTable.appendChild(newRow);
        
        // Configurando autocomplete pro novo produto
        setupAutocomplete(newRow.querySelector('.produto-nome'), produtos, newRow.querySelector('.id-produto'), 'nome');
        
        // Adicionando eventos pra calcular subtotal
        newRow.querySelector('.quantidade').addEventListener('input', updateSubtotal);
        newRow.querySelector('.valor-unitario').addEventListener('input', updateSubtotal);
        
        // Adicionando evento pra remover item
        newRow.querySelector('.delete-btn').addEventListener('click', function() {
            if (itemsTable.getElementsByClassName('item-row').length > 1) {
                newRow.remove();
                updateItemNumbers();
                calculateTotal();
            } else {
                alert('É necessário pelo menos um item na movimentação.');
            }
        });
    });

    // Removendo item (primeiro item)
    document.querySelector('.delete-btn').addEventListener('click', function() {
        const itemsTable = document.getElementById('itensTable').getElementsByTagName('tbody')[0];
        if (itemsTable.getElementsByClassName('item-row').length > 1) {
            this.closest('tr').remove();
            updateItemNumbers();
            calculateTotal();
        } else {
            alert('É necessário pelo menos um item na movimentação.');
        }
    });

    // Atualizando números dos itens
    function updateItemNumbers() {
        const rows = document.querySelectorAll('.item-row');
        rows.forEach((row, index) => {
            const itemNum = index + 1;
            row.id = `item-row-${itemNum}`;
            row.querySelector('td:first-child').textContent = itemNum;
            
            // Atualizando o índice nos nomes dos campos
            const inputQuantidade = row.querySelector('.quantidade');
            const inputValorUnitario = row.querySelector('.valor-unitario');
            const inputIdProduto = row.querySelector('.id-produto');
            
            inputQuantidade.name = `itens[${index}][quantidade]`;
            inputValorUnitario.name = `itens[${index}][valor_unitario]`;
            inputIdProduto.name = `itens[${index}][id_produto]`;
        });
        
        // Atualizando contador global
        itemCount = document.querySelectorAll('.item-row').length;
    }

    // Limpando formulário
    document.getElementById('limparBtn').addEventListener('click', function() {
        if (confirm('Deseja realmente limpar todos os campos do formulário?')) {
            // Guarda o valor do funcionário antes de resetar
            const funcionarioNome = document.getElementById('funcionario_nome').value;
            const funcionarioId = document.getElementById('id_funcionario').value;
            
            document.getElementById('movimentacaoForm').reset();
            
            // Restaurando o valor do funcionário após o reset
            document.getElementById('funcionario_nome').value = funcionarioNome;
            document.getElementById('id_funcionario').value = funcionarioId;
            
            // Definindo data atual novamente
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('data_movimentacao').value = formattedDate;
            
            // Definindo hora atual novamente
            const hours = String(today.getHours()).padStart(2, '0');
            const minutes = String(today.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            document.getElementById('hora_movimentacao').value = formattedTime;
            
            // Limpando tabela de itens exceto a primeira linha
            const itemsTable = document.getElementById('itensTable').getElementsByTagName('tbody')[0];
            const rows = itemsTable.getElementsByClassName('item-row');
            
            while (rows.length > 1) {
                rows[rows.length - 1].remove();
            }
            
            // Limpando a primeira linha
            const firstRow = rows[0];
            firstRow.querySelector('.produto-nome').value = '';
            firstRow.querySelector('.id-produto').value = '';
            firstRow.querySelector('.quantidade').value = '1';
            firstRow.querySelector('.valor-unitario').value = '0.00';
            firstRow.querySelector('.subtotal').textContent = '0.00';
            
            calculateTotal();
            itemCount = 1;
            
            // Verifica o tipo de movimentação e aplica a lógica do Consumidor Final (caso viavel)
            const tipoMovimentacaoSelecionado = document.querySelector('input[name="id_tipo_movimentacao"]:checked');
            if (tipoMovimentacaoSelecionado) {
                handleTipoMovimentacaoChange.call(tipoMovimentacaoSelecionado);
            }
        }
    });

    // Enviando formulário
    document.getElementById('movimentacaoForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validação básica - coisa boba
        const participanteId = document.getElementById('id_participante').value;
        const funcionarioId = document.getElementById('id_funcionario').value;
        
        if (!participanteId) {
            alert('Selecione um participante válido.');
            return false;
        }
        
        if (!funcionarioId) {
            alert('Selecione um funcionário responsável.');
            return false;
        }
        
        // Validando itens
        let invalid = false;
        document.querySelectorAll('.item-row').forEach(row => {
            const produtoId = row.querySelector('.id-produto').value;
            const quantidade = parseFloat(row.querySelector('.quantidade').value);
            const valorUnitario = parseFloat(row.querySelector('.valor-unitario').value);
            
            if (!produtoId) {
                alert('Selecione um produto válido para todos os itens.');
                invalid = true;
                return;
            }
            
            if (isNaN(quantidade) || quantidade <= 0) {
                alert('A quantidade deve ser maior que zero para todos os itens.');
                invalid = true;
                return;
            }
            
            if (isNaN(valorUnitario) || valorUnitario <= 0) {
                alert('O valor unitário deve ser maior que zero para todos os itens.');
                invalid = true;
                return;
            }
        });
        
        if (invalid) {
            return false;
        }
        
        // Cria obj com os dados do formulário
        const itens = [];
        document.querySelectorAll('.item-row').forEach((row, index) => {
            itens.push({
                item: index + 1,
                id_produto: parseInt(row.querySelector('.id-produto').value),
                quantidade: parseFloat(row.querySelector('.quantidade').value),
                valor_unitario: parseFloat(row.querySelector('.valor-unitario').value)
            });
        });
        
        const formData = {
            id_tipo_movimentacao: document.querySelector('input[name="id_tipo_movimentacao"]:checked').value,
            id_participante: parseInt(participanteId),
            id_funcionario: parseInt(funcionarioId),
            itens: itens
        };
        
        try {
            const response = await fetch(`${baseUrl}/api/pedidos`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erro ao registrar movimentação');
            }
            
            alert('Movimentação registrada com sucesso!');
            document.getElementById('limparBtn').click();
        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            alert(`Erro ao registrar movimentação: ${error.message}`);
        }
    });

    carregarDados();
    
    // evento pra fazer o logout
    document.querySelector('#sairLogin').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('funcionario');
        window.location.href = 'telalogin.html';
    });
});