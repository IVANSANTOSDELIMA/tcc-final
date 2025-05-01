document.addEventListener('DOMContentLoaded', async function() {
    const baseUrl = 'http://localhost:3000';
    const token = localStorage.getItem('token');
    const headers = {
        'Authorization': `Bearer ${token}`
    };

    // Configurar comportamento de acordeão para as tabelas
    const tabelaDia = document.querySelector('#table-dia');
    const tabelaSemana = document.querySelector('#table-semana');
    const tabelaMes = document.querySelector('#table-mes');
    const tabelaAno = document.querySelector('#table-ano');

    // Inicializar classes de ícones para mostrar estado correto
    document.querySelectorAll('table thead tr th i').forEach(icon => {
        icon.classList.remove('fi-ss-angle-down');
        icon.classList.add('fi-rr-angle-right');
    });

    // Função para alternar visibilidade e ícone
    function toggleTabela(tabela) {
        const tbody = tabela.querySelector('tbody');
        const icone = tabela.querySelector('thead tr th i');
        
        if (tbody.style.display === 'none' || !tbody.style.display) {
            // Fechar todas as outras tabelas primeiro
            document.querySelectorAll('table tbody').forEach(body => {
                body.style.display = 'none';
            });
            document.querySelectorAll('table thead tr th i').forEach(icon => {
                icon.classList.remove('fi-rr-angle-down');
                icon.classList.add('fi-rr-angle-right');
            });
            
            // Abrir a tabela clicada
            tbody.style.display = 'table-row-group';
            icone.classList.remove('fi-rr-angle-right');
            icone.classList.add('fi-rr-angle-down');
        } else {
            // Fechar a tabela atual
            tbody.style.display = 'none';
            icone.classList.remove('fi-rr-angle-down');
            icone.classList.add('fi-rr-angle-right');
        }
    }

    // Adicionar eventos de clique aos cabeçalhos das tabelas
    tabelaDia.querySelector('thead').addEventListener('click', () => toggleTabela(tabelaDia));
    tabelaSemana.querySelector('thead').addEventListener('click', () => toggleTabela(tabelaSemana));
    tabelaMes.querySelector('thead').addEventListener('click', () => toggleTabela(tabelaMes));
    tabelaAno.querySelector('thead').addEventListener('click', () => toggleTabela(tabelaAno));

    // Inicializar todas as tabelas como fechadas
    document.querySelectorAll('table tbody').forEach(tbody => {
        tbody.style.display = 'none';
    });

    // Função para carregar movimentações diárias
    async function carregarMovimentacoesDiarias() {
        try {
            const hoje = new Date().toISOString().split('T')[0];
            const response = await fetch(`${baseUrl}/api/estoque/movimentacao?dataInicio=${hoje}&dataFim=${hoje}`, {
                headers: headers
            });
            
            const movimentacoes = await response.json();
            console.log('dia: ', movimentacoes);
            preencherTabelaDia(movimentacoes);
        } catch (error) {
            console.error('Erro ao carregar movimentações diárias:', error);
            // Criar linha de erro mesmo se a API falhar
            const tbody = document.querySelector('#table-dia tbody');
            tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar movimentações</td></tr>';
        }
    }

    // Função para carregar movimentações semanais
    async function carregarMovimentacoesSemanais() {
        try {
            const hoje = new Date();
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo da semana atual
            
            const response = await fetch(`${baseUrl}/api/estoque/movimentacao?dataInicio=${inicioSemana.toISOString().split('T')[0]}&dataFim=${hoje.toISOString().split('T')[0]}`, {
                headers: headers
            });
            
            const movimentacoes = await response.json();
            console.log('semana: ', movimentacoes);
            preencherTabelaSemana(movimentacoes);
        } catch (error) {
            console.error('Erro ao carregar movimentações semanais:', error);
            // Criar linha de erro mesmo se a API falhar
            const tbody = document.querySelector('#table-semana tbody');
            tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar movimentações</td></tr>';
        }
    }

    // Função para carregar movimentações mensais
    async function carregarMovimentacoesMensais() {
        try {
            const hoje = new Date();
            const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            
            const response = await fetch(`${baseUrl}/api/estoque/movimentacao?dataInicio=${inicioMes.toISOString().split('T')[0]}&dataFim=${hoje.toISOString().split('T')[0]}`, {
                headers: headers
            });
            
            const movimentacoes = await response.json();
            console.log('mes: ', movimentacoes);
            preencherTabelaMes(movimentacoes);
        } catch (error) {
            console.error('Erro ao carregar movimentações mensais:', error);
            // Criar linha de erro mesmo se a API falhar
            const tbody = document.querySelector('#table-mes tbody');
            tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar movimentações</td></tr>';
        }
    }

    // Função para carregar movimentações anuais
    async function carregarMovimentacoesAnuais() {
        try {
            const hoje = new Date();
            const inicioAno = new Date(hoje.getFullYear(), 0, 1);
            
            const response = await fetch(`${baseUrl}/api/estoque/movimentacao?dataInicio=${inicioAno.toISOString().split('T')[0]}&dataFim=${hoje.toISOString().split('T')[0]}`, {
                headers: headers
            });
            
            const movimentacoes = await response.json();
            console.log('ano: ', movimentacoes);
            preencherTabelaAno(movimentacoes);
        } catch (error) {
            console.error('Erro ao carregar movimentações anuais:', error);
            // Criar linha de erro mesmo se a API falhar
            const tbody = document.querySelector('#table-ano tbody');
            tbody.innerHTML = '<tr><td colspan="2">Erro ao carregar movimentações</td></tr>';
        }
    }

    // Funções para preencher as tabelas
    function preencherTabelaDia(movimentacoes) {
        const tbody = document.querySelector('#table-dia tbody');
        tbody.innerHTML = '';
        
        if (!movimentacoes || movimentacoes.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="2">Nenhuma movimentação encontrada</td>';
            tbody.appendChild(row);
            return;
        }
        
        // Calcular totais
        const totalEntradas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'E')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
            
        const totalSaidas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'S')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
        
        // Criar linhas
        const rowEntradas = document.createElement('tr');
        rowEntradas.innerHTML = `
            <td>Entradas</td>
            <td>${formatarMoeda(totalEntradas)}</td>
        `;
        tbody.appendChild(rowEntradas);
        
        const rowSaidas = document.createElement('tr');
        rowSaidas.innerHTML = `
            <td>Saídas</td>
            <td>${formatarMoeda(totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaidas);
        
        const rowSaldo = document.createElement('tr');
        rowSaldo.innerHTML = `
            <td>Saldo</td>
            <td>${formatarMoeda(totalEntradas - totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaldo);
    }

    function preencherTabelaSemana(movimentacoes) {
        const tbody = document.querySelector('#table-semana tbody');
        tbody.innerHTML = '';
        
        if (!movimentacoes || movimentacoes.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="2">Nenhuma movimentação encontrada</td>';
            tbody.appendChild(row);
            return;
        }
        
        // Calcular totais
        const totalEntradas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'E')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
            
        const totalSaidas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'S')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
        
        // Criar linhas
        const rowEntradas = document.createElement('tr');
        rowEntradas.innerHTML = `
            <td>Entradas</td>
            <td>${formatarMoeda(totalEntradas)}</td>
        `;
        tbody.appendChild(rowEntradas);
        
        const rowSaidas = document.createElement('tr');
        rowSaidas.innerHTML = `
            <td>Saídas</td>
            <td>${formatarMoeda(totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaidas);
        
        const rowSaldo = document.createElement('tr');
        rowSaldo.innerHTML = `
            <td>Saldo</td>
            <td>${formatarMoeda(totalEntradas - totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaldo);
    }

    function preencherTabelaMes(movimentacoes) {
        const tbody = document.querySelector('#table-mes tbody');
        tbody.innerHTML = '';
        
        if (!movimentacoes || movimentacoes.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="2">Nenhuma movimentação encontrada</td>';
            tbody.appendChild(row);
            return;
        }
        
        // Calcular totais
        const totalEntradas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'E')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
            
        const totalSaidas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'S')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
        
        // Criar linhas
        const rowEntradas = document.createElement('tr');
        rowEntradas.innerHTML = `
            <td>Entradas</td>
            <td>${formatarMoeda(totalEntradas)}</td>
        `;
        tbody.appendChild(rowEntradas);
        
        const rowSaidas = document.createElement('tr');
        rowSaidas.innerHTML = `
            <td>Saídas</td>
            <td>${formatarMoeda(totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaidas);
        
        const rowSaldo = document.createElement('tr');
        rowSaldo.innerHTML = `
            <td>Saldo</td>
            <td>${formatarMoeda(totalEntradas - totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaldo);
    }

    function preencherTabelaAno(movimentacoes) {
        const tbody = document.querySelector('#table-ano tbody');
        tbody.innerHTML = '';
        
        if (!movimentacoes || movimentacoes.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="2">Nenhuma movimentação encontrada</td>';
            tbody.appendChild(row);
            return;
        }
        
        // Calcular totais
        const totalEntradas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'E')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
            
        const totalSaidas = movimentacoes
            .filter(m => m.id_tipo_movimentacao === 'S')
            .reduce((sum, m) => sum + parseFloat(m.preco_total || 0), 0);
        
        // Criar linhas
        const rowEntradas = document.createElement('tr');
        rowEntradas.innerHTML = `
            <td>Entradas</td>
            <td>${formatarMoeda(totalEntradas)}</td>
        `;
        tbody.appendChild(rowEntradas);
        
        const rowSaidas = document.createElement('tr');
        rowSaidas.innerHTML = `
            <td>Saídas</td>
            <td>${formatarMoeda(totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaidas);
        
        const rowSaldo = document.createElement('tr');
        rowSaldo.innerHTML = `
            <td>Saldo</td>
            <td>${formatarMoeda(totalEntradas - totalSaidas)}</td>
        `;
        tbody.appendChild(rowSaldo);
    }

    // Função para formatar valores monetários
    function formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }

    // Carregar dados ao iniciar
    carregarMovimentacoesDiarias();
    carregarMovimentacoesSemanais();
    carregarMovimentacoesMensais();
    carregarMovimentacoesAnuais();

    // Implementar logout
    document.querySelector('#sairLogin').addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('funcionario');
        window.location.href = 'telalogin.html';
    });
});